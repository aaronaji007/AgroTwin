import React, { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function Header() {
  const {
    useMock,
    toggleMock,
    alerts,
    lastPulse,
    backendError,
    setIsAlertDrawerOpen
  } = useTelemetry();

  const [timeStr, setTimeStr] = useState("");
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A] border-b border-[#262626] px-4 lg:px-8 py-3 select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Industrial Editorial Title & Station ID */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-[#262626] bg-[#111111] flex items-center justify-center font-mono font-bold text-xs text-[#00FF66] shrink-0">
            AG
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-serif italic text-xl lg:text-2xl text-white font-normal tracking-tight">
                AgroTwin
              </h1>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
                // SHARE TERMINAL
              </span>
            </div>
            <div className="font-mono text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
              <span>LOC: CENTRAL-HUB-04</span>
              <span>/</span>
              <span className="text-[#00FF66]">TELEMETRY: ACTIVE (3s)</span>
            </div>
          </div>
        </div>

        {/* Center: Monospace Technical Status Stream */}
        <div className="hidden xl:flex items-center gap-6 font-mono text-[11px] text-neutral-400">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-[#1C1C1C] bg-[#0E0E0E]">
            <span className="text-[#00FF66] animate-pulse">●</span>
            <span className="text-neutral-400 tracking-wider">BIOPHYSICAL ENGINE:</span>
            <span className="text-white font-medium">ARRHENIUS &amp; TETENS VPD</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-[#1C1C1C] bg-[#0E0E0E]">
            <span className="text-neutral-400 tracking-wider">TIME:</span>
            <span className="text-white">{timeStr || "2026-11-01 22:30:00 UTC"}</span>
          </div>

          {backendError && !useMock && (
            <div className="px-3 py-1.5 border border-[#FF3333] bg-[#1A0A0A] text-[#FF3333] tracking-widest uppercase">
              [ BACKEND OFFLINE ]
            </div>
          )}
        </div>

        {/* Right: Mechanical Mode Switcher & Bracketed Alarm */}
        <div className="flex items-center gap-3">
          {/* Mechanical Mode Toggle */}
          <div className="flex items-center border border-[#262626] bg-[#111111] p-0.5 font-mono text-[11px]">
            <button
              onClick={() => toggleMock(true)}
              className={`px-3 py-1 uppercase tracking-wider transition-all duration-100 cursor-pointer ${
                useMock
                  ? "bg-[#EDEDED] text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              [ MOCK ]
            </button>
            <button
              onClick={() => toggleMock(false)}
              className={`px-3 py-1 uppercase tracking-wider transition-all duration-100 cursor-pointer ${
                !useMock
                  ? "bg-[#00FF66] text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              [ FASTAPI ]
            </button>
          </div>

          {/* VIVA PDF Manual Link */}
          <a
            href="/AgroTwin_Share_Expo_Viva_Guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] bg-[#111111] hover:border-[#00FF66] text-neutral-300 hover:text-[#00FF66] font-mono text-xs uppercase tracking-widest transition-all duration-100 cursor-pointer"
            title="Download the Comprehensive Expo & Viva Technical Guide"
          >
            <span>[ VIVA GUIDE // PDF ]</span>
          </a>

          {/* Alarm Trigger Bracket */}
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className={`px-3 py-1.5 border font-mono text-xs uppercase tracking-widest transition-all duration-100 flex items-center gap-2 cursor-pointer ${
              unreadAlerts > 0
                ? "border-[#FFB000] bg-[#1A1408] text-[#FFB000] hover:bg-[#FFB000] hover:text-black font-bold"
                : "border-[#262626] bg-[#111111] text-neutral-400 hover:border-white hover:text-white"
            }`}
          >
            <span>[ ALARMS</span>
            <span className={unreadAlerts > 0 ? "font-bold" : "text-neutral-400"}>
              // {String(unreadAlerts).padStart(2, "0")} ]
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
