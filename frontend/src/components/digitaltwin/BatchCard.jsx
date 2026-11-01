import React from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  TrendingDown,
  Box,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { GaugeRing } from "../common/GaugeRing";

export function BatchCard({ batch, onSelectCommodity }) {
  const getRiskBadge = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return {
          bg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: AlertOctagon,
          label: "CRITICAL SPOILAGE RISK"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle,
          label: "ACCELERATED DECAY"
        };
      default:
        return {
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
          label: "OPTIMAL PRESERVATION"
        };
    }
  };

  const riskBadge = getRiskBadge(batch.riskLevel);
  const RiskIcon = riskBadge.icon;

  // Approximate remaining days based on current SLI & nominal life
  const daysRemaining = Math.max(1, Math.round((batch.currentSli / 100) * batch.nominalShelfLifeDays));

  return (
    <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] hover:border-cyan-500/40 p-4 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header: Batch ID & Risk Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
                {batch.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {batch.binName}
              </span>
            </div>
            <h3 className="font-bold text-white text-base mt-1 group-hover:text-cyan-300 transition-colors">
              {batch.commodity}
            </h3>
            <p className="text-xs text-slate-400 italic">
              {batch.variety} • {batch.category}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${riskBadge.bg}`}
          >
            <RiskIcon className="w-3 h-3" />
            <span>{riskBadge.label}</span>
          </span>
        </div>

        {/* Dynamic Countdown & Freshness Gauge */}
        <div className="my-3 p-3 rounded-xl bg-[#131d2b] border border-[#203147] flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Dynamic SLI Countdown</span>
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
              <span>{daysRemaining}</span>
              <span className="text-xs text-slate-400 font-normal">days remaining</span>
            </div>
            <div className="text-xs font-mono text-cyan-300">
              Freshness: <strong>{batch.currentSli}%</strong> of original
            </div>
          </div>
          <GaugeRing value={batch.currentSli} size={64} strokeWidth={6} label="SLI" />
        </div>

        {/* Batch Vitals Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
          <div className="p-2 rounded-lg bg-[#121c2a] border border-[#1e2e42]">
            <span className="text-slate-400 text-[10px] block">Quantity:</span>
            <span className="text-white font-semibold">{batch.quantityMetricTons} MT</span>
          </div>
          <div className="p-2 rounded-lg bg-[#121c2a] border border-[#1e2e42]">
            <span className="text-slate-400 text-[10px] block">Market Value:</span>
            <span className="text-emerald-400 font-semibold">${batch.marketValueUsd.toLocaleString()}</span>
          </div>
          <div className="p-2 rounded-lg bg-[#121c2a] border border-[#1e2e42]">
            <span className="text-slate-400 text-[10px] block">Harvest Date:</span>
            <span className="text-slate-300">{batch.harvestDate}</span>
          </div>
          <div className="p-2 rounded-lg bg-[#121c2a] border border-[#1e2e42]">
            <span className="text-slate-400 text-[10px] block">Spoilage Horizon:</span>
            <span className="text-rose-300">{batch.projectedSpoilageDate}</span>
          </div>
        </div>

        {/* Spoilage Risk Alert if Elevated */}
        {batch.riskLevel !== "LOW" && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Ethylene/Thermal stress detected in {batch.binName}. SLI decaying faster than nominal curve.
            </span>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-3 pt-3 border-t border-[#1a2638] flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 text-[11px]">{batch.qualityGrade}</span>
        <button
          onClick={() => onSelectCommodity(batch.commodity)}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline cursor-pointer"
        >
          <span>Simulate in Twin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
