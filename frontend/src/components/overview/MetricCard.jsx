import React from "react";

export function MetricCard({
  index = "01",
  title,
  value,
  unit,
  trendLabel,
  trendType = "neutral", // "positive" | "warning" | "danger" | "neutral"
  subtext,
  signalColor = "green" // "green" | "amber" | "red" | "white"
}) {
  const signalConfigs = {
    green: {
      accent: "text-[#00FF66]",
      borderAccent: "border-l-2 border-[#00FF66]",
      pip: "text-[#00FF66]"
    },
    amber: {
      accent: "text-[#FFB000]",
      borderAccent: "border-l-2 border-[#FFB000]",
      pip: "text-[#FFB000]"
    },
    red: {
      accent: "text-[#FF3333]",
      borderAccent: "border-l-2 border-[#FF3333]",
      pip: "text-[#FF3333]"
    },
    white: {
      accent: "text-white",
      borderAccent: "border-l-2 border-white",
      pip: "text-white"
    }
  };

  const signal = signalConfigs[signalColor] || signalConfigs.white;

  return (
    <div
      className={`min-h-[160px] p-6 lg:p-7 bg-[#0A0A0A] border border-[#262626] transition-colors duration-100 hover:bg-[#0F0F0F] flex flex-col justify-between select-none ${signal.borderAccent}`}
    >
      {/* Top Metadata Header */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className={signal.pip}>■</span>
          <span>{index} // {title}</span>
        </span>
        {trendLabel && (
          <span
            className={`px-1.5 py-0.5 border text-[9px] font-semibold tracking-wider ${
              trendType === "positive"
                ? "border-[#00FF66]/30 text-[#00FF66] bg-[#00FF66]/10"
                : trendType === "warning"
                ? "border-[#FFB000]/40 text-[#FFB000] bg-[#FFB000]/10"
                : trendType === "danger"
                ? "border-[#FF3333]/50 text-[#FF3333] bg-[#FF3333]/10"
                : "border-[#262626] text-neutral-400 bg-[#141414]"
            }`}
          >
            {trendLabel}
          </span>
        )}
      </div>

      {/* Main Massive Editorial Metric */}
      <div className="my-3">
        <div className="flex items-baseline gap-2">
          <span className="font-serif italic text-5xl lg:text-6xl text-white font-normal tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Micro Status Subtext */}
      <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest pt-2 border-t border-[#1C1C1C] flex items-center justify-between">
        <span className="truncate">{subtext}</span>
        <span className="text-neutral-400">SYS.OK</span>
      </div>
    </div>
  );
}
