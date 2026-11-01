import React, { useState, useEffect } from "react";
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
import {
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { COMMODITY_PROFILES } from "../../services/digitalTwinModel";
import { runDigitalTwinSimulation } from "../../services/api";

export function WhatIfSimulator({ selectedCommodity = "Honeycrisp Apples" }) {
  const [commodity, setCommodity] = useState(selectedCommodity);
  const profile = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];

  // Simulation parameters initialized to optimal setpoints
  const [temp, setTemp] = useState(profile.optimalTempC);
  const [rh, setRh] = useState(profile.optimalRhPct);
  const [ethylene, setEthylene] = useState(0.05);
  const [projectionDays, setProjectionDays] = useState(14);
  const [batchValue, setBatchValue] = useState(profile.unitValueUsd * 30); // ~30 pallets

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update setpoints when commodity changes
  useEffect(() => {
    const prof = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];
    setTemp(prof.optimalTempC);
    setRh(prof.optimalRhPct);
    setEthylene(prof.climacteric ? 0.05 : 0.02);
    setBatchValue(prof.unitValueUsd * 30);
  }, [commodity]);

  // Run simulation whenever parameters change
  useEffect(() => {
    let isMounted = true;
    async function runSim() {
      try {
        setLoading(true);
        const prof = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];
        const result = await runDigitalTwinSimulation({
          commodity,
          initialSli: 95.0,
          temperature: temp,
          humidity: rh,
          ethylenePpm: ethylene,
          projectionDays,
          baselineTemp: prof.optimalTempC,
          baselineHumidity: prof.optimalRhPct,
          baselineEthylene: 0.04,
          batchValueUsd: batchValue
        });
        if (isMounted) setSimResult(result);
      } catch (err) {
        console.error("Simulation run error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    runSim();
    return () => { isMounted = false; };
  }, [commodity, temp, rh, ethylene, projectionDays, batchValue]);

  const CustomSimTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-[#0b121e] border border-[#23354c] rounded-xl p-3 shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="text-slate-400 font-semibold mb-1 pb-1 border-b border-[#1c293a]">
          Date: {label}
        </div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span style={{ color: item.color }}>{item.name}:</span>
            <span className="font-bold text-white">{item.value}% SLI</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white font-mono">
              Hydro-Thermal "What-If" Stress Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate anomalous chamber fluctuations and forecast dynamic produce decay & economic impact
          </p>
        </div>

        {/* Commodity Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Target Crop:</span>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="bg-[#141e2e] border border-[#22354c] rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {Object.keys(COMMODITY_PROFILES).map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulator Grid: Left Controls, Right Chart & Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sliders */}
        <div className="space-y-4 bg-[#121c2b] border border-[#1e2e42] p-4 rounded-xl">
          <h4 className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center justify-between">
            <span>Chamber Setpoints</span>
            <button
              onClick={() => {
                setTemp(profile.optimalTempC);
                setRh(profile.optimalRhPct);
                setEthylene(0.04);
              }}
              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
            >
              Reset to Optimal
            </button>
          </h4>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Temperature (°C):</span>
              <span className={`font-bold ${temp > profile.maxSafeTempC ? "text-rose-400" : "text-cyan-300"}`}>
                {temp.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="24"
              step="0.5"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-[#1b283b] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Optimal: {profile.optimalTempC}°C</span>
              <span>Safe Max: {profile.maxSafeTempC}°C</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Relative Humidity (%):</span>
              <span className={`font-bold ${rh < profile.minSafeRhPct ? "text-amber-400" : "text-blue-400"}`}>
                {rh.toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="99"
              step="1"
              value={rh}
              onChange={(e) => setRh(parseFloat(e.target.value))}
              className="w-full accent-blue-400 h-1.5 bg-[#1b283b] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Optimal: {profile.optimalRhPct}%</span>
              <span>Mold Risk: &gt;96%</span>
            </div>
          </div>

          {/* Ethylene Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Ethylene Gas (ppm):</span>
              <span className={`font-bold ${ethylene > profile.ethyleneThresholdPpm ? "text-purple-400" : "text-slate-300"}`}>
                {ethylene.toFixed(2)} ppm
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="2.0"
              step="0.02"
              value={ethylene}
              onChange={(e) => setEthylene(parseFloat(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-[#1b283b] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Limit: {profile.ethyleneThresholdPpm} ppm</span>
              <span>Type: {profile.climacteric ? "Climacteric" : "Non-Climacteric"}</span>
            </div>
          </div>

          {/* Projection Days selector */}
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-1.5">Projection Window:</span>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setProjectionDays(d)}
                  className={`py-1 rounded-lg border transition-all cursor-pointer ${
                    projectionDays === d
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-[#16202e] text-slate-400 border-[#22354c] hover:text-white"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Projection Trajectory Chart & Impact Summary */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          {/* Chart */}
          <div className="w-full h-64 bg-[#121c2b] border border-[#1e2e42] p-3 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simResult?.trajectory || []} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c293a" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis domain={[30, 100]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 10 }} unit="%" />
                <Tooltip content={<CustomSimTooltip />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }} />

                <ReferenceLine
                  y={60}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  label={{ value: "Commercial Reject Floor", fill: "#f43f5e", fontSize: 9, position: "insideBottomLeft" }}
                />

                <Line
                  type="monotone"
                  dataKey="baselineSli"
                  name="Baseline Optimal SLI"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="simulatedSli"
                  name="Simulated Perturbation SLI"
                  stroke={temp > profile.maxSafeTempC || ethylene > profile.ethyleneThresholdPpm ? "#f43f5e" : "#00d2ff"}
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Impact Dossier */}
          {simResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              {/* Shelf Life Delta */}
              <div className="p-3 rounded-xl bg-[#141e2e] border border-[#203147]">
                <div className="text-slate-400 text-[10px] uppercase">Shelf-Life Shift</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-xl font-bold ${
                      simResult.shelfLifeDeltaDays < 0
                        ? "text-rose-400"
                        : simResult.shelfLifeDeltaDays > 0
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }`}
                  >
                    {simResult.shelfLifeDeltaDays > 0 ? `+${simResult.shelfLifeDeltaDays}` : simResult.shelfLifeDeltaDays}
                  </span>
                  <span className="text-xs text-slate-400">days</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Sim: {simResult.simulatedDaysRemaining}d vs Base: {simResult.baselineDaysRemaining}d
                </div>
              </div>

              {/* Economic Impact */}
              <div className="p-3 rounded-xl bg-[#141e2e] border border-[#203147]">
                <div className="text-slate-400 text-[10px] uppercase">Estimated Financial Impact</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-xl font-bold ${
                      simResult.estimatedEconomicImpactUsd < 0
                        ? "text-rose-400"
                        : simResult.estimatedEconomicImpactUsd > 0
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }`}
                  >
                    {simResult.estimatedEconomicImpactUsd < 0 ? "-" : "+"}$
                    {Math.abs(simResult.estimatedEconomicImpactUsd).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Batch Asset Basis: ${batchValue.toLocaleString()}
                </div>
              </div>

              {/* Biological Verdict */}
              <div className="p-3 rounded-xl bg-[#141e2e] border border-[#203147]">
                <div className="text-slate-400 text-[10px] uppercase">Respiration Multiplier</div>
                <div className="text-xl font-bold text-cyan-300 mt-1">
                  {simResult.simFactors?.compositeMultiplier || 1.0}x
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  VPD: {simResult.simFactors?.vpdKpa || 0.15} kPa
                </div>
              </div>
            </div>
          )}

          {/* Simulation Recommendation Alert Banner */}
          {simResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono leading-relaxed flex items-start gap-2.5 ${
                simResult.shelfLifeDeltaDays < -5
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : simResult.shelfLifeDeltaDays < 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {simResult.shelfLifeDeltaDays < 0 ? (
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <strong>Digital Twin Recommendation:</strong> {simResult.riskVerdict}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
