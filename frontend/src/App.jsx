import React from "react";
import { TelemetryProvider, useTelemetry } from "./context/TelemetryContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { OverviewView } from "./components/overview/OverviewView";
import { BinDetailView } from "./components/bins/BinDetailView";
import { DigitalTwinPanel } from "./components/digitaltwin/DigitalTwinPanel";
import { BatchesView } from "./components/batches/BatchesView";
import { AlertsView } from "./components/alerts/AlertsView";
import { AlertDrawer } from "./components/alerts/AlertDrawer";
import { ThresholdModal } from "./components/alerts/ThresholdModal";

function DashboardContent() {
  const { activeTab, loading, isProximityAlertActive, isAudioMuted, toggleAudioMute } = useTelemetry();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] font-mono text-neutral-400 gap-4 bg-[#0A0A0A] select-none">
        <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-white">
          [ INITIALIZING AGROTWIN-SHARE HARDWARE TERMINAL... ]
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-4 lg:p-8 flex flex-col">
      {/* Reactor Proximity Meltdown Siren Alert Banner */}
      {isProximityAlertActive && (
        <div className="mb-6 bg-[#FF0033] text-black px-4 py-2.5 font-mono text-xs uppercase font-extrabold flex flex-wrap items-center justify-between gap-3 animate-pulse tracking-widest border border-white select-none">
          <div className="flex items-center gap-3">
            <span className="text-lg">☢</span>
            <span>CRITICAL PROXIMITY ALERT: ULTRASONIC TRANSDUCER DETECTED OBSTACLE AT &lt; 5.0 CM — CONTAINMENT ALARM ACTIVE</span>
          </div>
          <button
            onClick={toggleAudioMute}
            className="px-3 py-1 bg-black text-[#FF0033] hover:text-white border border-black font-mono text-xs cursor-pointer font-bold"
          >
            {isAudioMuted ? "[ UNMUTE SIREN ]" : "[ SILENCE SIREN ]"}
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto flex-1 w-full">
        {activeTab === "overview" && <OverviewView />}
        {activeTab === "bins" && <BinDetailView />}
        {activeTab === "digitaltwin" && <DigitalTwinPanel />}
        {activeTab === "batches" && <BatchesView />}
        {activeTab === "alerts" && <AlertsView />}
      </div>

      {/* Global Modals / Drawers */}
      <AlertDrawer />
      <ThresholdModal />
    </main>
  );
}

export default function App() {
  return (
    <TelemetryProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0A] text-[#EDEDED] font-sans">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <DashboardContent />
        </div>
      </div>
    </TelemetryProvider>
  );
}
