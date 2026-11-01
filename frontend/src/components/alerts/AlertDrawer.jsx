import React, { useState } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function AlertDrawer() {
  const {
    alerts,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    acknowledgeAlert
  } = useTelemetry();

  const [filter, setFilter] = useState("ALL");

  if (!isAlertDrawerOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filter === "UNACKNOWLEDGED") return !a.acknowledged;
    if (filter === "CRITICAL") return a.severity === "CRITICAL";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 select-none flex justify-end font-mono">
      <div className="w-full max-w-lg bg-[#0A0A0A] border-l border-[#262626] h-full flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#0E0E0E]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">
              [ INCIDENT DISPATCH CORE ]
            </div>
            <h3 className="font-serif italic text-2xl text-white font-normal mt-0.5 tracking-tight">
              SCADA Alarm Journal
            </h3>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-neutral-400 hover:text-white hover:border-white transition-colors cursor-pointer text-xs uppercase"
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-[#202020] flex items-center gap-2 text-xs bg-[#070707]">
          {["ALL", "UNACKNOWLEDGED", "CRITICAL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 border transition-colors cursor-pointer uppercase text-[10px] tracking-wider ${
                filter === f
                  ? "border-white bg-[#EDEDED] text-black font-bold"
                  : "border-[#262626] bg-[#111111] text-neutral-400 hover:text-white"
              }`}
            >
              [ {f} ]
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto divide-y divide-[#1C1C1C]">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-xs uppercase tracking-widest">
              [ ZERO ALARMS MATCHING QUERY ]
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === "CRITICAL";
              return (
                <div
                  key={alert.id}
                  className={`pt-3 first:pt-0 p-3 border ${
                    isCritical
                      ? "border-[#FF3333]/40 bg-[#1A0A0A]"
                      : "border-[#202020] bg-[#0E0E0E]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1.5">
                    <span className="font-bold text-white">
                      {alert.binName} // {alert.parameter}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 border text-[9px] font-bold ${
                        isCritical
                          ? "border-[#FF3333] text-[#FF3333]"
                          : "border-[#FFB000] text-[#FFB000]"
                      }`}
                    >
                      [ {alert.severity} ]
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 font-sans leading-relaxed my-2">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-[#1C1C1C]">
                    <span>
                      VAL: {alert.value} {alert.unit} (LIMIT: {alert.threshold})
                    </span>
                    {alert.acknowledged ? (
                      <span className="text-[#00FF66]">[ ACKNOWLEDGED ]</span>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2 py-0.5 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] font-bold uppercase text-[9px] cursor-pointer"
                      >
                        [ ACK ]
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#0E0E0E] flex justify-between items-center text-xs">
          <span className="text-[10px] uppercase text-neutral-400">TELEMETRY JOURNAL ACTIVE</span>
          <button
            onClick={() => {
              alerts.forEach(a => {
                if (!a.acknowledged) acknowledgeAlert(a.id);
              });
            }}
            className="text-white hover:text-[#00FF66] uppercase text-[10px] tracking-wider cursor-pointer"
          >
            [ ACKNOWLEDGE ALL ]
          </button>
        </div>
      </div>
    </div>
  );
}
