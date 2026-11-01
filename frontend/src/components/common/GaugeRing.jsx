import React from "react";

export function GaugeRing({ value = 0, size = 64, label = "SLI" }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const totalBlocks = 10;
  const activeBlocks = Math.round((clamped / 100) * totalBlocks);

  let signalColor = "text-[#00FF66]";
  let signalBorder = "border-[#00FF66]";
  let signalBg = "bg-[#00FF66]";
  if (clamped < 50) {
    signalColor = "text-[#FF3333]";
    signalBorder = "border-[#FF3333]";
    signalBg = "bg-[#FF3333]";
  } else if (clamped < 80) {
    signalColor = "text-[#FFB000]";
    signalBorder = "border-[#FFB000]";
    signalBg = "bg-[#FFB000]";
  }

  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-[#0D0D0D] border border-[#262626] rounded-none select-none min-w-[90px]">
      <div className="flex items-baseline gap-0.5">
        <span className={`font-serif italic text-2xl lg:text-3xl font-normal tracking-tight ${signalColor}`}>
          {clamped}
        </span>
        <span className="font-mono text-[10px] text-neutral-400 font-semibold">%</span>
      </div>

      {/* Tactile Segmented Pips */}
      <div className="flex items-center gap-[3px] mt-1.5 w-full justify-center">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-[5px] transition-all duration-100 ${
              i < activeBlocks ? signalBg : "bg-[#202020]"
            }`}
          />
        ))}
      </div>

      {label && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-1.5">
          {label}
        </span>
      )}
    </div>
  );
}
