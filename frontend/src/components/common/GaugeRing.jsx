import React from "react";

export function GaugeRing({ value = 0, size = 80, strokeWidth = 7, label = "SLI" }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  let strokeColor = "#10b981"; // emerald-500
  let textColor = "text-emerald-400";
  if (clamped < 50) {
    strokeColor = "#f43f5e"; // rose-500
    textColor = "text-rose-400";
  } else if (clamped < 80) {
    strokeColor = "#f59e0b"; // amber-500
    textColor = "text-amber-400";
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-mono font-bold leading-none ${textColor}`} style={{ fontSize: size * 0.24 }}>
          {clamped.toFixed(0)}%
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
