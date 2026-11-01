import React from "react";
import { GaugeRing } from "../common/GaugeRing";

export function BatchCard({ batch, onSelectCommodity }) {
  const getRiskTag = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return {
          border: "border-[#FF3333]/50 bg-[#1A0A0A] text-[#FF3333]",
          label: "[ SPOILAGE HAZARD ]"
        };
      case "MEDIUM":
        return {
          border: "border-[#FFB000]/40 bg-[#161208] text-[#FFB000]",
          label: "[ ACCELERATED DECAY ]"
        };
      default:
        return {
          border: "border-[#00FF66]/30 bg-[#0A160E] text-[#00FF66]",
          label: "[ OPTIMAL PRESERVATION ]"
        };
    }
  };

  const riskTag = getRiskTag(batch.riskLevel);
  const daysRemaining = Math.max(1, Math.round((batch.currentSli / 100) * batch.nominalShelfLifeDays));

  return (
    <div className="min-h-[320px] bg-[#0A0A0A] border border-[#262626] p-6 transition-colors duration-100 hover:border-[#404040] flex flex-col justify-between select-none font-mono">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">
              <span className="text-white font-bold">{batch.id}</span> // {batch.binName}
            </div>
            <h3 className="font-serif italic text-2xl lg:text-3xl text-white font-normal mt-1 tracking-tight">
              {batch.commodity}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
              {batch.variety} <span className="text-neutral-400">•</span> {batch.category}
            </p>
          </div>
          <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${riskTag.border}`}>
            {riskTag.label}
          </span>
        </div>

        {/* Dynamic Countdown & Freshness Gauge */}
        <div className="my-4 p-4 border border-[#202020] bg-[#0E0E0E] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">
              SHELF-LIFE COUNTDOWN
            </div>
            <div className="font-serif italic text-2xl lg:text-3xl text-white font-normal mt-0.5 tracking-tight flex items-baseline gap-2">
              <span>{daysRemaining}</span>
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Days Safe
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 uppercase">
              RETAINED QUALITY: <strong className="text-white">{batch.currentSli}%</strong>
            </div>
          </div>
          <GaugeRing value={batch.currentSli} size={64} label="SLI" />
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-px bg-[#262626] border border-[#262626] text-xs my-2">
          <div className="p-2.5 bg-[#0A0A0A]">
            <span className="text-neutral-400 text-[10px] block uppercase">BIOMASS:</span>
            <span className="text-white font-bold">{batch.quantityMetricTons} MT</span>
          </div>
          <div className="p-2.5 bg-[#0A0A0A]">
            <span className="text-neutral-400 text-[10px] block uppercase">ASSET VALUE:</span>
            <span className="text-[#00FF66] font-bold">${batch.marketValueUsd.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-[#0A0A0A]">
            <span className="text-neutral-400 text-[10px] block uppercase">HARVEST:</span>
            <span className="text-neutral-300 font-bold">{batch.harvestDate}</span>
          </div>
          <div className="p-2.5 bg-[#0A0A0A]">
            <span className="text-neutral-400 text-[10px] block uppercase">HORIZON:</span>
            <span className="text-[#FFB000] font-bold">{batch.projectedSpoilageDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs">
        <span className="text-neutral-400 text-[10px] uppercase tracking-wider">{batch.qualityGrade}</span>
        <button
          onClick={() => onSelectCommodity(batch.commodity)}
          className="text-white hover:text-[#00FF66] transition-colors duration-100 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
        >
          [ SIMULATE IN TWIN &rarr; ]
        </button>
      </div>
    </div>
  );
}
