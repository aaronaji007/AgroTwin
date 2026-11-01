import React, { useState } from "react";
import { BatchCard } from "./BatchCard";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { useTelemetry } from "../../context/TelemetryContext";

export function DigitalTwinPanel() {
  const { batches } = useTelemetry();
  const [selectedCommodity, setSelectedCommodity] = useState("Honeycrisp Apples");

  const atRiskBatches = batches.filter(b => b.riskLevel !== "LOW");

  return (
    <div className="space-y-8 select-none font-mono">
      {/* Top Banner: Biophysical Digital Twin Specifications */}
      <div className="bg-[#0A0A0A] border border-[#262626] p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[#202020]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
              <span className="text-[#00FF66]">■</span>
              <span>BIOPHYSICAL MODEL DIRECTORY // 03</span>
            </div>
            <h2 className="font-serif italic text-3xl lg:text-5xl text-white font-normal tracking-tight">
              Biophysical Digital Twin Engine
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
              Coupled biophysical decay law tracking modified Arrhenius respiration kinetics (Q10 law),
              Tetens vapor pressure deficit (VPD) moisture desiccation, and climacteric ethylene sensitivity.
            </p>
          </div>

          <div className="flex items-center gap-px bg-[#262626] border border-[#262626] shrink-0 text-xs">
            <div className="p-3 bg-[#0A0A0A]">
              <span className="text-neutral-400 text-[10px] block uppercase">TRACKED BIOMASS</span>
              <span className="text-white font-bold text-base mt-0.5 block">
                {batches.reduce((acc, b) => acc + b.quantityMetricTons, 0).toFixed(1)} MT
              </span>
            </div>
            <div className="p-3 bg-[#0A0A0A]">
              <span className="text-neutral-400 text-[10px] block uppercase">ASSET VALUE</span>
              <span className="text-[#00FF66] font-bold text-base mt-0.5 block">
                ${(batches.reduce((acc, b) => acc + b.marketValueUsd, 0) / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
        </div>

        {/* Automated Spoilage Risk Warning Tag */}
        {atRiskBatches.length > 0 && (
          <div className="mt-4 p-3 border border-[#FFB000]/40 bg-[#161208] text-[#FFB000] text-xs flex items-center justify-between gap-3 uppercase tracking-wider">
            <span>
              [ SPOILAGE WARNING ]: {atRiskBatches.length} lot(s) experiencing accelerated senescence. Immediate dispatch recommended.
            </span>
            <span className="px-2 py-0.5 border border-[#FFB000] font-bold text-[10px]">
              ACTION
            </span>
          </div>
        )}
      </div>

      {/* 1. What-If Simulator */}
      <WhatIfSimulator
        selectedCommodity={selectedCommodity}
      />

      {/* 2. Visual Status Representation of Produce Batches & Countdown Timers */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
          <div className="text-xs uppercase tracking-widest text-neutral-400">
            [ SECTION // 04 ] // PRODUCE BATCHES &amp; DYNAMIC SLI COUNTDOWN
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onSelectCommodity={(crop) => {
                setSelectedCommodity(crop);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
