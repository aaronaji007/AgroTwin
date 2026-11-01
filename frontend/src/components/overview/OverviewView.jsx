import React from "react";
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
    <div className="space-y-8 select-none">
      {/* Editorial Page Title & Mechanical Trigger Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
            <span className="text-[#00FF66]">■</span>
            <span>SYSTEM DIRECTORY // 01 // CONTROL MATRIX</span>
          </div>
          <h2 className="font-serif italic text-3xl lg:text-5xl text-white font-normal tracking-tight">
            Facility Telemetry Matrix
          </h2>
          <p className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Real-time hydro-thermal digital twin telemetry across 5 active post-harvest chambers
          </p>
        </div>

        {/* Mechanical Anomaly Injector Switchboard */}
        <div className="flex items-center gap-2 p-1.5 border border-[#262626] bg-[#0E0E0E] font-mono text-[11px] shrink-0">
          <span className="text-neutral-400 uppercase tracking-widest px-2 hidden sm:inline">
            [ INJECT ]:
          </span>
          <button
            onClick={() => triggerEvent("BIN-02", "ETHYLENE_SPIKE")}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-[#FFB000] hover:bg-[#FFB000] hover:text-black uppercase tracking-wider transition-colors duration-100 cursor-pointer"
          >
            +C₂H₄ SPIKE
          </button>
          <button
            onClick={() => triggerEvent("BIN-01", "DOOR_OPEN")}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-[#FFB000] hover:bg-[#FFB000] hover:text-black uppercase tracking-wider transition-colors duration-100 cursor-pointer"
          >
            +DOOR LEAK
          </button>
          <button
            onClick={() => triggerEvent("BIN-01", "RESTORE_OPTIMAL")}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-neutral-300 hover:bg-white hover:text-black uppercase tracking-wider transition-colors duration-100 cursor-pointer"
          >
            CALIBRATE
          </button>
        </div>
      </div>

      {/* 5 SUMMARY METRIC CARDS (Strict 60-30-10 Swiss Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#262626] border border-[#262626]">
        {/* 1. Active Bins */}
        <MetricCard
          index="01"
          title="ACTIVE UNITS"
          value={summary ? `${summary.activeBins}/${summary.totalBins}` : `${bins.length}/${bins.length}`}
          unit="CHAMBERS"
          trendLabel="100% ONLINE"
          trendType="positive"
          subtext="ALL CELLS OPERATIONAL"
          signalColor="green"
        />

        {/* 2. Mean Temperature */}
        <MetricCard
          index="02"
          title="MEAN TEMP"
          value={summary ? summary.avgTemperature.toFixed(1) : "6.7"}
          unit="°C"
          trendLabel="NORMAL RANGE"
          trendType="positive"
          subtext="BOUNDS: 0.5°C TO 14.5°C"
          signalColor="green"
        />

        {/* 3. Mean Humidity */}
        <MetricCard
          index="03"
          title="MEAN HUMIDITY"
          value={summary ? summary.avgHumidity.toFixed(1) : "90.5"}
          unit="%"
          trendLabel="PREVENTS DRY"
          trendType="positive"
          subtext="VPD DEFICIT OPTIMIZED"
          signalColor="green"
        />

        {/* 4. Ethylene Spikes */}
        <MetricCard
          index="04"
          title="ETHYLENE SPIKES"
          value={summary ? `${summary.warningCount + ethyleneSpikes}` : `${ethyleneSpikes}`}
          unit="ACTIVE"
          trendLabel={ethyleneSpikes > 0 ? "SURGE DETECTED" : "NOMINAL"}
          trendType={ethyleneSpikes > 0 ? "warning" : "positive"}
          subtext={ethyleneSpikes > 0 ? "SCRUBBERS ENGAGED" : "ZERO FLUX DETECTED"}
          signalColor={ethyleneSpikes > 0 ? "amber" : "green"}
        />

        {/* 5. Overall Inventory Health */}
        <MetricCard
          index="05"
          title="INVENTORY SLI"
          value={summary ? `${summary.avgSli.toFixed(0)}%` : "85%"}
          unit="SLI"
          trendLabel="GRADE A EXPORT"
          trendType="positive"
          subtext={`$${summary ? (summary.totalInventoryValueUsd / 1000).toFixed(0) : "193"}K VALUATION`}
          signalColor="white"
        />
      </div>

      {/* STORAGE CHAMBER TELEMETRY GRID */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            [ SECTION // 02 ] // STORAGE CHAMBER CONTROL TERMINALS
          </div>
          <button
            onClick={() => setActiveTab("bins")}
            className="font-mono text-xs uppercase tracking-widest text-white hover:text-[#00FF66] transition-colors duration-100 flex items-center gap-1 cursor-pointer"
          >
            <span>EXPAND ALL DIAGNOSTICS &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bins.map((bin, idx) => (
            <BinCard
              key={bin.id}
              bin={bin}
              index={`0${idx + 1}`}
              onInspect={handleInspectBin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
