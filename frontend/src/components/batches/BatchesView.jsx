import React from "react";
import {
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Building,
  CheckCircle2,
  DollarSign,
  Scale,
  Sparkles
} from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { GaugeRing } from "../common/GaugeRing";

export function BatchesView() {
  const { batches, bins, setSelectedBinId, setActiveTab } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white font-mono flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-cyan-400" />
            <span>Produce Inventory & Batch Tracking</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Post-harvest lots, quality inspection grades, dynamic Shelf-Life Index (SLI), and dispatch schedules
          </p>
        </div>
      </div>

      {/* Batch Table / Cards */}
      <div className="rounded-2xl bg-[#0f1724] border border-[#1e2d42] overflow-hidden">
        <div className="p-4 border-b border-[#1e2d42] flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Registered Active Batches ({batches.length})
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Total Inventory: ${batches.reduce((acc, b) => acc + b.marketValueUsd, 0).toLocaleString()} USD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#121c2b] text-slate-400 border-b border-[#1e2d42]">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Commodity / Variety</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Biomass</th>
                <th className="py-3 px-4">Harvest & Intake</th>
                <th className="py-3 px-4">Current SLI %</th>
                <th className="py-3 px-4">Projected Spoilage</th>
                <th className="py-3 px-4">Commercial Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182538] text-slate-300">
              {batches.map((batch) => {
                const isWarning = batch.riskLevel !== "LOW";
                return (
                  <tr key={batch.id} className="hover:bg-[#141e2e] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-300">{batch.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{batch.commodity}</div>
                      <div className="text-[11px] text-slate-400 italic">{batch.variety}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#182639] border border-[#23354c] text-slate-200">
                        {batch.binName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {batch.quantityMetricTons} MT
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>H: {batch.harvestDate}</div>
                      <div className="text-[10px] text-slate-500">In: {batch.intakeDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            batch.currentSli < 50
                              ? "text-rose-400"
                              : batch.currentSli < 75
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {batch.currentSli}%
                        </span>
                        <div className="w-16 bg-[#1b283b] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              batch.currentSli < 50
                                ? "bg-rose-500"
                                : batch.currentSli < 75
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${batch.currentSli}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">
                      {batch.projectedSpoilageDate}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      ${batch.marketValueUsd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBinId(batch.binId);
                          setActiveTab("bins");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium transition-all cursor-pointer"
                      >
                        Inspect Chamber
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
