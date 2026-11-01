import React, { useState } from "react";
import {
  Snowflake,
  Fan,
  Zap,
  Sliders,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  Activity,
  Flame,
  DoorOpen
} from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

export function ActuatorControls({ bin }) {
  const { triggerEvent, openThresholdEditor } = useTelemetry();
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAction = async (actionType) => {
    try {
      setLoadingAction(actionType);
      await triggerEvent(bin.id, actionType);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoadingAction(null), 400);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Actuator Status Cards */}
      <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] p-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Chamber Actuators & HVAC</span>
          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PLC Auto-Control
          </span>
        </h4>

        <div className="space-y-3">
          {/* Compressor */}
          <div className="p-3 rounded-xl bg-[#131d2b] border border-[#203147] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${
                  bin.compressorActive
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                <Snowflake className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Refrigeration Compressor</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {bin.compressorActive ? "Variable Inverter: 4.8 kW" : "OFFLINE / TRIP"}
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                bin.compressorActive
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
              }`}
            >
              {bin.compressorActive ? "RUNNING" : "STOPPED"}
            </span>
          </div>

          {/* Circulation Fan */}
          <div className="p-3 rounded-xl bg-[#131d2b] border border-[#203147] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${
                  bin.evaporatorFanActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-800 text-slate-500 border-slate-700"
                }`}
              >
                <Fan className={`w-4 h-4 ${bin.evaporatorFanActive ? "animate-spin" : ""}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Evaporator Circulation Fans</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {bin.evaporatorFanActive ? "1,250 RPM • 4,500 CFM" : "STANDBY"}
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                bin.evaporatorFanActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {bin.evaporatorFanActive ? "ACTIVE" : "OFF"}
            </span>
          </div>

          {/* Ethylene Scrubber */}
          <div className="p-3 rounded-xl bg-[#131d2b] border border-[#203147] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${
                  bin.ethyleneScrubberActive
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    : "bg-slate-800 text-slate-500 border-slate-700"
                }`}
              >
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Catalytic Ethylene Scrubber</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {bin.ethyleneScrubberActive ? "Catalytic Bed: 120 m³/h" : "DORMANT"}
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                bin.ethyleneScrubberActive
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse font-bold"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {bin.ethyleneScrubberActive ? "PURGING" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Simulation Injector (Dynamic Real-Time Testing) */}
      <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Digital Twin Stress Testing</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Live chamber injection</span>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Inject real-world operational failure scenarios to observe dynamic hydro-thermal decay and automated SCADA alarms:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {/* Door Ajar */}
          <button
            onClick={() => handleAction("DOOR_OPEN")}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-[#141e2e] hover:bg-[#1a293d] border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-medium mb-1">
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Door Ajar Leak</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              +3.2°C Temp, -14% RH
            </div>
          </button>

          {/* Compressor Trip */}
          <button
            onClick={() => handleAction("COOLING_FAIL")}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-[#141e2e] hover:bg-[#1a293d] border border-rose-500/30 hover:border-rose-400 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-medium mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Compressor Trip</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Chiller failure, +6.5°C
            </div>
          </button>

          {/* Ethylene Spike */}
          <button
            onClick={() => handleAction("ETHYLENE_SPIKE")}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-[#141e2e] hover:bg-[#1a293d] border border-purple-500/30 hover:border-purple-400 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-medium mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Ethylene Surge</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              +0.65 ppm gas surge
            </div>
          </button>

          {/* Restore Optimal */}
          <button
            onClick={() => handleAction("RESTORE_OPTIMAL")}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-[#141e2e] hover:bg-[#1a293d] border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-medium mb-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Optimal</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Reset target setpoints
            </div>
          </button>
        </div>

        {/* Configure Thresholds Button */}
        <button
          onClick={() => openThresholdEditor(bin)}
          className="w-full mt-3 py-2 px-3 rounded-xl bg-[#141e2e] hover:bg-[#1b283b] border border-[#23354c] hover:border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Edit Bin Safety Thresholds</span>
        </button>
      </div>
    </div>
  );
}
