import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    bins,
    selectedBinId,
    setSelectedBinId,
    alerts,
    summary
  } = useTelemetry();

  const unreadAlertCount = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { id: "overview", num: "01", label: "CONTROL MATRIX", badge: null },
    { id: "bins", num: "02", label: "STORAGE CHAMBERS", badge: `${bins.length} UNITS` },
    { id: "digitaltwin", num: "03", label: "DIGITAL TWIN MODEL", badge: "Q10/VPD" },
    { id: "batches", num: "04", label: "BIOMASS LEDGER", badge: null },
    {
      id: "alerts",
      num: "05",
      label: "LIMITS & ALARMS",
      badge: unreadAlertCount > 0 ? `! ${unreadAlertCount}` : null,
      isWarning: unreadAlertCount > 0
    }
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-[#262626] flex flex-col shrink-0 select-none">
      {/* Sector Station Tag */}
      <div className="p-4 border-b border-[#262626] bg-[#0E0E0E]">
        <div className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase">
          FACILITY ARCHITECTURE
        </div>
        <div className="font-serif italic text-lg text-white font-normal mt-0.5">
          Atmospheric Sector 04
        </div>
        <div className="font-mono text-[10px] text-neutral-400 mt-1 flex items-center justify-between">
          <span>ZONE: COLD-CHAIN-A</span>
          <span className="text-[#00FF66]">[ SYNC ]</span>
        </div>
      </div>

      {/* Main Navigation Grid */}
      <nav className="flex-1 divide-y divide-[#1C1C1C] overflow-y-auto">
        <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 bg-[#070707]">
          [ MODULE DIRECTORY ]
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left font-mono text-xs uppercase tracking-wider transition-colors duration-100 cursor-pointer ${
                isActive
                  ? "bg-[#EDEDED] text-black font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-[#121212]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-neutral-600 font-normal" : "text-neutral-400"}>
                  {item.num}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 font-bold ${
                    item.isWarning
                      ? "bg-[#FFB000] text-black"
                      : isActive
                      ? "bg-black text-white"
                      : "border border-[#262626] text-neutral-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Storage Chamber Switchboard */}
        <div className="pt-2">
          <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 bg-[#070707] flex items-center justify-between">
            <span>[ ACTIVE CHAMBERS ]</span>
            <span className="text-white">{bins.length}</span>
          </div>
          <div className="divide-y divide-[#171717]">
            {bins.map((bin, idx) => {
              const isSelected = selectedBinId === bin.id && activeTab === "bins";
              const isWarning = bin.status === "WARNING";
              const isCritical = bin.status === "CRITICAL";

              return (
                <button
                  key={bin.id}
                  onClick={() => {
                    setSelectedBinId(bin.id);
                    setActiveTab("bins");
                  }}
                  className={`w-full text-left px-4 py-2.5 font-mono text-xs transition-colors duration-100 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#1C1C1C] text-white border-l-2 border-[#00FF66]"
                      : "text-neutral-400 hover:text-white hover:bg-[#111111]"
                  }`}
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-[10px]">0{idx + 1}.</span>
                      <span className="text-white font-medium truncate">{bin.name}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 truncate flex items-center gap-2">
                      <span className="text-white">{bin.telemetry.temperature}°C</span>
                      <span>/</span>
                      <span>{bin.telemetry.humidity}% RH</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-neutral-400 font-bold">
                      {Math.round(bin.telemetry.sli)}%
                    </span>
                    <span
                      className={`text-[9px] ${
                        isCritical
                          ? "text-[#FF3333] animate-pulse"
                          : isWarning
                          ? "text-[#FFB000]"
                          : "text-[#00FF66]"
                      }`}
                    >
                      ■
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Terminal Summary Dock */}
      {summary && (
        <div className="p-4 border-t border-[#262626] bg-[#0E0E0E] font-mono">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest">
            <span>INVENTORY VALUATION</span>
            <span className="text-white font-bold">
              ${(summary.totalInventoryValueUsd / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest mt-1.5">
            <span>MEAN SHELF-LIFE (SLI)</span>
            <span className="text-[#00FF66] font-bold">
              {summary.avgSli}%
            </span>
          </div>
          <div className="w-full bg-[#202020] h-1 mt-2">
            <div
              className="bg-[#00FF66] h-full transition-all duration-100"
              style={{ width: `${summary.avgSli}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
