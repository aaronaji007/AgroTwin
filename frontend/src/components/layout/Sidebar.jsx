import React from "react";
import {
  LayoutDashboard,
  Box,
  Cpu,
  PackageCheck,
  AlertTriangle,
  Sliders,
  Sparkles,
  Thermometer,
  Layers
} from "lucide-react";
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
    {
      id: "overview",
      label: "Control Center",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "bins",
      label: "Storage Bins SCADA",
      icon: Box,
      badge: `${bins.length} Active`
    },
    {
      id: "digitaltwin",
      label: "Digital Twin Engine",
      icon: Cpu,
      badge: "Arrhenius"
    },
    {
      id: "batches",
      label: "Produce Batches",
      icon: PackageCheck,
      badge: null
    },
    {
      id: "alerts",
      label: "Alarms & Thresholds",
      icon: AlertTriangle,
      badge: unreadAlertCount > 0 ? `${unreadAlertCount} Alert` : null,
      badgeColor: "rose"
    }
  ];

  return (
    <aside className="w-64 bg-[#0a0e16] border-r border-[#1e2d42] flex flex-col shrink-0 select-none">
      {/* Facility Header */}
      <div className="p-4 border-b border-[#1a2638]">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Facility Matrix</span>
        </div>
        <p className="text-sm font-semibold text-slate-200 truncate">
          Central Cold Hub #4
        </p>
        <p className="text-xs text-slate-400">Atmospheric Control Sector</p>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1">
          Operations
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.1)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141e2e]/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.badgeColor === "rose"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-[#182538] text-slate-300 border border-[#243750]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Bin Navigation Switcher */}
        <div className="pt-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center justify-between">
            <span>Storage Chambers</span>
            <span className="text-cyan-400 font-mono text-[10px]">{bins.length}</span>
          </div>
          <div className="space-y-1 mt-1">
            {bins.map(bin => {
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#172335] text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#121a27]"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium truncate text-slate-200">{bin.name}</div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                      <span>{bin.produceName}</span>
                      <span>•</span>
                      <span className="font-mono text-cyan-400">{bin.telemetry.temperature}°C</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.round(bin.telemetry.sli)}%
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCritical
                          ? "bg-rose-500 animate-ping"
                          : isWarning
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Facility KPI mini-dock */}
      {summary && (
        <div className="p-3 border-t border-[#1a2638] bg-[#0c121d]">
          <div className="bg-[#121c2b] rounded-xl p-3 border border-[#203147]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase text-[10px]">Inventory Value</span>
              <span className="text-emerald-400 font-mono font-semibold">
                ${(summary.totalInventoryValueUsd / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase text-[10px]">Average SLI</span>
              <span className="text-cyan-300 font-mono font-bold">
                {summary.avgSli}%
              </span>
            </div>
            <div className="w-full bg-[#1b283b] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.avgSli}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
