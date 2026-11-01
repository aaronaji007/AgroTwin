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
import { COMMODITY_PROFILES } from "../../services/digitalTwinModel";
import { runDigitalTwinSimulation } from "../../services/api";

export function WhatIfSimulator({ selectedCommodity = "Honeycrisp Apples" }) {
  const [commodity, setCommodity] = useState(selectedCommodity);
  const profile = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];

  const [temp, setTemp] = useState(profile.optimalTempC);
  const [rh, setRh] = useState(profile.optimalRhPct);
  const [ethylene, setEthylene] = useState(0.05);
  const [projectionDays, setProjectionDays] = useState(14);
  const [batchValue, setBatchValue] = useState(profile.unitValueUsd * 30);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prof = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];
    setTemp(prof.optimalTempC);
    setRh(prof.optimalRhPct);
    setEthylene(prof.climacteric ? 0.05 : 0.02);
    setBatchValue(prof.unitValueUsd * 30);
  }, [commodity]);

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
      <div className="bg-[#050505] border border-[#404040] p-3 font-mono text-xs select-none">
        <div className="text-neutral-400 font-bold mb-1 pb-1 border-b border-[#222222] uppercase tracking-wider">
          TIMELINE: {label}
        </div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-6 py-0.5">
            <span className="text-neutral-400 uppercase text-[10px]">{item.name}:</span>
            <span className="font-bold text-white">{item.value}% SLI</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] p-6 lg:p-8 select-none font-mono">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-6 border-b border-[#202020]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
            [ SIMULATION ENGINE // ARRHENIUS KINETICS &amp; VPD ]
          </div>
          <h3 className="font-serif italic text-3xl lg:text-4xl text-white font-normal tracking-tight">
            Hydro-Thermal "What-If" Stress Simulator
          </h3>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Perturb environmental chamber parameters and predict dynamic produce quality decay
          </p>
        </div>

        {/* Commodity Selector Dropdown */}
        <div className="flex items-center gap-2 border border-[#262626] bg-[#111111] p-1.5 shrink-0">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest px-2">CROP:</span>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="bg-transparent text-white font-bold text-xs uppercase focus:outline-none cursor-pointer pr-2"
          >
            {Object.keys(COMMODITY_PROFILES).map((crop) => (
              <option key={crop} value={crop} className="bg-[#111111] text-white">
                {crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulator Layout (Grid: Controls on Left, Chart & Ledger on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Sliders Console (4 cols) */}
        <div className="lg:col-span-4 space-y-6 bg-[#0E0E0E] border border-[#202020] p-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400 pb-3 border-b border-[#1C1C1C]">
            <span>CHAMBER SETPOINTS</span>
            <button
              onClick={() => {
                setTemp(profile.optimalTempC);
                setRh(profile.optimalRhPct);
                setEthylene(0.04);
              }}
              className="text-white hover:text-[#00FF66] transition-colors cursor-pointer"
            >
              [ RESET ]
            </button>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-400 uppercase">TEMPERATURE:</span>
              <span className={`font-bold ${temp > profile.maxSafeTempC ? "text-[#FF3333]" : "text-white"}`}>
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
              className="w-full accent-white h-1 bg-[#202020] rounded-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 uppercase tracking-widest mt-1.5">
              <span>OPT: {profile.optimalTempC}°C</span>
              <span>SAFE MAX: {profile.maxSafeTempC}°C</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-400 uppercase">RELATIVE HUMIDITY:</span>
              <span className={`font-bold ${rh < profile.minSafeRhPct ? "text-[#FFB000]" : "text-white"}`}>
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
              className="w-full accent-white h-1 bg-[#202020] rounded-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 uppercase tracking-widest mt-1.5">
              <span>OPT: {profile.optimalRhPct}%</span>
              <span>MOLD CEILING: &gt;96%</span>
            </div>
          </div>

          {/* Ethylene Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-400 uppercase">ETHYLENE GAS:</span>
              <span className={`font-bold ${ethylene > profile.ethyleneThresholdPpm ? "text-[#FFB000]" : "text-white"}`}>
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
              className="w-full accent-[#FFB000] h-1 bg-[#202020] rounded-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 uppercase tracking-widest mt-1.5">
              <span>LIMIT: {profile.ethyleneThresholdPpm} ppm</span>
              <span>{profile.climacteric ? "CLIMACTERIC" : "NON-CLIMACTERIC"}</span>
            </div>
          </div>

          {/* Projection Days selector */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">PROJECTION HORIZON:</span>
            <div className="grid grid-cols-4 gap-1">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setProjectionDays(d)}
                  className={`py-1.5 border text-xs uppercase font-bold transition-colors cursor-pointer ${
                    projectionDays === d
                      ? "border-white bg-[#EDEDED] text-black"
                      : "border-[#262626] bg-[#141414] text-neutral-400 hover:text-white"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Trajectory Chart & Impact Ledger (8 cols) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          {/* Trajectory Scope */}
          <div className="w-full h-64 bg-[#080808] border border-[#1A1A1A] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simResult?.trajectory || []} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1F1F1F" />
                <XAxis dataKey="date" stroke="#444444" tick={{ fill: "#666666", fontSize: 9, fontFamily: "JetBrains Mono" }} />
                <YAxis domain={[30, 100]} stroke="#444444" tick={{ fill: "#666666", fontSize: 9, fontFamily: "JetBrains Mono" }} unit="%" />
                <Tooltip content={<CustomSimTooltip />} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />

                <ReferenceLine
                  y={60}
                  stroke="#FF3333"
                  strokeDasharray="3 3"
                  label={{ value: "[ REJECT FLOOR: 60% ]", fill: "#FF3333", fontSize: 8, fontFamily: "JetBrains Mono", position: "insideBottomLeft" }}
                />

                <Line
                  type="linear"
                  dataKey="baselineSli"
                  name="Baseline Optimal SLI"
                  stroke="#00FF66"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="simulatedSli"
                  name="Simulated Perturbation SLI"
                  stroke={temp > profile.maxSafeTempC || ethylene > profile.ethyleneThresholdPpm ? "#FF3333" : "#EDEDED"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Ledger & Biological Dossier */}
          {simResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
              {/* Shelf-Life Delta */}
              <div className="p-4 bg-[#0A0A0A]">
                <div className="text-neutral-400 text-[10px] uppercase tracking-widest">SHELF-LIFE SHIFT</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`font-serif italic text-3xl lg:text-4xl font-normal tracking-tight ${
                      simResult.shelfLifeDeltaDays < 0
                        ? "text-[#FF3333]"
                        : simResult.shelfLifeDeltaDays > 0
                        ? "text-[#00FF66]"
                        : "text-white"
                    }`}
                  >
                    {simResult.shelfLifeDeltaDays > 0 ? `+${simResult.shelfLifeDeltaDays}` : simResult.shelfLifeDeltaDays}
                  </span>
                  <span className="text-xs text-neutral-400 uppercase">Days</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 uppercase">
                  SIM: {simResult.simulatedDaysRemaining}d / BASE: {simResult.baselineDaysRemaining}d
                </div>
              </div>

              {/* Economic Impact */}
              <div className="p-4 bg-[#0A0A0A]">
                <div className="text-neutral-400 text-[10px] uppercase tracking-widest">FINANCIAL EXPOSURE</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`font-serif italic text-3xl lg:text-4xl font-normal tracking-tight ${
                      simResult.estimatedEconomicImpactUsd < 0
                        ? "text-[#FF3333]"
                        : simResult.estimatedEconomicImpactUsd > 0
                        ? "text-[#00FF66]"
                        : "text-white"
                    }`}
                  >
                    {simResult.estimatedEconomicImpactUsd < 0 ? "-" : "+"}$
                    {Math.abs(simResult.estimatedEconomicImpactUsd).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 uppercase">
                  BASIS: ${batchValue.toLocaleString()} USD
                </div>
              </div>

              {/* Decay Rate Multiplier */}
              <div className="p-4 bg-[#0A0A0A]">
                <div className="text-neutral-400 text-[10px] uppercase tracking-widest">RESPIRATION MULTIPLIER</div>
                <div className="mt-1 font-serif italic text-3xl lg:text-4xl text-white font-normal tracking-tight">
                  {simResult.simFactors?.compositeMultiplier || 1.0}x
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 uppercase">
                  VPD: {simResult.simFactors?.vpdKpa || 0.15} kPa
                </div>
              </div>
            </div>
          )}

          {/* Recommendation Note */}
          {simResult && (
            <div
              className={`p-4 border text-xs leading-relaxed uppercase tracking-wider ${
                simResult.shelfLifeDeltaDays < -5
                  ? "border-[#FF3333]/50 bg-[#1A0A0A] text-[#FF3333]"
                  : simResult.shelfLifeDeltaDays < 0
                  ? "border-[#FFB000]/40 bg-[#161208] text-[#FFB000]"
                  : "border-[#00FF66]/30 bg-[#0A160E] text-[#00FF66]"
              }`}
            >
              <strong>[ DIGITAL TWIN DIRECTIVE ]:</strong> {simResult.riskVerdict}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
