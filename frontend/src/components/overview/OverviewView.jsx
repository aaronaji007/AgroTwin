import React from "react";
import {
  Boxes,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { BinCard } from "./BinCard";
import { useTelemetry } from "../../context/TelemetryContext";

export function OverviewView() {
  const {
    bins,
    summary,
    setSelectedBinId,
    setActiveTab,
    triggerEvent
  } = useTelemetry();

  const handleInspectBin = (binId) => {
    setSelectedBinId(binId);
    setActiveTab("bins");
  };

  const ethyleneSpikes = bins.filter(
    b => b.telemetry.ethylenePpm > b.thresholds.maxEthylene
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-mono flex items-center gap-2">
            Facility Overview & Telemetry Matrix
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time hydro-thermal monitoring & Shelf-Life Index (SLI) telemetry across 5 active post-harvest bins
          </p>
        </div>

        {/* Quick Simulation Injector Dock */}
        <div className="flex items-center gap-2 bg-[#121c2b] border border-[#203147] p-1.5 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick Anomaly Inject:
          </span>
          <button
            onClick={() => triggerEvent("BIN-02", "ETHYLENE_SPIKE")}
            className="px-2.5 py-1 text-xs rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all font-mono cursor-pointer"
            title="Inject 0.65 ppm ethylene spike into Ripening Chamber Beta"
          >
            +C₂H₄ Spike
          </button>
          <button
            onClick={() => triggerEvent("BIN-01", "DOOR_OPEN")}
            className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all font-mono cursor-pointer"
            title="Simulate door ajar thermal leak in Cold Room Alpha"
          >
            +Door Leak
          </button>
          <button
            onClick={() => triggerEvent("BIN-01", "RESTORE_OPTIMAL")}
            className="px-2 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all font-mono cursor-pointer"
            title="Restore ideal cold storage setpoints"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Active Bins */}
        <MetricCard
          title="Active Storage Bins"
          value={summary ? `${summary.activeBins} / ${summary.totalBins}` : `${bins.length} / ${bins.length}`}
          unit="CHAMBERS"
          icon={Boxes}
          accentColor="cyan"
          trend="flat"
          trendLabel="100% Online"
          trendType="positive"
          subtext="5/5 Micro-zones active"
        />

        {/* 2. Average Temperature */}
        <MetricCard
          title="Avg Chamber Temp"
          value={summary ? summary.avgTemperature.toFixed(1) : "6.7"}
          unit="°C"
          icon={Thermometer}
          accentColor="emerald"
          trend="up"
          trendLabel="Optimal Range"
          trendType="positive"
          subtext="Setpoints: 0.5°C to 14.5°C"
        />

        {/* 3. Average Humidity */}
        <MetricCard
          title="Avg Relative Humidity"
          value={summary ? summary.avgHumidity.toFixed(1) : "90.5"}
          unit="%"
          icon={Droplets}
          accentColor="cyan"
          trend="flat"
          trendLabel="High Moisture"
          trendType="positive"
          subtext="Prevents Produce Desiccation"
        />

        {/* 4. Ethylene Spikes */}
        <MetricCard
          title="Ethylene Spikes"
          value={summary ? `${summary.warningCount + ethyleneSpikes}` : `${ethyleneSpikes}`}
          unit="ACTIVE"
          icon={Wind}
          accentColor={ethyleneSpikes > 0 ? "amber" : "emerald"}
          trend={ethyleneSpikes > 0 ? "up" : "flat"}
          trendLabel={ethyleneSpikes > 0 ? "Surge Warning" : "Nominal"}
          trendType={ethyleneSpikes > 0 ? "warning" : "positive"}
          subtext={ethyleneSpikes > 0 ? "Ripening chamber threshold" : "Zero hazardous leaks"}
        />

        {/* 5. Overall Inventory Health */}
        <MetricCard
          title="Overall Inventory Health"
          value={summary ? `${summary.avgSli.toFixed(0)}%` : "85%"}
          unit="SLI"
          icon={ShieldCheck}
          accentColor="purple"
          trend="down"
          trendLabel="Grade A Export"
          trendType="positive"
          subtext={`$${summary ? (summary.totalInventoryValueUsd / 1000).toFixed(0) : "193"}k Total Pallet Value`}
        />
      </div>

      {/* QUICK STATUS HEALTH GRIDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>Storage Chambers SCADA Matrix</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                (Click any bin to open multi-axis Recharts & digital twin diagnostics)
              </span>
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("bins")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Full Detail View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bins.map(bin => (
            <BinCard key={bin.id} bin={bin} onInspect={handleInspectBin} />
          ))}
        </div>
      </div>
    </div>
  );
}
