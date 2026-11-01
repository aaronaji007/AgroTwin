import React, { useState } from "react";
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  Sliders,
  CheckCheck,
  Clock
} from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

export function AlertDrawer() {
  const {
    alerts,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    acknowledgeAlert
  } = useTelemetry();

  const [filter, setFilter] = useState("ALL"); // "ALL" | "UNACKNOWLEDGED" | "CRITICAL"

  if (!isAlertDrawerOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filter === "UNACKNOWLEDGED") return !a.acknowledged;
    if (filter === "CRITICAL") return a.severity === "CRITICAL";
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
          icon: AlertOctagon,
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40"
        };
      case "WARNING":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          icon: AlertTriangle,
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        };
      default:
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-300",
          icon: Info,
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/40"
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity flex justify-end">
      <div className="w-full max-w-md bg-[#0c121d] border-l border-[#1e2d42] h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1e2d42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-mono">
                SCADA Operational Alarms
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {alerts.filter(a => !a.acknowledged).length} unacknowledged events
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15202f] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-[#182638] flex items-center gap-1.5 text-xs font-mono">
          {["ALL", "UNACKNOWLEDGED", "CRITICAL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filter === f
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
                  : "bg-[#121c2b] text-slate-400 border-[#1f3044] hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p>No alarms matching the selected filter.</p>
              <p className="text-slate-400 mt-1">All storage chambers operating within tolerance.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = getSeverityStyle(alert.severity);
              const Icon = style.icon;
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${style.bg} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{alert.binName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${style.badge}`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans mb-2">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-700/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {alert.value && (
                        <span>
                          Param: <strong>{alert.value} {alert.unit}</strong> (Limit: {alert.threshold})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  <div className="mt-2.5 flex justify-end">
                    {alert.acknowledged ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#141e2e] hover:bg-[#1c2a3d] border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1e2d42] bg-[#0a0e16] flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 text-[11px]">AgroTwin Alert Core</span>
          <button
            onClick={() => {
              alerts.forEach(a => {
                if (!a.acknowledged) acknowledgeAlert(a.id);
              });
            }}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            Acknowledge All Alarms
          </button>
        </div>
      </div>
    </div>
  );
}
