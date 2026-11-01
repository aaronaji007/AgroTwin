import React from "react";

export function StatusBadge({ status, size = "md" }) {
  const normStatus = (status || "").toUpperCase();

  const configs = {
    NOMINAL: {
      bracket: "[ STATUS // NOMINAL ]",
      pipColor: "text-[#00FF66]",
      border: "border-[#262626] bg-[#0F0F0F] text-[#00FF66]"
    },
    WARNING: {
      bracket: "[ ALERT // WARNING ]",
      pipColor: "text-[#FFB000]",
      border: "border-[#FFB000]/40 bg-[#161208] text-[#FFB000]"
    },
    CRITICAL: {
      bracket: "[ FAULT // CRITICAL ]",
      pipColor: "text-[#FF3333]",
      border: "border-[#FF3333]/50 bg-[#1A0A0A] text-[#FF3333]"
    },
    OFFLINE: {
      bracket: "[ NODE // OFFLINE ]",
      pipColor: "text-neutral-500",
      border: "border-neutral-800 bg-[#0F0F0F] text-neutral-400"
    }
  };

  const config = configs[normStatus] || configs.NOMINAL;
  const sizeClass = size === "sm" ? "text-[10px] py-0.5 px-2 tracking-widest" : "text-[11px] py-1 px-2.5 tracking-widest";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium uppercase border rounded-none select-none ${config.border} ${sizeClass}`}
    >
      <span className={`text-[9px] ${config.pipColor} animate-pulse`}>■</span>
      <span>{config.bracket}</span>
    </span>
  );
}
