import { reactorAudio } from "../services/audioAlert";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  isMockEnabled,
  setMockEnabled,
  fetchBins,
  fetchBatches,
  fetchAlerts,
  fetchSystemSummary,
  updateBinThresholds as apiUpdateThresholds,
  simulateBinEvent as apiSimulateEvent,
  acknowledgeAlert as apiAckAlert,
  ingestESP32Telemetry,
  mockStore
} from "../services/api";

const TelemetryContext = createContext(null);

export function TelemetryProvider({ children }) {
  const [useMock, setUseMock] = useState(isMockEnabled());
  const [bins, setBins] = useState([]);
  const [batches, setBatches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedBinId, setSelectedBinId] = useState("BIN-01");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "bins" | "digitaltwin" | "batches" | "alerts"
  const [loading, setLoading] = useState(true);
  const [lastPulse, setLastPulse] = useState(Date.now());
  const [backendError, setBackendError] = useState(null);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [targetConfigBin, setTargetConfigBin] = useState(null);

  const [isProximityAlertActive, setIsProximityAlertActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Ultrasonic Proximity Alarm Monitor (< 5.0 cm triggers nuclear reactor meltdown siren)
  useEffect(() => {
    const criticalBin = bins.find(b => {
      const dist = b.hardware?.ultrasonic?.distanceCm;
      return typeof dist === "number" && dist > 0 && dist < 5.0;
    });

    if (criticalBin) {
      setIsProximityAlertActive(true);
      if (!isAudioMuted) {
        reactorAudio.startSiren();
      }
    } else {
      setIsProximityAlertActive(false);
      reactorAudio.stopSiren();
    }
  }, [bins, isAudioMuted]);

  const toggleAudioMute = () => {
    const muted = reactorAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const triggerTestSiren = (seconds = 3) => {
    reactorAudio.initContext();
    reactorAudio.startSiren();
    setIsProximityAlertActive(true);
    setTimeout(() => {
      reactorAudio.stopSiren();
      setIsProximityAlertActive(false);
    }, seconds * 1000);
  };

  // Load initial data
  const loadAllData = useCallback(async () => {
    try {
      setBackendError(null);
      const [binsData, batchesData, alertsData, summaryData] = await Promise.all([
        fetchBins(),
        fetchBatches(),
        fetchAlerts(),
        fetchSystemSummary()
      ]);
      setBins(binsData);
      setBatches(batchesData);
      setAlerts(alertsData);
      setSummary(summaryData);
      setLastPulse(Date.now());
    } catch (err) {
      console.error("Telemetry load failed:", err);
      setBackendError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData, useMock]);

  // Dynamic real-time fluctuation effect utilizing setInterval
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (useMock) {
        // Gently fluctuate values in real-time
        const updatedBins = mockStore.fluctuateAll();
        setBins(updatedBins);
        setSummary(mockStore.getSummary());
        setBatches(mockStore.getBatches());
        setAlerts(mockStore.getAlerts());
        setLastPulse(Date.now());
      } else {
        // Live polling from FastAPI backend
        try {
          const [binsData, summaryData, alertsData] = await Promise.all([
            fetchBins(),
            fetchSystemSummary(),
            fetchAlerts()
          ]);
          setBins(binsData);
          setSummary(summaryData);
          setAlerts(alertsData);
          setLastPulse(Date.now());
          setBackendError(null);
        } catch (err) {
          setBackendError("Backend connection dropped: " + (err.message || ""));
        }
      }
    }, 3000); // 3 second pulse

    return () => clearInterval(intervalId);
  }, [useMock]);

  // Actions
  const toggleMock = (enable) => {
    setMockEnabled(enable);
    setUseMock(enable);
  };

  const triggerEvent = async (binId, eventType) => {
    try {
      const updated = await apiSimulateEvent(binId, eventType);
      // update state
      setBins(prev => prev.map(b => b.id === binId ? updated : b));
      const [sum, alr] = await Promise.all([fetchSystemSummary(), fetchAlerts()]);
      setSummary(sum);
      setAlerts(alr);
      return updated;
    } catch (err) {
      console.error("Failed to trigger simulation event:", err);
      throw err;
    }
  };

  const updateThresholds = async (binId, newThresholds) => {
    try {
      const updated = await apiUpdateThresholds(binId, newThresholds);
      setBins(prev => prev.map(b => b.id === binId ? updated : b));
      return updated;
    } catch (err) {
      console.error("Failed to update thresholds:", err);
      throw err;
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await apiAckAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  const sendESP32Telemetry = async (packet) => {
    try {
      const updatedBin = await ingestESP32Telemetry(packet);
      setBins(prev => prev.map(b => b.id === updatedBin.id ? updatedBin : b));
      setLastPulse(Date.now());
      return updatedBin;
    } catch (err) {
      console.error("Failed to send ESP32 telemetry:", err);
      throw err;
    }
  };

  const openThresholdEditor = (bin) => {
    setTargetConfigBin(bin);
    setIsThresholdModalOpen(true);
  };

  const selectedBin = bins.find(b => b.id === selectedBinId) || bins[0] || null;

  return (
    <TelemetryContext.Provider
      value={{
        bins,
        batches,
        alerts,
        summary,
        selectedBinId,
        setSelectedBinId,
        selectedBin,
        activeTab,
        setActiveTab,
        loading,
        lastPulse,
        useMock,
        toggleMock,
        backendError,
        triggerEvent,
        updateThresholds,
        acknowledgeAlert,
        isAlertDrawerOpen,
        setIsAlertDrawerOpen,
        isThresholdModalOpen,
        setIsThresholdModalOpen,
        targetConfigBin,
        sendESP32Telemetry,
        openThresholdEditor,
        refreshData: loadAllData
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
