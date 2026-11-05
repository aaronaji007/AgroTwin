import React, { useState, useEffect } from "react";
import { StatusBadge } from "../common/StatusBadge";
import { GaugeRing } from "../common/GaugeRing";
import { TelemetryCharts } from "./TelemetryCharts";
import { ActuatorControls } from "./ActuatorControls";
import { useTelemetry } from "../../context/TelemetryContext";
import { fetchBinHistory } from "../../services/api";

export function BinDetailView() {
  const {
    bins,
    selectedBinId,
    setSelectedBinId,
    selectedBin,
    batches
  } = useTelemetry();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!selectedBinId) return;
      try {
        setLoadingHistory(true);
        const data = await fetchBinHistory(selectedBinId, "24h");
        if (isMounted) setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [selectedBinId, selectedBin?.telemetry?.timestamp]);

  if (!selectedBin) {
    return (
      <div className="p-12 text-center text-neutral-400 font-mono text-xs uppercase tracking-widest">
        [ NO STORAGE CELL SELECTED ]
      </div>
    );
  }

  const batch = batches.find(b => b.id === selectedBin.batchId) || null;

  return (
    <div className="space-y-8 select-none">
      {/* 1. Chamber Switchboard Tabs (Sharp Mechanical Rectangles) */}
      <div className="flex items-center gap-px bg-[#262626] border border-[#262626] overflow-x-auto">
        {bins.map((bin, idx) => {
          const isSelected = bin.id === selectedBinId;
          return (
            <button
              key={bin.id}
              onClick={() => setSelectedBinId(bin.id)}
              className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider shrink-0 transition-colors duration-100 cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? "bg-[#EDEDED] text-black font-bold"
                  : "bg-[#0A0A0A] text-neutral-400 hover:text-white hover:bg-[#111111]"
              }`}
            >
              <span>0{idx + 1}. {bin.code}</span>
              <span className="text-[9px] text-neutral-400">// {bin.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Selected Chamber Primary Header */}
      <div className="bg-[#0A0A0A] border border-[#262626] p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[#202020]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
              <span className="text-[#00FF66]">■</span>
              <span>CHAMBER CODE: {selectedBin.code} // SECTOR 04</span>
            </div>
            <h2 className="font-serif italic text-3xl lg:text-5xl text-white font-normal tracking-tight">
              {selectedBin.name}
            </h2>
            <div className="font-mono text-xs text-neutral-400 mt-2 uppercase tracking-wider flex flex-wrap items-center gap-4">
              <span>COMMODITY: <strong className="text-white">{selectedBin.produceName}</strong> ({selectedBin.variety})</span>
              <span>/</span>
              <span>CAPACITY: {selectedBin.currentPallets} / {selectedBin.capacityPallets} PALLETS</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <StatusBadge status={selectedBin.status} />
            <GaugeRing value={selectedBin.telemetry.sli} size={64} label="SLI INDEX" />
          </div>
        </div>

        {/* 4 Sensor Telemetry Readouts (1px border grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#262626] border border-[#262626] mt-6">
          {/* Temperature */}
          <div className="p-4 bg-[#0A0A0A]">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1 flex justify-between">
              <span>TEMPERATURE</span>
              <span>[ {selectedBin.thresholds.minTemp}-{selectedBin.thresholds.maxTemp}°C ]</span>
            </div>
            <div className="font-mono text-2xl lg:text-3xl font-bold text-white">
              {selectedBin.telemetry.temperature.toFixed(2)}
              <span className="text-sm font-normal text-neutral-400 ml-1">°C</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-4 bg-[#0A0A0A]">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1 flex justify-between">
              <span>HUMIDITY</span>
              <span>[ {selectedBin.thresholds.minHumidity}-{selectedBin.thresholds.maxHumidity}% ]</span>
            </div>
            <div className="font-mono text-2xl lg:text-3xl font-bold text-white">
              {selectedBin.telemetry.humidity.toFixed(1)}
              <span className="text-sm font-normal text-neutral-400 ml-1">%</span>
            </div>
          </div>

          {/* Ethylene */}
          <div className="p-4 bg-[#0A0A0A]">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1 flex justify-between">
              <span>ETHYLENE</span>
              <span>[ &lt;{selectedBin.thresholds.maxEthylene} ]</span>
            </div>
            <div className="font-mono text-2xl lg:text-3xl font-bold text-white">
              {selectedBin.telemetry.ethylenePpm.toFixed(3)}
              <span className="text-sm font-normal text-neutral-400 ml-1">ppm</span>
            </div>
          </div>

          {/* VPD Deficit */}
          <div className="p-4 bg-[#0A0A0A]">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1 flex justify-between">
              <span>VPD DEFICIT</span>
              <span>[ TRANSPIRATION ]</span>
            </div>
            <div className="font-mono text-2xl lg:text-3xl font-bold text-white">
              {selectedBin.telemetry.vpdKpa.toFixed(2)}
              <span className="text-sm font-normal text-neutral-400 ml-1">kPa</span>
            </div>
          </div>
        </div>

        {/* PHYSICAL SENSOR CLUSTER (ESP32 HARDWARE LINK) */}
        {selectedBin.hardware && (
          <div className="mt-5 pt-4 border-t border-[#202020] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#00FF66] rounded-full animate-pulse"></span>
              <span className="text-neutral-400">
                ESP32 NODE: <strong className="text-white">{selectedBin.hardware.esp32DeviceId}</strong>
              </span>
              <span className="text-neutral-600">//</span>
              <span className="text-neutral-400">
                WIFI: <strong className="text-[#00FF66]">{selectedBin.hardware.wifiRssiDbm} dBm</strong>
              </span>
              <span className="text-neutral-600">//</span>
              <span className="text-neutral-400">
                UPTIME: <strong className="text-neutral-300">{Math.floor(selectedBin.hardware.uptimeSeconds / 60)}m</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {/* DHT11 */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#262626]">
                <span className="text-neutral-400 font-bold">DHT11:</span>
                <span className="text-white font-bold">{selectedBin.hardware.dht11.tempC}°C / {selectedBin.hardware.dht11.rhPct}%</span>
                <span className="text-[9px] text-[#00FF66] font-bold">[{selectedBin.hardware.dht11.status}]</span>
              </div>

              {/* MQ Gas */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#262626]">
                <span className="text-neutral-400 font-bold">MQ-135:</span>
                <span className="text-[#FFB000] font-bold">{selectedBin.hardware.gas.ppm} ppm</span>
                <span className="text-neutral-400 text-[10px]">({selectedBin.hardware.gas.rawAdc} ADC)</span>
                <span className={`text-[9px] font-bold ${selectedBin.hardware.gas.status === "ONLINE" ? "text-[#00FF66]" : "text-[#FFB000]"}`}>
                  [{selectedBin.hardware.gas.status}]
                </span>
              </div>

              {/* HC-SR04 */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#262626]">
                <span className="text-neutral-400 font-bold">HC-SR04:</span>
                <span className="text-white font-bold">{selectedBin.hardware.ultrasonic.distanceCm} cm</span>
                <span className="text-[#93C5FD] font-bold">({selectedBin.hardware.ultrasonic.fillLevelPct}% fill)</span>
                <span className="text-[9px] text-[#00FF66] font-bold">[{selectedBin.hardware.ultrasonic.status}]</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Grid: Oscilloscope Charts (2 cols), Actuator Relays (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TelemetryCharts
            history={history}
            thresholds={selectedBin.thresholds}
            produceName={selectedBin.produceName}
          />

          {/* Batch Biomass Dossier */}
          {batch && (
            <div className="bg-[#0A0A0A] border border-[#262626] p-6 font-mono">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#202020]">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                  [ BIOMASS INVENTORY RECORD // LOT {batch.id} ]
                </span>
                <span className="text-xs uppercase px-2 py-0.5 border border-[#262626] text-white">
                  {batch.qualityGrade}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#262626] border border-[#262626] text-xs">
                <div className="p-3 bg-[#0A0A0A]">
                  <span className="text-neutral-400 text-[10px] block">HARVEST DATE</span>
                  <span className="text-white font-bold mt-1 block">{batch.harvestDate}</span>
                </div>
                <div className="p-3 bg-[#0A0A0A]">
                  <span className="text-neutral-400 text-[10px] block">INTAKE DATE</span>
                  <span className="text-white font-bold mt-1 block">{batch.intakeDate}</span>
                </div>
                <div className="p-3 bg-[#0A0A0A]">
                  <span className="text-neutral-400 text-[10px] block">QUANTITY</span>
                  <span className="text-white font-bold mt-1 block">{batch.quantityMetricTons} MT</span>
                </div>
                <div className="p-3 bg-[#0A0A0A]">
                  <span className="text-neutral-400 text-[10px] block">MARKET VALUE</span>
                  <span className="text-[#00FF66] font-bold mt-1 block">${batch.marketValueUsd.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actuator Relays */}
        <div className="lg:col-span-1">
          <ActuatorControls bin={selectedBin} />
        </div>
      </div>
    </div>
  );
}
