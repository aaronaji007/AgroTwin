import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Save,
  RotateCcw,
  Sparkles
} from "lucide-react";
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
      setSuccessMsg("Threshold limits updated successfully!");
      setTimeout(() => {
        setIsThresholdModalOpen(false);
        setSuccessMsg("");
      }, 700);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1421] border border-[#23354c] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1e2d42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <span>Configure Safety Thresholds</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {targetConfigBin.code}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {targetConfigBin.name} • {targetConfigBin.produceName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsThresholdModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15202f] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Quick Commodity Presets:
            </span>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => applyPreset("APPLES")}
                className="py-1 px-2 rounded-lg bg-[#141e2e] hover:bg-[#1b283b] border border-[#203147] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-center"
              >
                Apples CA
              </button>
              <button
                type="button"
                onClick={() => applyPreset("BANANAS")}
                className="py-1 px-2 rounded-lg bg-[#141e2e] hover:bg-[#1b283b] border border-[#203147] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-center"
              >
                Banana Ripen
              </button>
              <button
                type="button"
                onClick={() => applyPreset("AVOCADOS")}
                className="py-1 px-2 rounded-lg bg-[#141e2e] hover:bg-[#1b283b] border border-[#203147] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-center"
              >
                Avocado Set
              </button>
              <button
                type="button"
                onClick={() => applyPreset("BERRIES")}
                className="py-1 px-2 rounded-lg bg-[#141e2e] hover:bg-[#1b283b] border border-[#203147] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-center"
              >
                Hydro Berry
              </button>
            </div>
          </div>

          {/* Temperature Bounds */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Thermometer className="w-4 h-4" />
              <span>Temperature Bounds (°C)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Min Safe Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={minTemp}
                  onChange={(e) => setMinTemp(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#23354c] rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Max Safe Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#23354c] rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Relative Humidity Bounds */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold">
              <Droplets className="w-4 h-4" />
              <span>Relative Humidity Bounds (%)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Min RH (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minHumidity}
                  onChange={(e) => setMinHumidity(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#23354c] rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Max RH (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxHumidity}
                  onChange={(e) => setMaxHumidity(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#23354c] rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ethylene Gas Max Limit */}
          <div className="p-3 rounded-xl bg-[#121c2a] border border-[#1e2e42] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold">
              <Wind className="w-4 h-4" />
              <span>Ethylene Gas Concentration Ceiling (ppm)</span>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-mono block mb-1">
                Alarm Trigger Threshold (ppm)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="5.0"
                value={maxEthylene}
                onChange={(e) => setMaxEthylene(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#23354c] rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-purple-400 text-xs"
                required
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Exceeding this value triggers the chamber catalytic scrubber and dispatches a SCADA warning.
              </span>
            </div>
          </div>

          {/* Success message banner */}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsThresholdModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#141e2e] hover:bg-[#1b283b] border border-[#203147] text-slate-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,210,255,0.15)] flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Updating..." : "Commit Thresholds"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
