import React, { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function ThresholdModal() {
  const {
    isThresholdModalOpen,
    setIsThresholdModalOpen,
    targetConfigBin,
    updateThresholds
  } = useTelemetry();

  const [minTemp, setMinTemp] = useState(0.5);
  const [maxTemp, setMaxTemp] = useState(3.5);
  const [minHumidity, setMinHumidity] = useState(88.0);
  const [maxHumidity, setMaxHumidity] = useState(96.0);
  const [maxEthylene, setMaxEthylene] = useState(0.15);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (targetConfigBin && targetConfigBin.thresholds) {
      setMinTemp(targetConfigBin.thresholds.minTemp);
      setMaxTemp(targetConfigBin.thresholds.maxTemp);
      setMinHumidity(targetConfigBin.thresholds.minHumidity);
      setMaxHumidity(targetConfigBin.thresholds.maxHumidity);
      setMaxEthylene(targetConfigBin.thresholds.maxEthylene);
      setSuccessMsg("");
    }
  }, [targetConfigBin]);

  if (!isThresholdModalOpen || !targetConfigBin) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateThresholds(targetConfigBin.id, {
        minTemp: parseFloat(minTemp),
        maxTemp: parseFloat(maxTemp),
        minHumidity: parseFloat(minHumidity),
        maxHumidity: parseFloat(maxHumidity),
        maxEthylene: parseFloat(maxEthylene)
      });
      setSuccessMsg("[ LIMITS COMMITTED SUCCESSFULLY ]");
      setTimeout(() => {
        setIsThresholdModalOpen(false);
        setSuccessMsg("");
      }, 500);
    } catch (err) {
      console.error("Save threshold error:", err);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset) => {
    if (preset === "APPLES") {
      setMinTemp(0.5);
      setMaxTemp(3.5);
      setMinHumidity(88.0);
      setMaxHumidity(96.0);
      setMaxEthylene(0.15);
    } else if (preset === "BANANAS") {
      setMinTemp(12.5);
      setMaxTemp(16.0);
      setMinHumidity(84.0);
      setMaxHumidity(94.0);
      setMaxEthylene(1.50);
    } else if (preset === "AVOCADOS") {
      setMinTemp(4.0);
      setMaxTemp(7.0);
      setMinHumidity(85.0);
      setMaxHumidity(95.0);
      setMaxEthylene(0.10);
    } else if (preset === "BERRIES") {
      setMinTemp(0.0);
      setMaxTemp(2.2);
      setMinHumidity(90.0);
      setMaxHumidity(97.0);
      setMaxEthylene(0.50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 select-none font-mono">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#404040]">
        {/* Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#0E0E0E]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">
              [ SAFETY LIMIT CONFIGURATION // {targetConfigBin.code} ]
            </div>
            <h3 className="font-serif italic text-2xl text-white font-normal mt-0.5 tracking-tight">
              {targetConfigBin.name}
            </h3>
          </div>
          <button
            onClick={() => setIsThresholdModalOpen(false)}
            className="px-2 py-1 border border-[#262626] bg-[#141414] text-neutral-400 hover:text-white uppercase text-xs cursor-pointer"
          >
            [ X ]
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Presets */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">
              COMMODITY TARGET PRESETS:
            </span>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => applyPreset("APPLES")}
                className="py-1.5 px-2 border border-[#262626] bg-[#111111] text-neutral-300 hover:border-white hover:text-white cursor-pointer uppercase text-center"
              >
                APPLES CA
              </button>
              <button
                type="button"
                onClick={() => applyPreset("BANANAS")}
                className="py-1.5 px-2 border border-[#262626] bg-[#111111] text-neutral-300 hover:border-white hover:text-white cursor-pointer uppercase text-center"
              >
                BANANA
              </button>
              <button
                type="button"
                onClick={() => applyPreset("AVOCADOS")}
                className="py-1.5 px-2 border border-[#262626] bg-[#111111] text-neutral-300 hover:border-white hover:text-white cursor-pointer uppercase text-center"
              >
                AVOCADO
              </button>
              <button
                type="button"
                onClick={() => applyPreset("BERRIES")}
                className="py-1.5 px-2 border border-[#262626] bg-[#111111] text-neutral-300 hover:border-white hover:text-white cursor-pointer uppercase text-center"
              >
                BERRIES
              </button>
            </div>
          </div>

          {/* Temperature Bounds */}
          <div className="p-4 border border-[#202020] bg-[#0E0E0E] space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-white font-bold">
              01. THERMAL TOLERANCES (°C)
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 text-[10px] uppercase block mb-1">MIN TEMP (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={minTemp}
                  onChange={(e) => setMinTemp(e.target.value)}
                  className="w-full bg-[#050505] border border-[#262626] px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white"
                  required
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[10px] uppercase block mb-1">MAX TEMP (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(e.target.value)}
                  className="w-full bg-[#050505] border border-[#262626] px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Humidity Bounds */}
          <div className="p-4 border border-[#202020] bg-[#0E0E0E] space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-white font-bold">
              02. RELATIVE HUMIDITY TOLERANCES (%)
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 text-[10px] uppercase block mb-1">MIN RH (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minHumidity}
                  onChange={(e) => setMinHumidity(e.target.value)}
                  className="w-full bg-[#050505] border border-[#262626] px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white"
                  required
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[10px] uppercase block mb-1">MAX RH (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxHumidity}
                  onChange={(e) => setMaxHumidity(e.target.value)}
                  className="w-full bg-[#050505] border border-[#262626] px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ethylene Ceiling */}
          <div className="p-4 border border-[#202020] bg-[#0E0E0E] space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-white font-bold">
              03. ETHYLENE GAS CEILING (PPM)
            </div>
            <div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="5.0"
                value={maxEthylene}
                onChange={(e) => setMaxEthylene(e.target.value)}
                className="w-full bg-[#050505] border border-[#262626] px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white text-xs"
                required
              />
              <span className="text-[9px] text-neutral-400 mt-1 block uppercase">
                Exceeding this value trips automated catalytic scrubbers and logs an incident alarm.
              </span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 border border-[#00FF66] bg-[#0A160E] text-[#00FF66] text-xs uppercase text-center font-bold">
              {successMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsThresholdModalOpen(false)}
              className="px-4 py-2 border border-[#262626] bg-[#111111] text-neutral-400 hover:text-white uppercase cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] font-bold uppercase cursor-pointer"
            >
              {saving ? "[ COMMITTING... ]" : "[ COMMIT LIMITS ]"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
