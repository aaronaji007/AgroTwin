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
import { Cpu } from "lucide-react";

function DashboardContent() {
  const { activeTab, loading } = useTelemetry();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] font-mono text-cyan-400 gap-3">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.2)] animate-pulse">
          <Cpu className="w-6 h-6 text-cyan-300 animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider">INITIALIZING AGROTWIN-SHARE SCADA...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0f17] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {activeTab === "overview" && <OverviewView />}
        {activeTab === "bins" && <BinDetailView />}
        {activeTab === "digitaltwin" && <DigitalTwinPanel />}
        {activeTab === "batches" && <BatchesView />}
        {activeTab === "alerts" && <AlertsView />}
      </div>

      {/* Global Modals / Drawers */}
      <AlertDrawer />
      <ThresholdModal />
    </div>
  );
}

export default function App() {
  return (
    <TelemetryProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f17] text-slate-100 font-sans">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <DashboardContent />
        </div>
      </div>
    </TelemetryProvider>
  );
}
