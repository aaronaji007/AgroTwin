import React, { useState, useEffect } from "react";
import {
  Activity,
  Bell,
  Cpu,
  Server,
  Database,
  Radio,
  Clock,
  Settings,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

export function Header() {
  const {
    useMock,
    toggleMock,
    alerts,
    summary,
    lastPulse,
    backendError,
    setIsAlertDrawerOpen,
    activeTab
  } = useTelemetry();

  const [timeStr, setTimeStr] = useState("");
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0e141f]/95 backdrop-blur-md border-b border-[#1e2d42] px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding & Node Pulse */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.15)]">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                AgroTwin<span className="text-cyan-400">-Share</span>
              </h1>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
                SCADA v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Hydro-Thermal Digital Twin & Produce Shelf-Life Engine
            </p>
          </div>
        </div>

        {/* Center: System Status & Pulse */}
        <div className="hidden lg:flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141d2b] border border-[#22354c]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Telemetry Stream:</span>
            <span className="text-emerald-400 font-mono font-medium">ONLINE (3s cycle)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141d2b] border border-[#22354c]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-mono">SCADA Time:</span>
            <span className="text-cyan-300 font-mono font-semibold">{timeStr || "22:25:00"}</span>
          </div>

          {backendError && !useMock && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Backend Unreachable</span>
            </div>
          )}
        </div>

        {/* Right: Toggleable Mock Layer & Alert Trigger */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher pill */}
          <div className="flex items-center bg-[#131b27] border border-[#23354c] rounded-xl p-1 text-xs">
            <button
              onClick={() => toggleMock(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-mono font-medium ${
                useMock
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,210,255,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Autonomous in-browser mock engine with live fluctuating hydro-thermal calculations"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mock Engine</span>
            </button>
            <button
              onClick={() => toggleMock(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-mono font-medium ${
                !useMock
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Direct connection to FastAPI backend at http://localhost:8000"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>FastAPI Live</span>
            </button>
          </div>

          {/* Alarm Bell Button */}
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-[#141d2b] border border-[#22354c] hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="System Alarms"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-bounce">
                {unreadAlerts}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
