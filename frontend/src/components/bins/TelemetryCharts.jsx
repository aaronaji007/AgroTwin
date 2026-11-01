import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

export function TelemetryCharts({ history = [], thresholds, produceName }) {
  const [activeChart, setActiveChart] = useState("hydrothermal"); // "hydrothermal" | "ethylene" | "sli"

  // Raw Brutalist Monospace Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-[#050505] border border-[#404040] p-3 font-mono text-xs select-none">
        <div className="text-neutral-400 font-bold mb-2 pb-1 border-b border-[#222222] uppercase tracking-wider">
          TIMESTAMP: {label}
        </div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-6 py-0.5">
            <span className="text-neutral-400 uppercase tracking-widest text-[10px]">
              {item.name}:
            </span>
            <span className="font-bold text-white">
              {item.value} {item.unit || ""}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] p-6 select-none">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[#202020]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            [ OSCILLOSCOPE TRACE // CH-01 ]
          </div>
          <h3 className="font-serif italic text-2xl lg:text-3xl text-white font-normal mt-0.5 tracking-tight">
            High-Contrast Time-Series Telemetry
          </h3>
          <p className="font-mono text-[11px] text-neutral-400 mt-1 uppercase">
            Commodity: <strong className="text-white">{produceName}</strong> • Resolution: 1-Hour Ticks
          </p>
        </div>

        {/* Mechanical Tab Switcher */}
        <div className="flex items-center border border-[#262626] bg-[#111111] p-0.5 font-mono text-xs">
          <button
            onClick={() => setActiveChart("hydrothermal")}
            className={`px-3 py-1.5 uppercase tracking-wider transition-all duration-100 cursor-pointer ${
              activeChart === "hydrothermal"
                ? "bg-[#EDEDED] text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            [ TEMP / RH ]
          </button>
          <button
            onClick={() => setActiveChart("ethylene")}
            className={`px-3 py-1.5 uppercase tracking-wider transition-all duration-100 cursor-pointer ${
              activeChart === "ethylene"
                ? "bg-[#FFB000] text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            [ C₂H₄ FLUX ]
          </button>
          <button
            onClick={() => setActiveChart("sli")}
            className={`px-3 py-1.5 uppercase tracking-wider transition-all duration-100 cursor-pointer ${
              activeChart === "sli"
                ? "bg-[#00FF66] text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            [ SLI DECAY ]
          </button>
        </div>
      </div>

      {/* Main Chart Scope */}
      <div className="w-full h-80 bg-[#080808] border border-[#1A1A1A] p-2">
        {activeChart === "hydrothermal" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1F1F1F" />
              <XAxis dataKey="timeLabel" stroke="#444444" tick={{ fill: "#666666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              
              {/* Left Y Axis: Temp */}
              <YAxis
                yAxisId="temp"
                domain={['auto', 'auto']}
                stroke="#EDEDED"
                tick={{ fill: "#EDEDED", fontSize: 10, fontFamily: "JetBrains Mono" }}
                unit="°C"
              />
              
              {/* Right Y Axis: Humidity */}
              <YAxis
                yAxisId="rh"
                orientation="right"
                domain={[70, 100]}
                stroke="#888888"
                tick={{ fill: "#888888", fontSize: 10, fontFamily: "JetBrains Mono" }}
                unit="%"
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />

              {/* Threshold indicator lines */}
              {thresholds && (
                <>
                  <ReferenceLine
                    yAxisId="temp"
                    y={thresholds.maxTemp}
                    stroke="#FF3333"
                    strokeDasharray="4 4"
                    label={{ value: `[ MAX: ${thresholds.maxTemp}°C ]`, fill: "#FF3333", fontSize: 9, fontFamily: "JetBrains Mono", position: "insideTopRight" }}
                  />
                  <ReferenceLine
                    yAxisId="temp"
                    y={thresholds.minTemp}
                    stroke="#FFB000"
                    strokeDasharray="4 4"
                    label={{ value: `[ MIN: ${thresholds.minTemp}°C ]`, fill: "#FFB000", fontSize: 9, fontFamily: "JetBrains Mono", position: "insideBottomRight" }}
                  />
                </>
              )}

              <Line
                yAxisId="temp"
                type="linear"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#EDEDED"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="rh"
                type="linear"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#666666"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === "ethylene" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1F1F1F" />
              <XAxis dataKey="timeLabel" stroke="#444444" tick={{ fill: "#666666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis
                domain={[0, 'dataMax + 0.2']}
                stroke="#FFB000"
                tick={{ fill: "#FFB000", fontSize: 10, fontFamily: "JetBrains Mono" }}
                unit=" ppm"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />

              {thresholds && (
                <ReferenceLine
                  y={thresholds.maxEthylene}
                  stroke="#FF3333"
                  strokeDasharray="4 4"
                  label={{ value: `[ CEILING LIMIT: ${thresholds.maxEthylene} ppm ]`, fill: "#FF3333", fontSize: 9, fontFamily: "JetBrains Mono", position: "top" }}
                />
              )}

              <Line
                type="stepAfter"
                dataKey="ethylenePpm"
                name="Ethylene Concentration (ppm)"
                stroke="#FFB000"
                strokeWidth={2}
                dot={{ r: 2, fill: "#FFB000" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === "sli" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1F1F1F" />
              <XAxis dataKey="timeLabel" stroke="#444444" tick={{ fill: "#666666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis
                domain={[50, 100]}
                stroke="#00FF66"
                tick={{ fill: "#00FF66", fontSize: 10, fontFamily: "JetBrains Mono" }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />

              <ReferenceLine
                y={75}
                stroke="#FFB000"
                strokeDasharray="4 4"
                label={{ value: "[ ACTION THRESHOLD: 75% ]", fill: "#FFB000", fontSize: 9, fontFamily: "JetBrains Mono", position: "top" }}
              />

              <Line
                type="linear"
                dataKey="sli"
                name="Shelf-Life Index (SLI %)"
                stroke="#00FF66"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Raw Oscilloscope Legend */}
      <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex flex-wrap items-center justify-between font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
        <span>SAMPLING: CONTINUOUS 1-HOUR TELEMETRY BUFFER</span>
        <span>INSTRUMENTATION // HIGH PRECISION ZERO GLOW</span>
      </div>
    </div>
  );
}
