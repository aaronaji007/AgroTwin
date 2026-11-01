import React, { useState } from "react";
import {
  Cpu,
  Boxes,
  Clock,
  AlertTriangle,
  Sparkles,
  Info,
  ShieldAlert,
  Flame,
  CheckCircle2
} from "lucide-react";
import { BatchCard } from "./BatchCard";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { useTelemetry } from "../../context/TelemetryContext";

export function DigitalTwinPanel() {
  const { batches } = useTelemetry();
  const [selectedCommodity, setSelectedCommodity] = useState("Honeycrisp Apples");

  const atRiskBatches = batches.filter(b => b.riskLevel !== "LOW");

  return (
    <div className="space-y-6">
      {/* Top Banner: Digital Twin Overview */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0f1724] via-[#121c2b] to-[#141824] border border-[#1e2d42] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-mono">
                AgroTwin™ Hydro-Thermal Digital Twin Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Biophysical digital replica tracking enzymatic kinetics, Vapor Pressure Deficit (VPD) desiccation,
              and climacteric ethylene triggering to predict produce Shelf-Life Index (SLI) in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-[#141e2e] border border-[#203147] text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">Tracked Biomass</span>
              <span className="text-cyan-300 font-bold text-sm">
                {batches.reduce((acc, b) => acc + b.quantityMetricTons, 0).toFixed(1)} MT
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#141e2e] border border-[#203147] text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">Asset Exposure</span>
              <span className="text-emerald-400 font-bold text-sm">
                ${(batches.reduce((acc, b) => acc + b.marketValueUsd, 0) / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>

        {/* Automated Spoilage Risk Alert Bar */}
        {atRiskBatches.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Automated Spoilage Warning:</strong> {atRiskBatches.length} batch(es) experiencing accelerated quality decay.
                Prioritize fulfillment or adjust chamber atmospheric scrubbers.
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 uppercase font-bold shrink-0">
              Action Advised
            </span>
          </div>
        )}
      </div>

      {/* 1. What-If Scenario Simulator */}
      <WhatIfSimulator
        selectedCommodity={selectedCommodity}
      />

      {/* 2. Visual Status Representation of Produce Batches & Countdown Timers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Produce Batches & Dynamic SLI Timers</span>
            </h3>
            <p className="text-xs text-slate-400">
              Active inventory batches linked to physical chamber sensor telemetry
            </p>
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
