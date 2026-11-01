import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { Thermometer, Droplets, Wind, TrendingDown, Layers } from "lucide-react";

export function TelemetryCharts({ history = [], thresholds, produceName }) {
  const [activeChart, setActiveChart] = useState("hydrothermal"); // "hydrothermal" | "ethylene" | "sli"

  // Custom Dark SCADA Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-[#0b121e] border border-[#23354c] rounded-xl p-3 shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="text-slate-400 font-semibold mb-1.5 pb-1 border-b border-[#1c293a]">
          Time: {label}
        </div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
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
    <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] p-5">
      {/* Chart Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Time-Series Telemetry & Hydro-Thermal Dynamics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-sensor telemetry with active SCADA threshold limits
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#131b27] border border-[#23354c] rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveChart("hydrothermal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-mono font-medium cursor-pointer ${
              activeChart === "hydrothermal"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,210,255,0.15)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual Temp / RH</span>
          </button>
          <button
            onClick={() => setActiveChart("ethylene")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-mono font-medium cursor-pointer ${
              activeChart === "ethylene"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-purple-400" />
            <span>Ethylene (C₂H₄)</span>
          </button>
          <button
            onClick={() => setActiveChart("sli")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-mono font-medium cursor-pointer ${
              activeChart === "sli"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>SLI Decay Curve</span>
          </button>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="w-full h-80">
        {activeChart === "hydrothermal" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rhGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2638" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
              
              {/* Left Y Axis: Temperature */}
              <YAxis
                yAxisId="temp"
                domain={['auto', 'auto']}
                stroke="#00d2ff"
                tick={{ fill: "#00d2ff", fontSize: 11 }}
                unit="°C"
              />
              
              {/* Right Y Axis: Humidity */}
              <YAxis
                yAxisId="rh"
                orientation="right"
                domain={[70, 100]}
                stroke="#60a5fa"
                tick={{ fill: "#60a5fa", fontSize: 11 }}
                unit="%"
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, fontFamily: 'monospace' }} />

              {/* Threshold indicator lines */}
              {thresholds && (
                <>
                  <ReferenceLine
                    yAxisId="temp"
                    y={thresholds.maxTemp}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{ value: `Temp Max: ${thresholds.maxTemp}°C`, fill: "#f43f5e", fontSize: 10, position: "insideTopRight" }}
                  />
                  <ReferenceLine
                    yAxisId="temp"
                    y={thresholds.minTemp}
                    stroke="#38bdf8"
                    strokeDasharray="4 4"
                    label={{ value: `Temp Min: ${thresholds.minTemp}°C`, fill: "#38bdf8", fontSize: 10, position: "insideBottomRight" }}
                  />
                  <ReferenceLine
                    yAxisId="rh"
                    y={thresholds.minHumidity}
                    stroke="#fbbf24"
                    strokeDasharray="3 3"
                    label={{ value: `RH Min: ${thresholds.minHumidity}%`, fill: "#fbbf24", fontSize: 10, position: "insideLeft" }}
                  />
                </>
              )}

              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#00d2ff"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
              <Area
                yAxisId="rh"
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#60a5fa"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rhGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "ethylene" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ethGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2638" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis
                domain={[0, 'dataMax + 0.3']}
                stroke="#c084fc"
                tick={{ fill: "#c084fc", fontSize: 11 }}
                unit=" ppm"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, fontFamily: 'monospace' }} />

              {thresholds && (
                <ReferenceLine
                  y={thresholds.maxEthylene}
                  stroke="#f43f5e"
                  strokeDasharray="5 5"
                  label={{ value: `Max Safe Ethylene Limit: ${thresholds.maxEthylene} ppm`, fill: "#f43f5e", fontSize: 11, position: "top" }}
                />
              )}

              <Area
                type="monotone"
                dataKey="ethylenePpm"
                name="Ethylene Concentration (ppm)"
                stroke="#a855f7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#ethGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "sli" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sliGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2638" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis
                domain={[50, 100]}
                stroke="#34d399"
                tick={{ fill: "#34d399", fontSize: 11 }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, fontFamily: 'monospace' }} />

              <ReferenceLine
                y={75}
                stroke="#fbbf24"
                strokeDasharray="4 4"
                label={{ value: "Quality Action Threshold (75% SLI)", fill: "#fbbf24", fontSize: 10, position: "top" }}
              />
              <ReferenceLine
                y={50}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{ value: "Critical Spoilage Floor (50% SLI)", fill: "#f43f5e", fontSize: 10, position: "bottom" }}
              />

              <Area
                type="monotone"
                dataKey="sli"
                name="Shelf-Life Index (SLI %)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sliGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="mt-4 pt-3 border-t border-[#1a2638] flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Active Sampling: 1-hour ticks
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Biological Decay: Arrhenius Respiration Q10
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Commodity Target: <span className="text-white font-semibold">{produceName}</span>
        </div>
      </div>
    </div>
  );
}
