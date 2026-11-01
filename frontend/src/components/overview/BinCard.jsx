import React from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  ChevronRight,
  Fan,
  Snowflake,
  Zap,
  SlidersHorizontal
} from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { GaugeRing } from "../common/GaugeRing";
import { useTelemetry } from "../../context/TelemetryContext";

export function BinCard({ bin, onInspect }) {
  const { openThresholdEditor } = useTelemetry();

  const isTempOutOfRange =
    bin.telemetry.temperature < bin.thresholds.minTemp ||
    bin.telemetry.temperature > bin.thresholds.maxTemp;

  const isRhOutOfRange =
    bin.telemetry.humidity < bin.thresholds.minHumidity ||
    bin.telemetry.humidity > bin.thresholds.maxHumidity;

  const isEthOutOfRange = bin.telemetry.ethylenePpm > bin.thresholds.maxEthylene;

  return (
    <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] hover:border-cyan-500/40 p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,210,255,0.08)] flex flex-col justify-between group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {bin.code}
              </span>
              <h3 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                {bin.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">{bin.produceName}</span>
              <span>•</span>
              <span className="text-[11px] text-slate-400 italic">{bin.variety}</span>
            </p>
          </div>
          <StatusBadge status={bin.status} size="sm" />
        </div>

        {/* Central SLI & Countdown Row */}
        <div className="my-3 p-3 rounded-xl bg-[#141e2e] border border-[#203147] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Freshness & Shelf-Life
            </div>
            <div className="text-lg font-bold font-mono text-white flex items-baseline gap-1">
              <span>{bin.telemetry.sli}%</span>
              <span className="text-xs text-slate-400 font-normal">SLI</span>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              ~{Math.round(bin.estimatedDaysRemaining)} days remaining
            </div>
          </div>
          <GaugeRing value={bin.telemetry.sli} size={64} strokeWidth={6} label="SLI" />
        </div>

        {/* 4 Sensor Telemetry Readouts */}
        <div className="grid grid-cols-2 gap-2 my-2 text-xs">
          {/* Temperature */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              isTempOutOfRange
                ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                : "bg-[#121c2a] border-[#1d2c3e] text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                TEMP
              </span>
              <span className="font-mono text-[10px]">
                {bin.thresholds.minTemp}-{bin.thresholds.maxTemp}°C
              </span>
            </div>
            <div className="text-base font-bold font-mono text-white flex items-baseline justify-between">
              <span>{bin.telemetry.temperature.toFixed(1)}°C</span>
              {isTempOutOfRange && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase">
                  Alert
                </span>
              )}
            </div>
          </div>

          {/* Humidity */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              isRhOutOfRange
                ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                : "bg-[#121c2a] border-[#1d2c3e] text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                HUMIDITY
              </span>
              <span className="font-mono text-[10px]">
                {bin.thresholds.minHumidity}-{bin.thresholds.maxHumidity}%
              </span>
            </div>
            <div className="text-base font-bold font-mono text-white flex items-baseline justify-between">
              <span>{bin.telemetry.humidity.toFixed(1)}%</span>
              {isRhOutOfRange && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase">
                  Alert
                </span>
              )}
            </div>
          </div>

          {/* Ethylene */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              isEthOutOfRange
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                : "bg-[#121c2a] border-[#1d2c3e] text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Wind className="w-3.5 h-3.5 text-purple-400" />
                C₂H₄
              </span>
              <span className="font-mono text-[10px]">
                &lt;{bin.thresholds.maxEthylene} ppm
              </span>
            </div>
            <div className="text-base font-bold font-mono text-white flex items-baseline justify-between">
              <span>{bin.telemetry.ethylenePpm.toFixed(2)} ppm</span>
              {isEthOutOfRange && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                  Spike
                </span>
              )}
            </div>
          </div>

          {/* Vapor Pressure Deficit (VPD) */}
          <div className="p-2.5 rounded-xl bg-[#121c2a] border border-[#1d2c3e] text-slate-300">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                VPD DEFICIT
              </span>
              <span className="font-mono text-[10px]">kPa</span>
            </div>
            <div className="text-base font-bold font-mono text-white flex items-baseline justify-between">
              <span>{bin.telemetry.vpdKpa.toFixed(2)} kPa</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {bin.telemetry.vpdKpa < 0.25 ? "Optimal" : "Transpiring"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actuator Icons & Actions Footer */}
      <div className="pt-3 mt-1 border-t border-[#1a2638] flex items-center justify-between text-xs">
        {/* Actuator Statuses */}
        <div className="flex items-center gap-2 text-slate-400">
          <span
            className={`p-1.5 rounded-lg border flex items-center ${
              bin.compressorActive
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title="Cooling Compressor"
          >
            <Snowflake className="w-3.5 h-3.5" />
          </span>
          <span
            className={`p-1.5 rounded-lg border flex items-center ${
              bin.evaporatorFanActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title="Circulation Fan"
          >
            <Fan className="w-3.5 h-3.5" />
          </span>
          <span
            className={`p-1.5 rounded-lg border flex items-center ${
              bin.ethyleneScrubberActive
                ? "bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title="Ethylene Catalytic Scrubber"
          >
            <Zap className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openThresholdEditor(bin)}
            className="p-1.5 rounded-lg bg-[#141e2e] hover:bg-[#1c2a3d] border border-[#203147] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Configure Thresholds"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onInspect(bin.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all font-mono font-medium cursor-pointer"
          >
            <span>SCADA View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
