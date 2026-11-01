import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  trendType = "neutral", // "positive" | "warning" | "danger" | "neutral"
  subtext,
  accentColor = "cyan"
}) {
  const colorMap = {
    cyan: {
      border: "border-cyan-500/30",
      bg: "from-cyan-500/10 to-transparent",
      iconBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
      glow: "hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,210,255,0.15)]"
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "from-emerald-500/10 to-transparent",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      glow: "hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    },
    amber: {
      border: "border-amber-500/30",
      bg: "from-amber-500/10 to-transparent",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      glow: "hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    },
    rose: {
      border: "border-rose-500/30",
      bg: "from-rose-500/10 to-transparent",
      iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      glow: "hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
    },
    purple: {
      border: "border-purple-500/30",
      bg: "from-purple-500/10 to-transparent",
      iconBg: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      glow: "hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
    }
  };

  const style = colorMap[accentColor] || colorMap.cyan;

  const trendStyles = {
    positive: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    neutral: "bg-slate-700/30 text-slate-300 border-slate-600/30"
  };

  return (
    <div
      className={`relative rounded-2xl bg-[#0f1724] border ${style.border} p-4 transition-all duration-300 ${style.glow} bg-gradient-to-b ${style.bg} flex flex-col justify-between`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-mono text-slate-400 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Trend & Subtext footer */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1a2638]">
        {trendLabel && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border ${
              trendStyles[trendType] || trendStyles.neutral
            }`}
          >
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {trend === "flat" && <Minus className="w-3 h-3" />}
            <span>{trendLabel}</span>
          </span>
        )}
        {subtext && (
          <span className="text-slate-400 text-[11px] truncate max-w-[150px] font-mono">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
