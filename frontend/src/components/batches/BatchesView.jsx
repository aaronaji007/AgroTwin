import React from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function BatchesView() {
  const { batches, setSelectedBinId, setActiveTab } = useTelemetry();

  return (
    <div className="space-y-8 select-none font-mono">
      {/* Title */}
      <div className="pb-6 border-b border-[#262626]">
        <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
          <span className="text-[#00FF66]">■</span>
          <span>INVENTORY DIRECTORY // 04</span>
        </div>
        <h2 className="font-serif italic text-3xl lg:text-5xl text-white font-normal tracking-tight">
          Biomass Inventory Ledger
        </h2>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-2 uppercase tracking-wider">
          Post-harvest storage lots, commercial quality grades, dynamic Shelf-Life Index (SLI), and dispatch schedules
        </p>
      </div>

      {/* Industrial Ledger Table */}
      <div className="bg-[#0A0A0A] border border-[#262626]">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400">
          <span>[ REGISTERED LOTS ({batches.length}) ]</span>
          <span className="text-[#00FF66]">
            TOTAL ASSET: ${batches.reduce((acc, b) => acc + b.marketValueUsd, 0).toLocaleString()} USD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-neutral-400 border-b border-[#262626] uppercase text-[10px] tracking-widest">
              <tr>
                <th className="py-3 px-4">LOT ID</th>
                <th className="py-3 px-4">COMMODITY // VARIETY</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">BIOMASS</th>
                <th className="py-3 px-4">HARVEST / INTAKE</th>
                <th className="py-3 px-4">CURRENT SLI</th>
                <th className="py-3 px-4">PROJECTED SPOILAGE</th>
                <th className="py-3 px-4">VALUATION</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] text-neutral-300">
              {batches.map((batch) => {
                return (
                  <tr key={batch.id} className="hover:bg-[#111111] transition-colors duration-100">
                    <td className="py-4 px-4 font-bold text-white">{batch.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-serif italic text-lg text-white font-normal">{batch.commodity}</div>
                      <div className="text-[10px] text-neutral-400 uppercase">{batch.variety}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 border border-[#262626] bg-[#0E0E0E] text-white">
                        {batch.binName}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {batch.quantityMetricTons} MT
                    </td>
                    <td className="py-4 px-4 text-neutral-400 text-[11px]">
                      <div>H: {batch.harvestDate}</div>
                      <div className="text-neutral-400">IN: {batch.intakeDate}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            batch.currentSli < 50
                              ? "text-[#FF3333]"
                              : batch.currentSli < 75
                              ? "text-[#FFB000]"
                              : "text-[#00FF66]"
                          }`}
                        >
                          {batch.currentSli}%
                        </span>
                        <div className="w-16 bg-[#202020] h-1">
                          <div
                            className={`h-full ${
                              batch.currentSli < 50
                                ? "bg-[#FF3333]"
                                : batch.currentSli < 75
                                ? "bg-[#FFB000]"
                                : "bg-[#00FF66]"
                            }`}
                            style={{ width: `${batch.currentSli}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {batch.projectedSpoilageDate}
                    </td>
                    <td className="py-4 px-4 text-[#00FF66] font-bold">
                      ${batch.marketValueUsd.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBinId(batch.binId);
                          setActiveTab("bins");
                        }}
                        className="px-3 py-1 border border-[#262626] bg-[#EDEDED] text-black hover:bg-[#00FF66] transition-colors duration-100 font-bold uppercase text-[10px] cursor-pointer"
                      >
                        [ INSPECT ]
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
