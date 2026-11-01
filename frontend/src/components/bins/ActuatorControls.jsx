import React, { useState } from "react";
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
      setTimeout(() => setLoadingAction(null), 300);
    }
  };

  return (
    <div className="space-y-6 select-none font-mono">
      {/* 1. Actuator Relays */}
      <div className="bg-[#0A0A0A] border border-[#262626] p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#202020] text-[10px] uppercase tracking-widest text-neutral-400">
          <span>[ RELAY BANK // ACTUATORS ]</span>
          <span className="text-[#00FF66]">[ AUTO-PLC ]</span>
        </div>

        <div className="space-y-3">
          {/* Compressor */}
          <div className="p-3 border border-[#202020] bg-[#0E0E0E] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                01. CHILLER COMPRESSOR
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {bin.compressorActive ? "LOAD: 4.8 kW • INVERTER" : "CIRCUIT BREAKER OPEN"}
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 border font-bold ${
                bin.compressorActive
                  ? "border-[#00FF66]/30 text-[#00FF66] bg-[#00FF66]/10"
                  : "border-[#FF3333]/50 text-[#FF3333] bg-[#FF3333]/10"
              }`}
            >
              {bin.compressorActive ? "[ ACTIVE ]" : "[ TRIP ]"}
            </span>
          </div>

          {/* Circulation Fan */}
          <div className="p-3 border border-[#202020] bg-[#0E0E0E] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                02. EVAPORATOR FANS
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {bin.evaporatorFanActive ? "VELOCITY: 1,250 RPM • 4.5k CFM" : "STANDBY"}
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 border font-bold ${
                bin.evaporatorFanActive
                  ? "border-[#00FF66]/30 text-[#00FF66] bg-[#00FF66]/10"
                  : "border-neutral-800 text-neutral-600 bg-[#111111]"
              }`}
            >
              {bin.evaporatorFanActive ? "[ ACTIVE ]" : "[ OFF ]"}
            </span>
          </div>

          {/* Ethylene Scrubber */}
          <div className="p-3 border border-[#202020] bg-[#0E0E0E] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                03. C₂H₄ SCRUBBER
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {bin.ethyleneScrubberActive ? "CATALYST BED: 120 m³/h" : "DORMANT"}
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 border font-bold ${
                bin.ethyleneScrubberActive
                  ? "border-[#FFB000]/40 text-[#FFB000] bg-[#FFB000]/10 animate-pulse"
                  : "border-neutral-800 text-neutral-600 bg-[#111111]"
              }`}
            >
              {bin.ethyleneScrubberActive ? "[ PURGING ]" : "[ IDLE ]"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Simulation Stress Injector */}
      <div className="bg-[#0A0A0A] border border-[#262626] p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#202020] text-[10px] uppercase tracking-widest text-neutral-400">
          <span>[ STRESS TEST // HARDWARE INJECT ]</span>
          <span className="text-[#FFB000]">[ ANOMALY ]</span>
        </div>

        <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed font-sans">
          Inject physical thermodynamic failures to stress test the biophysical digital twin calculations:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction("DOOR_OPEN")}
            disabled={loadingAction !== null}
            className="p-3 border border-[#262626] bg-[#111111] hover:border-[#FFB000] hover:text-[#FFB000] transition-colors duration-100 text-left cursor-pointer"
          >
            <div className="text-[10px] text-white font-bold uppercase tracking-wider">
              [+] DOOR LEAK
            </div>
            <div className="text-[9px] text-neutral-400 mt-1">
              +3.2°C / -14% RH
            </div>
          </button>

          <button
            onClick={() => handleAction("COOLING_FAIL")}
            disabled={loadingAction !== null}
            className="p-3 border border-[#262626] bg-[#111111] hover:border-[#FF3333] hover:text-[#FF3333] transition-colors duration-100 text-left cursor-pointer"
          >
            <div className="text-[10px] text-white font-bold uppercase tracking-wider">
              [+] CHILLER TRIP
            </div>
            <div className="text-[9px] text-neutral-400 mt-1">
              +6.5°C / COMP FAIL
            </div>
          </button>

          <button
            onClick={() => handleAction("ETHYLENE_SPIKE")}
            disabled={loadingAction !== null}
            className="p-3 border border-[#262626] bg-[#111111] hover:border-[#FFB000] hover:text-[#FFB000] transition-colors duration-100 text-left cursor-pointer"
          >
            <div className="text-[10px] text-white font-bold uppercase tracking-wider">
              [+] C₂H₄ SURGE
            </div>
            <div className="text-[9px] text-neutral-400 mt-1">
              +0.65 ppm BURST
            </div>
          </button>

          <button
            onClick={() => handleAction("RESTORE_OPTIMAL")}
            disabled={loadingAction !== null}
            className="p-3 border border-[#262626] bg-[#111111] hover:bg-white hover:text-black transition-colors duration-100 text-left cursor-pointer"
          >
            <div className="text-[10px] text-white font-bold uppercase tracking-wider">
              [*] CALIBRATE
            </div>
            <div className="text-[9px] text-neutral-400 mt-1">
              RESTORE DESIGN
            </div>
          </button>
        </div>

        <button
          onClick={() => openThresholdEditor(bin)}
          className="w-full mt-4 py-2.5 px-4 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] transition-colors duration-100 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          [ CONFIGURE THRESHOLD LIMITS ]
        </button>
      </div>
    </div>
  );
}
