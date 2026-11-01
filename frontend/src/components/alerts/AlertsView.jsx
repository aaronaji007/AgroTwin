import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function AlertsView() {
  const {
    bins,
    alerts,
    openThresholdEditor,
    acknowledgeAlert
  } = useTelemetry();

  return (
    <div className="space-y-8 select-none font-mono">
      {/* Title */}
      <div className="pb-6 border-b border-[#262626]">
        <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
          <span className="text-[#00FF66]">■</span>
          <span>SAFETY LIMITS &amp; ALARMS // 05</span>
        </div>
        <h2 className="font-serif italic text-3xl lg:text-5xl text-white font-normal tracking-tight">
          Safety Thresholds &amp; Alarm Matrix
        </h2>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-2 uppercase tracking-wider">
          Configurable environmental boundaries, alarm notification journal, and automated trip parameters
        </p>
      </div>

      {/* 1. Chamber Threshold Matrix */}
      <div className="bg-[#0A0A0A] border border-[#262626]">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400">
          <span>[ CHAMBER SAFETY BOUNDARIES ]</span>
          <span className="text-white">5 CONFIGURED UNITS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-neutral-400 border-b border-[#262626] uppercase text-[10px] tracking-widest">
              <tr>
                <th className="py-3 px-4">CODE</th>
                <th className="py-3 px-4">CHAMBER NAME</th>
                <th className="py-3 px-4">COMMODITY</th>
                <th className="py-3 px-4">THERMAL WINDOW</th>
                <th className="py-3 px-4">HUMIDITY WINDOW</th>
                <th className="py-3 px-4">ETHYLENE CEILING</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] text-neutral-300">
              {bins.map((bin) => (
                <tr key={bin.id} className="hover:bg-[#111111] transition-colors duration-100">
                  <td className="py-4 px-4 font-bold text-white">{bin.code}</td>
                  <td className="py-4 px-4 font-serif italic text-lg text-white font-normal">{bin.name}</td>
                  <td className="py-4 px-4 text-neutral-400 uppercase">{bin.produceName}</td>
                  <td className="py-4 px-4 text-white">
                    [ {bin.thresholds.minTemp}°C - {bin.thresholds.maxTemp}°C ]
                  </td>
                  <td className="py-4 px-4 text-white">
                    [ {bin.thresholds.minHumidity}% - {bin.thresholds.maxHumidity}% ]
                  </td>
                  <td className="py-4 px-4 text-[#FFB000] font-bold">
                    &lt;{bin.thresholds.maxEthylene} ppm
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => openThresholdEditor(bin)}
                      className="px-3 py-1 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] transition-colors duration-100 font-bold uppercase text-[10px] cursor-pointer"
                    >
                      [ CONFIGURE ]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Comprehensive Alarm Journal */}
      <div className="bg-[#0A0A0A] border border-[#262626]">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400">
          <span>[ SYSTEM ALARM JOURNAL ({alerts.length}) ]</span>
          <span className="text-[#FFB000]">AUTO-RECORDED</span>
        </div>

        <div className="divide-y divide-[#1C1C1C]">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "CRITICAL";
            return (
              <div key={alert.id} className="p-4 hover:bg-[#111111] transition-colors duration-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-4">
                  <span
                    className={`px-2 py-0.5 border text-[9px] font-bold uppercase shrink-0 mt-0.5 ${
                      isCritical
                        ? "border-[#FF3333] text-[#FF3333] bg-[#1A0A0A]"
                        : "border-[#FFB000] text-[#FFB000] bg-[#161208]"
                    }`}
                  >
                    [ {alert.severity} ]
                  </span>
                  <div>
                    <div className="text-white font-bold uppercase tracking-wider">
                      {alert.binName} // {alert.parameter}
                    </div>
                    <p className="text-neutral-300 font-sans mt-1 leading-relaxed">{alert.message}</p>
                    <div className="text-[10px] text-neutral-500 mt-1 uppercase">
                      TIMESTAMP: {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {alert.acknowledged ? (
                    <span className="text-[#00FF66] text-[10px] uppercase font-bold">[ ACKNOWLEDGED ]</span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] font-bold uppercase text-[10px] cursor-pointer"
                    >
                      [ ACKNOWLEDGE ]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
