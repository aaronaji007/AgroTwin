import React, { useState } from "react";
import { MetricCard } from "./MetricCard";
import { BinCard } from "./BinCard";
import { useTelemetry } from "../../context/TelemetryContext";

export function OverviewView() {
  const {
    bins,
    summary,
    setSelectedBinId,
    setActiveTab,
    triggerEvent,
    sendESP32Telemetry
  } = useTelemetry();

  const [activeEspBin, setActiveEspBin] = useState("BIN-01");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastTxStatus, setLastTxStatus] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleInspectBin = (binId) => {
    setSelectedBinId(binId);
    setActiveTab("bins");
  };

  const targetBin = bins.find(b => b.id === activeEspBin) || bins[0];
  const hw = targetBin?.hardware || {
    esp32DeviceId: "ESP32-NODE-01",
    dht11: { tempC: targetBin?.telemetry?.temperature || 1.8, rhPct: targetBin?.telemetry?.humidity || 92.1, status: "ONLINE" },
    gas: { sensorType: "MQ-135 / Ethylene", rawAdc: 320, ppm: targetBin?.telemetry?.ethylenePpm || 0.08, status: "ONLINE" },
    ultrasonic: { distanceCm: 44.0, fillLevelPct: 78.0, status: "ONLINE" },
    wifiRssiDbm: -56,
    uptimeSeconds: 14200,
    lastHeartbeat: new Date().toISOString()
  };

  const handleTransmitTestPacket = async (mode = "normal") => {
    try {
      setIsTransmitting(true);
      let packet = {
        device_id: hw.esp32DeviceId,
        bin_id: targetBin.id,
        rssi_dbm: -50 - Math.floor(Math.random() * 15),
        uptime_s: (hw.uptimeSeconds || 1000) + 15
      };

      if (mode === "normal") {
        packet.dht11_temp = +(targetBin.thresholds.minTemp + 0.8 + (Math.random() - 0.5) * 0.4).toFixed(1);
        packet.dht11_humidity = +(targetBin.thresholds.minHumidity + 3.0 + (Math.random() - 0.5) * 0.6).toFixed(1);
        packet.gas_raw = Math.floor(280 + Math.random() * 80);
        packet.gas_ppm = +((packet.gas_raw / 4095.0) * 2.5).toFixed(3);
        packet.ultrasonic_distance_cm = +(40.0 + (Math.random() - 0.5) * 5.0).toFixed(1);
      } else if (mode === "spike") {
        packet.dht11_temp = +(targetBin.thresholds.maxTemp + 2.5).toFixed(1);
        packet.dht11_humidity = +(targetBin.thresholds.minHumidity - 8.0).toFixed(1);
        packet.gas_raw = 2450;
        packet.gas_ppm = 1.48;
        packet.ultrasonic_distance_cm = 48.0;
      } else if (mode === "unload") {
        packet.dht11_temp = targetBin.telemetry.temperature;
        packet.dht11_humidity = targetBin.telemetry.humidity;
        packet.gas_raw = 300;
        packet.gas_ppm = 0.06;
        packet.ultrasonic_distance_cm = 165.0; // Produce unloaded, deep distance
      } else if (mode === "meltdown") {
        packet.dht11_temp = targetBin.telemetry.temperature;
        packet.dht11_humidity = targetBin.telemetry.humidity;
        packet.gas_raw = 340;
        packet.gas_ppm = 0.09;
        packet.ultrasonic_distance_cm = 3.2; // < 5.0 cm triggers nuclear reactor proximity siren!
        packet.fill_level_pct = 98.4;
      }

      await sendESP32Telemetry(packet);
      setLastTxStatus(`PACKET SENT // 200 OK (${new Date().toLocaleTimeString()})`);
      setTimeout(() => setLastTxStatus(null), 4000);
    } catch (err) {
      setLastTxStatus(`TX FAULT: ${err.message}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleCopyCurl = () => {
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:8000";
    const curl = `curl -X POST ${origin}/api/telemetry/esp32 -H "Content-Type: application/json" -d "{\\"device_id\\":\\"${hw.esp32DeviceId}\\",\\"bin_id\\":\\"${targetBin.id}\\",\\"dht11_temp\\":${hw.dht11.tempC},\\"dht11_humidity\\":${hw.dht11.rhPct},\\"gas_raw\\":${hw.gas.rawAdc},\\"gas_ppm\\":${hw.gas.ppm},\\"ultrasonic_distance_cm\\":${hw.ultrasonic.distanceCm}}"`;
    navigator.clipboard.writeText(curl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const ethyleneSpikes = bins.filter(
    b => b.telemetry.ethylenePpm > b.thresholds.maxEthylene
  ).length;

  return (
    <div className="space-y-8 select-none">
      {/* Editorial Page Title & Mechanical Trigger Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-2">
            <span className="text-[#00FF66]">■</span>
            <span>SYSTEM DIRECTORY // 01 // CONTROL MATRIX</span>
          </div>
          <h2 className="font-serif italic text-3xl lg:text-5xl text-white font-normal tracking-tight">
            Facility Telemetry Matrix
          </h2>
          <p className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Real-time hydro-thermal digital twin telemetry across 5 active post-harvest chambers
          </p>
        </div>

        {/* Mechanical Anomaly Injector Switchboard */}
        <div className="flex items-center gap-2 p-1.5 border border-[#262626] bg-[#0E0E0E] font-mono text-[11px] shrink-0">
          <span className="text-neutral-400 uppercase tracking-widest px-2 hidden sm:inline">
            [ INJECT ]:
          </span>
          <button
            onClick={() => triggerEvent("BIN-02", "ETHYLENE_SPIKE")}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-[#FFB000] hover:bg-[#FFB000] hover:text-black uppercase tracking-wider transition-colors duration-100 cursor-pointer"
          >
            +C₂H₄ SPIKE
          </button>
          <button
            onClick={() => triggerEvent("BIN-01", "DOOR_OPEN")}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-[#FFB000] hover:bg-[#FFB000] hover:text-black uppercase tracking-wider transition-colors duration-100 cursor-pointer"
          >
            +DOOR LEAK
          </button>
          <button
            onClick={() => triggerEvent("BIN-01", "RESTORE_OPTIMAL")}
            className="px-2.5 py-1 border border-[#262626] bg-[#141414] text-neutral-300 hover:bg-white hover:text-black uppercase tracking-wider transition-colors duration-100 cursor-pointer"
          >
            CALIBRATE
          </button>
        </div>
      </div>

      {/* 5 SUMMARY METRIC CARDS (Strict 60-30-10 Swiss Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#262626] border border-[#262626]">
        {/* 1. Active Bins */}
        <MetricCard
          index="01"
          title="ACTIVE UNITS"
          value={summary ? `${summary.activeBins}/${summary.totalBins}` : `${bins.length}/${bins.length}`}
          unit="CHAMBERS"
          trendLabel="100% ONLINE"
          trendType="positive"
          subtext="ALL CELLS OPERATIONAL"
          signalColor="green"
        />

        {/* 2. Mean Temperature */}
        <MetricCard
          index="02"
          title="MEAN TEMP"
          value={summary ? summary.avgTemperature.toFixed(1) : "6.7"}
          unit="°C"
          trendLabel="NORMAL RANGE"
          trendType="positive"
          subtext="BOUNDS: 0.5°C TO 14.5°C"
          signalColor="green"
        />

        {/* 3. Mean Humidity */}
        <MetricCard
          index="03"
          title="MEAN HUMIDITY"
          value={summary ? summary.avgHumidity.toFixed(1) : "90.5"}
          unit="%"
          trendLabel="PREVENTS DRY"
          trendType="positive"
          subtext="VPD DEFICIT OPTIMIZED"
          signalColor="green"
        />

        {/* 4. Ethylene Spikes */}
        <MetricCard
          index="04"
          title="ETHYLENE SPIKES"
          value={summary ? `${summary.warningCount + ethyleneSpikes}` : `${ethyleneSpikes}`}
          unit="ACTIVE"
          trendLabel={ethyleneSpikes > 0 ? "SURGE DETECTED" : "NOMINAL"}
          trendType={ethyleneSpikes > 0 ? "warning" : "positive"}
          subtext={ethyleneSpikes > 0 ? "SCRUBBERS ENGAGED" : "ZERO FLUX DETECTED"}
          signalColor={ethyleneSpikes > 0 ? "amber" : "green"}
        />

        {/* 5. Overall Inventory Health */}
        <MetricCard
          index="05"
          title="INVENTORY SLI"
          value={summary ? `${summary.avgSli.toFixed(0)}%` : "85%"}
          unit="SLI"
          trendLabel="GRADE A EXPORT"
          trendType="positive"
          subtext={`$${summary ? (summary.totalInventoryValueUsd / 1000).toFixed(0) : "193"}K VALUATION`}
          signalColor="white"
        />
      </div>

      {/* ========================================================================= */}
      {/* ESP32 MICROCONTROLLER & SENSOR CLUSTER LIVE TELEMETRY LINK (EXPO CORE) */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#262626] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-5 border-b border-[#202020] gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#00FF66] animate-pulse"></span>
            <div>
              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <span>[ HARDWARE INGESTION ENGINE ]</span>
                <span>//</span>
                <span className="text-[#00FF66]">LIVE TRANSDUCER LINK</span>
              </div>
              <h3 className="font-mono text-sm uppercase font-bold text-white tracking-wide mt-0.5">
                ESP32 Telemetry Cluster &bull; DHT11 &bull; MQ Gas &bull; HC-SR04 Ultrasonic
              </h3>
            </div>
          </div>

          {/* Chamber Switcher & Tx status */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            {lastTxStatus && (
              <span className="text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 border border-[#00FF66]/30 uppercase tracking-wider">
                {lastTxStatus}
              </span>
            )}
            <span className="text-neutral-400 uppercase">FEEDING:</span>
            <select
              value={activeEspBin}
              onChange={(e) => setActiveEspBin(e.target.value)}
              className="bg-[#141414] border border-[#333] text-white px-2 py-1 uppercase tracking-wider focus:outline-none focus:border-[#00FF66] cursor-pointer"
            >
              {bins.map(b => (
                <option key={b.id} value={b.id}>{b.code} ({b.name})</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 LIVE HARDWARE SENSOR CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626] border border-[#262626] mb-5">
          {/* SENSOR 1: DHT11 */}
          <div className="p-4 bg-[#0E0E0E]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                [ 01 // DHT11 SENSOR ]
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 uppercase font-bold">
                {hw.dht11.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">TEMPERATURE</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {hw.dht11.tempC.toFixed(1)}<span className="text-xs text-neutral-400 ml-1">°C</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">HUMIDITY</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {hw.dht11.rhPct.toFixed(1)}<span className="text-xs text-neutral-400 ml-1">%</span>
                </div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-neutral-400 mt-3 pt-2 border-t border-[#1C1C1C] flex justify-between">
              <span>PIN: GPIO 4 (1-WIRE)</span>
              <span>CALIBRATED VREF</span>
            </div>
          </div>

          {/* SENSOR 2: MQ GAS SENSOR */}
          <div className="p-4 bg-[#0E0E0E]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                [ 02 // GAS TRANSDUCER ]
              </span>
              <span className={`font-mono text-[9px] px-1.5 py-0.5 border uppercase font-bold ${
                hw.gas.status === "CRITICAL"
                  ? "bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/30"
                  : hw.gas.status === "WARNING"
                  ? "bg-[#FFB000]/10 text-[#FFB000] border-[#FFB000]/30"
                  : "bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30"
              }`}>
                {hw.gas.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">ETHYLENE CONC.</span>
                <div className="text-2xl font-bold text-[#FFB000] mt-0.5">
                  {hw.gas.ppm.toFixed(3)}<span className="text-xs text-neutral-400 ml-1">ppm</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">RAW ADC (12-BIT)</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {hw.gas.rawAdc}<span className="text-xs text-neutral-400 ml-1">/4095</span>
                </div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-neutral-400 mt-3 pt-2 border-t border-[#1C1C1C] flex justify-between">
              <span>TYPE: {hw.gas.sensorType}</span>
              <span>PIN: ADC1_CH4 (GPIO 32)</span>
            </div>
          </div>

          {/* SENSOR 3: HC-SR04 ULTRASONIC */}
          <div className="p-4 bg-[#0E0E0E]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                [ 03 // ULTRASONIC HC-SR04 ]
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 uppercase font-bold">
                {hw.ultrasonic.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">STACK DISTANCE</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {hw.ultrasonic.distanceCm.toFixed(1)}<span className="text-xs text-neutral-400 ml-1">cm</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">FILL CAPACITY</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {hw.ultrasonic.fillLevelPct.toFixed(1)}<span className="text-xs text-neutral-400 ml-1">%</span>
                </div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-neutral-400 mt-3 pt-2 border-t border-[#1C1C1C] flex justify-between">
              <span>TRIG: GPIO 5 &bull; ECHO: GPIO 18</span>
              <span>TIME-OF-FLIGHT SONAR</span>
            </div>
          </div>
        </div>

        {/* ESP32 LIVE INGESTION DEMO CONTROLS (FOR VIVA DEFENSE) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#202020] font-mono text-[11px]">
          <div className="flex items-center gap-3 text-neutral-400 text-xs">
            <span>NODE: <strong className="text-white">{hw.esp32DeviceId}</strong></span>
            <span>&bull;</span>
            <span>WIFI: <strong className="text-[#00FF66]">{hw.wifiRssiDbm} dBm</strong></span>
            <span>&bull;</span>
            <span>ENDPOINT: <code className="text-[#93C5FD]">POST /api/telemetry/esp32</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTransmitTestPacket("normal")}
              disabled={isTransmitting}
              className="px-3 py-1.5 bg-[#141414] hover:bg-[#00FF66] hover:text-black border border-[#333] text-white uppercase font-bold tracking-wider transition-colors duration-100 cursor-pointer disabled:opacity-50"
            >
              {isTransmitting ? "[ TRANSMITTING... ]" : "⚡ PULSE ESP32 PACKET"}
            </button>
            <button
              onClick={() => handleTransmitTestPacket("spike")}
              disabled={isTransmitting}
              className="px-3 py-1.5 bg-[#141414] hover:bg-[#FFB000] hover:text-black border border-[#333] text-[#FFB000] uppercase tracking-wider transition-colors duration-100 cursor-pointer disabled:opacity-50"
            >
              ⚠ TEST GAS SPIKE
            </button>
            <button
              onClick={() => handleTransmitTestPacket("meltdown")}
              disabled={isTransmitting}
              className="px-3 py-1.5 bg-[#141414] hover:bg-[#FF0033] hover:text-black border border-[#FF0033]/40 text-[#FF0033] uppercase font-bold tracking-wider transition-colors duration-100 cursor-pointer disabled:opacity-50"
              title="Inject Ultrasonic < 5.0 cm reading to test Nuclear Reactor Proximity Siren"
            >
              ☢ &lt;5CM SIREN
            </button>
            <button
              onClick={handleCopyCurl}
              className="px-3 py-1.5 bg-[#141414] hover:bg-white hover:text-black border border-[#333] text-neutral-300 uppercase tracking-wider transition-colors duration-100 cursor-pointer"
            >
              {copyFeedback ? "✓ CURL COPIED" : "📋 COPY CURL"}
            </button>
          </div>
        </div>
      </div>

      {/* STORAGE CHAMBER TELEMETRY GRID */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            [ SECTION // 02 ] // STORAGE CHAMBER CONTROL TERMINALS
          </div>
          <button
            onClick={() => setActiveTab("bins")}
            className="font-mono text-xs uppercase tracking-widest text-white hover:text-[#00FF66] transition-colors duration-100 flex items-center gap-1 cursor-pointer"
          >
            <span>EXPAND ALL DIAGNOSTICS &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bins.map((bin, idx) => (
            <BinCard
              key={bin.id}
              bin={bin}
              index={`0${idx + 1}`}
              onInspect={handleInspectBin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
