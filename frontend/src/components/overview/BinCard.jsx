import React from "react";
import { StatusBadge } from "../common/StatusBadge";
import { GaugeRing } from "../common/GaugeRing";
import { useTelemetry } from "../../context/TelemetryContext";

export function BinCard({ bin, index = "01", onInspect }) {
  const { openThresholdEditor } = useTelemetry();

  const isTempOutOfRange =
    bin.telemetry.temperature < bin.thresholds.minTemp ||
    bin.telemetry.temperature > bin.thresholds.maxTemp;

  const isRhOutOfRange =
    bin.telemetry.humidity < bin.thresholds.minHumidity ||
    bin.telemetry.humidity > bin.thresholds.maxHumidity;

  const isEthOutOfRange = bin.telemetry.ethylenePpm > bin.thresholds.maxEthylene;

  return (
    <div className="min-h-[340px] bg-[#0A0A0A] border border-[#262626] p-6 transition-colors duration-100 hover:border-[#404040] flex flex-col justify-between select-none">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              <span className="text-white font-bold">{bin.code}</span>
              <span>//</span>
              <span>UNIT {index}</span>
            </div>
            <h3 className="font-serif italic text-2xl lg:text-3xl text-white font-normal mt-1 tracking-tight">
              {bin.name}
            </h3>
            <p className="font-mono text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
              {bin.produceName} <span className="text-neutral-400">•</span> {bin.variety}
            </p>
          </div>
          <StatusBadge status={bin.status} size="sm" />
        </div>

        {/* Central SLI & Countdown Bar */}
        <div className="my-4 p-4 border border-[#202020] bg-[#0E0E0E] flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              DYNAMIC SHELF-LIFE PROJECTION
            </div>
            <div className="font-serif italic text-2xl lg:text-3xl text-white font-normal mt-0.5 tracking-tight flex items-baseline gap-2">
              <span>~{Math.round(bin.estimatedDaysRemaining)}</span>
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Days Remaining
              </span>
            </div>
            <div className="font-mono text-[10px] text-[#00FF66] mt-1 tracking-widest uppercase">
              DECAY FACTOR: 1.02x NOMINAL
            </div>
          </div>
          <GaugeRing value={bin.telemetry.sli} size={64} label="SLI" />
        </div>

        {/* 4 Sensor Telemetry Readouts (1px border grid) */}
        <div className="grid grid-cols-2 gap-px bg-[#262626] border border-[#262626] my-3">
          {/* Temperature */}
          <div className="p-3 bg-[#0A0A0A]">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
              <span>TEMP</span>
              <span className="text-neutral-400">{bin.thresholds.minTemp}-{bin.thresholds.maxTemp}°C</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className={`text-xl font-bold ${isTempOutOfRange ? "text-[#FF3333]" : "text-white"}`}>
                {bin.telemetry.temperature.toFixed(1)}°C
              </span>
              {isTempOutOfRange && (
                <span className="text-[9px] text-[#FF3333] font-bold">[WARN]</span>
              )}
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3 bg-[#0A0A0A]">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
              <span>HUMIDITY</span>
              <span className="text-neutral-400">{bin.thresholds.minHumidity}-{bin.thresholds.maxHumidity}%</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className={`text-xl font-bold ${isRhOutOfRange ? "text-[#FF3333]" : "text-white"}`}>
                {bin.telemetry.humidity.toFixed(1)}%
              </span>
              {isRhOutOfRange && (
                <span className="text-[9px] text-[#FF3333] font-bold">[WARN]</span>
              )}
            </div>
          </div>

          {/* Ethylene */}
          <div className="p-3 bg-[#0A0A0A]">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
              <span>ETHYLENE</span>
              <span className="text-neutral-400">&lt;{bin.thresholds.maxEthylene}</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className={`text-xl font-bold ${isEthOutOfRange ? "text-[#FFB000]" : "text-white"}`}>
                {bin.telemetry.ethylenePpm.toFixed(2)}
                <span className="text-xs font-normal text-neutral-400 ml-1">ppm</span>
              </span>
              {isEthOutOfRange && (
                <span className="text-[9px] text-[#FFB000] font-bold">[SPIKE]</span>
              )}
            </div>
          </div>

          {/* Vapor Pressure Deficit */}
          <div className="p-3 bg-[#0A0A0A]">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
              <span>VPD DEFICIT</span>
              <span className="text-neutral-400">kPa</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-white">
                {bin.telemetry.vpdKpa.toFixed(2)}
                <span className="text-xs font-normal text-neutral-400 ml-1">kPa</span>
              </span>
              <span className="text-[9px] text-[#00FF66] font-bold">
                {bin.telemetry.vpdKpa < 0.25 ? "[OPT]" : "[DRY]"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actuator Statuses & Mechanical Actions Footer */}
      <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between font-mono text-xs">
        {/* Actuator Relay Statuses */}
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-400">
          <span className={`px-1.5 py-0.5 border ${bin.compressorActive ? "border-[#00FF66]/30 text-[#00FF66]" : "border-neutral-800 text-neutral-600"}`}>
            COMP
          </span>
          <span className={`px-1.5 py-0.5 border ${bin.evaporatorFanActive ? "border-[#00FF66]/30 text-[#00FF66]" : "border-neutral-800 text-neutral-600"}`}>
            FAN
          </span>
          <span className={`px-1.5 py-0.5 border ${bin.ethyleneScrubberActive ? "border-[#FFB000]/40 text-[#FFB000]" : "border-neutral-800 text-neutral-600"}`}>
            SCRUB
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openThresholdEditor(bin)}
            className="px-2.5 py-1.5 border border-[#262626] bg-[#111111] text-neutral-300 hover:border-white hover:text-white transition-colors duration-100 uppercase tracking-wider text-[10px] cursor-pointer"
          >
            [ LIMITS ]
          </button>
          <button
            onClick={() => onInspect(bin.id)}
            className="px-3 py-1.5 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] transition-colors duration-100 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
          >
            [ INSPECT &rarr; ]
          </button>
        </div>
      </div>
    </div>
  );
}
