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
  const { activeTab, loading } = useTelemetry();

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
    <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
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

function AppShell() {
  const { isProximityAlertActive, isAudioMuted, toggleAudioMute } = useTelemetry();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0A] text-[#EDEDED] font-sans">
      {/* NUCLEAR REACTOR PROXIMITY MELTDOWN BANNER (< 5.0 CM) */}
      {isProximityAlertActive && (
        <div className="bg-[#FF0033] text-black font-mono font-black text-xs py-2 px-4 flex items-center justify-between tracking-widest uppercase animate-pulse border-b-2 border-black z-50 shrink-0">
          <span className="flex items-center gap-2">
            <span className="text-base animate-bounce">☢</span>
            <span>CRITICAL PROXIMITY ALERT // ULTRASONIC SENSOR &lt; 5.0 CM // PRODUCE COLLISION / OVERFILL IMMINENT</span>
          </span>
          <button
            onClick={toggleAudioMute}
            className="bg-black text-[#FF0033] px-3 py-1 text-xs font-mono font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer shrink-0"
          >
            {isAudioMuted ? "[ UNMUTE SIREN ]" : "[ SILENCE SIREN ]"}
          </button>
        </div>
      )}

      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DashboardContent />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TelemetryProvider>
      <AppShell />
    </TelemetryProvider>
  );
}
