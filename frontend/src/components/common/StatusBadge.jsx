import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from "lucide-react";

export function StatusBadge({ status, size = "md" }) {
  const normStatus = (status || "").toUpperCase();

  const configs = {
    NOMINAL: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      dot: "bg-emerald-400",
      icon: CheckCircle2,
      label: "NOMINAL"
    },
    WARNING: {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      dot: "bg-amber-400",
      icon: AlertTriangle,
      label: "WARNING"
    },
    CRITICAL: {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      dot: "bg-rose-400",
      icon: AlertOctagon,
      label: "CRITICAL"
    },
    OFFLINE: {
      bg: "bg-slate-500/10 border-slate-500/30 text-slate-400",
      dot: "bg-slate-400",
      icon: HelpCircle,
      label: "OFFLINE"
    }
  };

  const config = configs[normStatus] || configs.NOMINAL;
  const Icon = config.icon;

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs font-medium gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
