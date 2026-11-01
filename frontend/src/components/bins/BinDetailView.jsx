import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Box,
  Layers,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  RotateCcw
} from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { GaugeRing } from "../common/GaugeRing";
import { TelemetryCharts } from "./TelemetryCharts";
import { ActuatorControls } from "./ActuatorControls";
import { useTelemetry } from "../../context/TelemetryContext";
import { fetchBinHistory } from "../../services/api";

export function BinDetailView() {
  const {
    bins,
    selectedBinId,
    setSelectedBinId,
    selectedBin,
    batches
  } = useTelemetry();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load time-series history when selected bin changes
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!selectedBinId) return;
      try {
        setLoadingHistory(true);
        const data = await fetchBinHistory(selectedBinId, "24h");
        if (isMounted) setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [selectedBinId, selectedBin?.telemetry?.timestamp]);

  if (!selectedBin) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        No storage bin selected.
      </div>
    );
  }

  const batch = batches.find(b => b.id === selectedBin.batchId) || null;

  return (
    <div className="space-y-6">
      {/* 1. Chamber Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {bins.map(bin => {
          const isSelected = bin.id === selectedBinId;
          return (
            <button
              key={bin.id}
              onClick={() => setSelectedBinId(bin.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                  : "bg-[#0f1724] text-slate-400 border border-[#1e2d42] hover:text-white hover:bg-[#141f2f]"
              }`}
            >
              <span className="font-bold">{bin.code}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{bin.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  bin.status === "CRITICAL"
                    ? "bg-rose-500 animate-ping"
                    : bin.status === "WARNING"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* 2. Selected Chamber Main Info Header */}
      <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {selectedBin.code}
              </span>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-mono">
                {selectedBin.name}
              </h2>
              <StatusBadge status={selectedBin.status} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                Commodity: <strong className="text-white">{selectedBin.produceName}</strong> ({selectedBin.variety})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Zone: {selectedBin.zone}
              </span>
              <span>•</span>
              <span>
                Occupancy: {selectedBin.currentPallets} / {selectedBin.capacityPallets} Pallets
              </span>
            </div>
          </div>

          {/* Shelf Life Countdown Capsule */}
          <div className="flex items-center gap-4 bg-[#141e2e] border border-[#203147] px-4 py-2.5 rounded-xl shrink-0">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Shelf-Life Index (SLI)
              </div>
              <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
                <span>{selectedBin.telemetry.sli}%</span>
                <span className="text-xs text-emerald-400 font-normal">
                  ~{Math.round(selectedBin.estimatedDaysRemaining)}d Left
                </span>
              </div>
            </div>
            <GaugeRing value={selectedBin.telemetry.sli} size={54} strokeWidth={5} label="" />
          </div>
        </div>

        {/* Live Vitals Strip (4 metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1a2638]">
          {/* Temperature */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                TEMPERATURE
              </span>
              <span className="font-mono text-[10px]">
                Lim: {selectedBin.thresholds.minTemp}-{selectedBin.thresholds.maxTemp}°C
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {selectedBin.telemetry.temperature.toFixed(2)}
              <span className="text-sm font-normal text-slate-400 ml-1">°C</span>
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                RELATIVE HUMIDITY
              </span>
              <span className="font-mono text-[10px]">
                Lim: {selectedBin.thresholds.minHumidity}-{selectedBin.thresholds.maxHumidity}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {selectedBin.telemetry.humidity.toFixed(1)}
              <span className="text-sm font-normal text-slate-400 ml-1">%</span>
            </div>
          </div>

          {/* Ethylene */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Wind className="w-3.5 h-3.5 text-purple-400" />
                ETHYLENE (C₂H₄)
              </span>
              <span className="font-mono text-[10px]">
                Lim: &lt;{selectedBin.thresholds.maxEthylene} ppm
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {selectedBin.telemetry.ethylenePpm.toFixed(3)}
              <span className="text-sm font-normal text-slate-400 ml-1">ppm</span>
            </div>
          </div>

          {/* VPD */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                VAPOR PRESSURE DEFICIT
              </span>
              <span className="font-mono text-[10px]">
                Transpiration Stress
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {selectedBin.telemetry.vpdKpa.toFixed(2)}
              <span className="text-sm font-normal text-slate-400 ml-1">kPa</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Left Charts (2 cols), Right Actuators (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TelemetryCharts
            history={history}
            thresholds={selectedBin.thresholds}
            produceName={selectedBin.produceName}
          />

          {/* Produce Batch Biological Dossier */}
          {batch && (
            <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Batch Biological Dossier & Post-Harvest Record</span>
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {batch.qualityGrade}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#131d2b] border border-[#203147]">
                  <div className="text-slate-400 text-[10px]">Batch ID</div>
                  <div className="text-white font-semibold mt-0.5">{batch.id}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#131d2b] border border-[#203147]">
                  <div className="text-slate-400 text-[10px]">Harvest Date</div>
                  <div className="text-white font-semibold mt-0.5">{batch.harvestDate}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#131d2b] border border-[#203147]">
                  <div className="text-slate-400 text-[10px]">Intake Date</div>
                  <div className="text-white font-semibold mt-0.5">{batch.intakeDate}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#131d2b] border border-[#203147]">
                  <div className="text-slate-400 text-[10px]">Batch Asset Value</div>
                  <div className="text-emerald-400 font-semibold mt-0.5">${batch.marketValueUsd.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actuators and Stress Testing */}
        <div className="lg:col-span-1">
          <ActuatorControls bin={selectedBin} />
        </div>
      </div>
    </div>
  );
}
