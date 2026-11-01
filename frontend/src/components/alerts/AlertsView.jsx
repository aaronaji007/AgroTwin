import React from "react";
import {
  AlertTriangle,
  Sliders,
  CheckCircle,
  Clock,
  ShieldCheck,
  Thermometer,
  Droplets,
  Wind,
  CheckCheck
} from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

export function AlertsView() {
  const {
    bins,
    alerts,
    openThresholdEditor,
    acknowledgeAlert
  } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white font-mono flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Alarms & Safety Thresholds Matrix</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configurable environmental boundaries, alarm notification journal, and chamber safety limits
          </p>
        </div>
      </div>

      {/* 1. Chamber Threshold Matrix Table */}
      <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] overflow-hidden">
        <div className="p-4 border-b border-[#1e2d42] flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Chamber Safety Boundaries
          </span>
          <span className="text-xs font-mono text-cyan-400">
            5 Configured Chambers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#121c2b] text-slate-400 border-b border-[#1e2d42]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Storage Chamber</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Temperature Window</th>
                <th className="py-3 px-4">Humidity Window</th>
                <th className="py-3 px-4">Max Ethylene (C₂H₄)</th>
                <th className="py-3 px-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182538] text-slate-300">
              {bins.map((bin) => (
                <tr key={bin.id} className="hover:bg-[#141e2e] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">{bin.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{bin.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{bin.produceName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                      {bin.thresholds.minTemp}°C - {bin.thresholds.maxTemp}°C
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
                      {bin.thresholds.minHumidity}% - {bin.thresholds.maxHumidity}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                      &lt;{bin.thresholds.maxEthylene} ppm
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openThresholdEditor(bin)}
                      className="px-3 py-1 rounded-lg bg-[#141e2e] hover:bg-[#1c2a3d] border border-[#23354c] hover:border-cyan-500/40 text-cyan-300 font-medium transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Comprehensive Alarm History Log */}
      <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] overflow-hidden">
        <div className="p-4 border-b border-[#1e2d42] flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            System Alarm Journal ({alerts.length})
          </span>
          <span className="text-xs font-mono text-slate-400">
            Auto-logged on sensor threshold breaches
          </span>
        </div>

        <div className="divide-y divide-[#182538]">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-[#141e2e] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 mt-0.5 ${
                    alert.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : alert.severity === "WARNING"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                  }`}
                >
                  {alert.severity}
                </span>
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>{alert.binName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-normal">{alert.parameter}</span>
                  </div>
                  <p className="text-slate-300 font-sans mt-0.5">{alert.message}</p>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {alert.acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1 rounded-lg bg-[#141e2e] hover:bg-[#1c2a3d] border border-cyan-500/40 text-cyan-300 font-medium transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
