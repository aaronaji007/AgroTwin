/**
 * AgroTwin-Share API Service Layer
 * 
 * Features a toggleable mock service layer.
 * When USE_MOCK is true, all calls are serviced autonomously in-browser with
 * real-time fluctuating hydro-thermal calculations.
 * When USE_MOCK is false, API requests are seamlessly routed to the FastAPI backend.
 */

import { INITIAL_BINS, INITIAL_BATCHES, INITIAL_ALERTS, generateBinHistory } from "./mockData";
import { calculateVPD, stepSLI, runWhatIfSimulation, COMMODITY_PROFILES } from "./digitalTwinModel";

// ==========================================
// CONFIGURATION FLAG
// ==========================================
export const USE_MOCK = true;

// Determine backend URL:
// 1. If VITE_BACKEND_URL is explicitly configured, use it.
// 2. In local dev (localhost/127.0.0.1), default to http://localhost:8000.
// 3. In production (e.g. Vercel deployment), use "" (same-origin relative URL) so requests route to /api/index.py over HTTPS with zero mixed-content errors.
const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || (isLocalhost ? "http://localhost:8000" : "");

// Runtime toggle support allows live toggling from the SCADA top status bar
// while strictly defaulting to USE_MOCK constant
let runtimeMockOverride = null;
try {
  const stored = localStorage.getItem("agrotwin_use_mock");
  if (stored !== null) {
    runtimeMockOverride = stored === "true";
  }
} catch {
  // localStorage may be unavailable in some sandboxes
}

export function isMockEnabled() {
  return runtimeMockOverride !== null ? runtimeMockOverride : USE_MOCK;
}

export function setMockEnabled(val) {
  runtimeMockOverride = Boolean(val);
  try {
    localStorage.setItem("agrotwin_use_mock", String(runtimeMockOverride));
  } catch {}
}

// In-Memory state store for Mock Mode
class MockDataStore {
  constructor() {
    this.bins = JSON.parse(JSON.stringify(INITIAL_BINS));
    this.batches = JSON.parse(JSON.stringify(INITIAL_BATCHES));
    this.alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
    this.history = {};

    // Pre-populate 24h history for each bin
    this.bins.forEach(bin => {
      this.history[bin.id] = generateBinHistory(bin, 24);
    });
  }

  getBins() {
    return [...this.bins];
  }

  getBin(id) {
    return this.bins.find(b => b.id === id) || null;
  }

  getBatches() {
    return [...this.batches];
  }

  getHistory(binId) {
    return this.history[binId] || [];
  }

  getAlerts() {
    return [...this.alerts];
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  updateThresholds(binId, thresholds) {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return null;
    bin.thresholds = { ...bin.thresholds, ...thresholds };
    this._recheckBinStatus(bin);
    return { ...bin };
  }

  simulateEvent(binId, eventType) {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return null;

    const now = new Date();
    let { temperature, humidity, ethylenePpm } = bin.telemetry;

    if (eventType === "DOOR_OPEN") {
      temperature += 3.2;
      humidity = Math.max(60, humidity - 14);
      this.alerts.unshift({
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        binId: bin.id,
        binName: bin.name,
        parameter: "BAY_DOOR",
        severity: "WARNING",
        value: +temperature.toFixed(1),
        threshold: bin.thresholds.maxTemp,
        unit: "°C",
        message: `Chamber loading seal opened in ${bin.name}. Thermal ingress +3.2°C.`,
        timestamp: now.toISOString(),
        acknowledged: false
      });
    } else if (eventType === "COOLING_FAIL") {
      temperature += 6.5;
      humidity = Math.max(50, humidity - 20);
      bin.compressorActive = false;
      this.alerts.unshift({
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        binId: bin.id,
        binName: bin.name,
        parameter: "COMPRESSOR",
        severity: "CRITICAL",
        value: +temperature.toFixed(1),
        threshold: bin.thresholds.maxTemp,
        unit: "°C",
        message: `Compressor circuit breaker trip in ${bin.name}. Chamber warming rapidly!`,
        timestamp: now.toISOString(),
        acknowledged: false
      });
    } else if (eventType === "ETHYLENE_SPIKE") {
      ethylenePpm += 0.65;
      bin.ethyleneScrubberActive = true;
      this.alerts.unshift({
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        binId: bin.id,
        binName: bin.name,
        parameter: "ETHYLENE",
        severity: "WARNING",
        value: +ethylenePpm.toFixed(3),
        threshold: bin.thresholds.maxEthylene,
        unit: "ppm",
        message: `Ethylene burst (${ethylenePpm.toFixed(2)} ppm) detected in ${bin.name}. Climacteric acceleration active.`,
        timestamp: now.toISOString(),
        acknowledged: false
      });
    } else if (eventType === "RESTORE_OPTIMAL") {
      const profile = COMMODITY_PROFILES[bin.produceName] || {};
      temperature = profile.optimalTempC || 2.0;
      humidity = profile.optimalRhPct || 90.0;
      ethylenePpm = Math.min(0.04, (profile.ethyleneThresholdPpm || 0.1) * 0.4);
      bin.compressorActive = true;
      bin.evaporatorFanActive = true;
      bin.ethyleneScrubberActive = false;
    }

    return this.applyTelemetryUpdate(binId, temperature, humidity, ethylenePpm);
  }

  ingestESP32Packet(packet) {
    const binId = packet.bin_id || packet.binId || "BIN-01";
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return null;

    const temp = packet.dht11_temp !== undefined ? packet.dht11_temp : (packet.temperature !== undefined ? packet.temperature : bin.telemetry.temperature);
    const rh = packet.dht11_humidity !== undefined ? packet.dht11_humidity : (packet.humidity !== undefined ? packet.humidity : bin.telemetry.humidity);

    const rawAdc = packet.gas_raw !== undefined ? packet.gas_raw : (bin.hardware ? bin.hardware.gas.rawAdc : 350);
    let gasPpm = bin.telemetry.ethylenePpm;
    if (packet.gas_ppm !== undefined) gasPpm = packet.gas_ppm;
    else if (packet.ethylene_ppm !== undefined) gasPpm = packet.ethylene_ppm;
    else if (packet.gas_raw !== undefined) gasPpm = +( (rawAdc / 4095.0) * 2.5 ).toFixed(3);

    const distCm = packet.ultrasonic_distance_cm !== undefined ? packet.ultrasonic_distance_cm : (bin.hardware ? bin.hardware.ultrasonic.distanceCm : 44.0);
    const fillPct = packet.fill_level_pct !== undefined ? packet.fill_level_pct : Math.max(0, Math.min(100, +((1.0 - distCm / 200.0) * 100).toFixed(1)));

    const now = new Date();
    const dhtStatus = (temp < -10 || temp > 65 || rh < 10 || rh > 100) ? "FAULT" : "ONLINE";
    const gasStatus = gasPpm > bin.thresholds.maxEthylene * 2.0 ? "CRITICAL" : (gasPpm > bin.thresholds.maxEthylene ? "WARNING" : "ONLINE");
    const ultraStatus = (distCm > 400 || distCm < 2) ? "FAULT" : "ONLINE";

    bin.hardware = {
      esp32DeviceId: packet.device_id || packet.deviceId || (bin.hardware ? bin.hardware.esp32DeviceId : "ESP32-NODE-01"),
      dht11: {
        tempC: +temp.toFixed(1),
        rhPct: +rh.toFixed(1),
        status: dhtStatus
      },
      gas: {
        sensorType: "MQ-135 / Ethylene",
        rawAdc: Math.round(rawAdc),
        ppm: +gasPpm.toFixed(3),
        status: gasStatus
      },
      ultrasonic: {
        distanceCm: +distCm.toFixed(1),
        fillLevelPct: +fillPct.toFixed(1),
        status: ultraStatus
      },
      wifiRssiDbm: packet.rssi_dbm !== undefined ? packet.rssi_dbm : (bin.hardware ? bin.hardware.wifiRssiDbm : -56),
      uptimeSeconds: packet.uptime_s !== undefined ? packet.uptime_s : (bin.hardware ? bin.hardware.uptimeSeconds + 10 : 14200),
      lastHeartbeat: now.toISOString()
    };

    return this.applyTelemetryUpdate(bin.id, temp, rh, gasPpm);
  }

  applyTelemetryUpdate(binId, temp, rh, eth) {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return null;

    const vpd = calculateVPD(temp, rh);
    const newSli = stepSLI(bin.telemetry.sli, bin.produceName, temp, rh, eth, 0.25);
    const now = new Date();

    bin.telemetry = {
      ...bin.telemetry,
      timestamp: now.toISOString(),
      temperature: +temp.toFixed(2),
      humidity: +rh.toFixed(1),
      ethylenePpm: +eth.toFixed(3),
      sli: +newSli.toFixed(1),
      vpdKpa: vpd
    };
    bin.lastUpdated = now.toISOString();

    // Update batch
    const batch = this.batches.find(b => b.id === bin.batchId);
    if (batch) {
      batch.currentSli = bin.telemetry.sli;
      if (batch.currentSli < 45) batch.riskLevel = "CRITICAL";
      else if (batch.currentSli < 75) batch.riskLevel = "MEDIUM";
      else batch.riskLevel = "LOW";
    }

    // Append to history
    if (!this.history[binId]) this.history[binId] = [];
    this.history[binId].push({
      timestamp: now.toISOString(),
      timeLabel: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      temperature: bin.telemetry.temperature,
      humidity: bin.telemetry.humidity,
      ethylenePpm: bin.telemetry.ethylenePpm,
      co2Ppm: bin.telemetry.co2Ppm,
      sli: bin.telemetry.sli,
      vpdKpa: vpd
    });
    if (this.history[binId].length > 40) {
      this.history[binId].shift();
    }

    this._recheckBinStatus(bin);
    return { ...bin };
  }

  // Periodic fluctuation generator for real-time SCADA feel
  fluctuateAll() {
    this.bins.forEach(bin => {
      // Gentle subtle Brownian noise
      const dTemp = (Math.random() - 0.49) * 0.08;
      const dRh = (Math.random() - 0.5) * 0.15;
      const dEth = (Math.random() - 0.5) * 0.005;

      const newTemp = Math.max(-2, Math.min(25, bin.telemetry.temperature + dTemp));
      const newRh = Math.max(50, Math.min(99, bin.telemetry.humidity + dRh));
      const newEth = Math.max(0.01, bin.telemetry.ethylenePpm + dEth);

      if (bin.hardware) {
        bin.hardware.dht11.tempC = +newTemp.toFixed(1);
        bin.hardware.dht11.rhPct = +newRh.toFixed(1);
        bin.hardware.gas.ppm = +newEth.toFixed(3);
        bin.hardware.gas.rawAdc = Math.min(4095, Math.max(120, Math.round((newEth / 2.5) * 4095)));
        bin.hardware.uptimeSeconds += 2;
        bin.hardware.lastHeartbeat = new Date().toISOString();
      }
      this.applyTelemetryUpdate(bin.id, newTemp, newRh, newEth);
    });
    return [...this.bins];
  }

  _recheckBinStatus(bin) {
    const t = bin.telemetry.temperature;
    const rh = bin.telemetry.humidity;
    const eth = bin.telemetry.ethylenePpm;
    const th = bin.thresholds;

    const critical = t > th.maxTemp + 2.5 || t < th.minTemp - 2.0 || rh < th.minHumidity - 12 || eth > th.maxEthylene * 2.5 || bin.telemetry.sli < 45;
    const warning = t > th.maxTemp || t < th.minTemp || rh < th.minHumidity || rh > th.maxHumidity || eth > th.maxEthylene || bin.telemetry.sli < 75;

    if (critical) bin.status = "CRITICAL";
    else if (warning) bin.status = "WARNING";
    else bin.status = "NOMINAL";
  }

  getSummary() {
    const totalBins = this.bins.length;
    const activeBins = this.bins.filter(b => b.status !== "OFFLINE").length;
    const avgTemp = +(this.bins.reduce((acc, b) => acc + b.telemetry.temperature, 0) / totalBins).toFixed(2);
    const avgRh = +(this.bins.reduce((acc, b) => acc + b.telemetry.humidity, 0) / totalBins).toFixed(1);
    const avgEth = +(this.bins.reduce((acc, b) => acc + b.telemetry.ethylenePpm, 0) / totalBins).toFixed(3);
    const avgSli = +(this.bins.reduce((acc, b) => acc + b.telemetry.sli, 0) / totalBins).toFixed(1);

    const warningCount = this.bins.filter(b => b.status === "WARNING").length;
    const criticalCount = this.bins.filter(b => b.status === "CRITICAL").length;
    const totalInventoryValueUsd = this.batches.reduce((acc, b) => acc + b.marketValueUsd, 0);

    let systemStatus = "OPTIMAL";
    if (criticalCount > 0) systemStatus = "CRITICAL_ACTION_REQUIRED";
    else if (warningCount > 0) systemStatus = "ATTENTION_REQUIRED";

    return {
      totalBins,
      activeBins,
      avgTemperature: avgTemp,
      avgHumidity: avgRh,
      avgEthylene: avgEth,
      avgSli,
      warningCount,
      criticalCount,
      totalInventoryValueUsd,
      systemStatus
    };
  }
}

// Singleton mock store instance
export const mockStore = new MockDataStore();

// ==========================================
// UNIFIED API METHODS
// (Automatically switch between Mock and Backend)
// ==========================================

export async function fetchBins() {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.getBins());
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/bins`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  const data = await res.json();
  // Map python snake_case to frontend camelCase if needed
  return normalizeBins(data);
}

export async function fetchBinById(binId) {
  if (isMockEnabled()) {
    const bin = mockStore.getBin(binId);
    if (!bin) throw new Error("Bin not found");
    return Promise.resolve(bin);
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/bins/${binId}`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  const data = await res.json();
  return normalizeBin(data);
}

export async function fetchBatches() {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.getBatches());
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/batches`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  const data = await res.json();
  return normalizeBatches(data);
}

export async function fetchBinHistory(binId, range = "24h") {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.getHistory(binId));
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/bins/${binId}/history?range=${range}`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  const data = await res.json();
  return data.map(pt => ({
    timestamp: pt.timestamp,
    timeLabel: new Date(pt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    temperature: pt.temperature,
    humidity: pt.humidity,
    ethylenePpm: pt.ethylene_ppm,
    co2Ppm: pt.co2_ppm,
    sli: pt.sli,
    vpdKpa: pt.vpd_kpa
  }));
}

export async function ingestTelemetry(packet) {
  if (isMockEnabled()) {
    const updated = mockStore.applyTelemetryUpdate(
      packet.binId || packet.bin_id,
      packet.temperature,
      packet.humidity,
      packet.ethylenePpm || packet.ethylene_ppm
    );
    return Promise.resolve(updated);
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bin_id: packet.binId || packet.bin_id,
      temperature: packet.temperature,
      humidity: packet.humidity,
      ethylene_ppm: packet.ethylenePpm || packet.ethylene_ppm,
      co2_ppm: packet.co2Ppm || packet.co2_ppm
    })
  });
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return normalizeBin(await res.json());
}

export async function ingestESP32Telemetry(packet) {
  if (isMockEnabled()) {
    const updated = mockStore.ingestESP32Packet(packet);
    if (!updated) throw new Error("Target chamber not found");
    return Promise.resolve(updated);
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/telemetry/esp32`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(packet)
  });
  if (!res.ok) throw new Error(`ESP32 Ingestion failed: ${res.statusText}`);
  return normalizeBin(await res.json());
}

export async function updateBinThresholds(binId, thresholds) {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.updateThresholds(binId, thresholds));
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/bins/${binId}/thresholds`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      min_temp: thresholds.minTemp,
      max_temp: thresholds.maxTemp,
      min_humidity: thresholds.minHumidity,
      max_humidity: thresholds.maxHumidity,
      max_ethylene: thresholds.maxEthylene
    })
  });
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return normalizeBin(await res.json());
}

export async function simulateBinEvent(binId, eventType) {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.simulateEvent(binId, eventType));
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/bins/${binId}/simulate-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType })
  });
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return normalizeBin(await res.json());
}

export async function runDigitalTwinSimulation(params) {
  if (isMockEnabled()) {
    return Promise.resolve(runWhatIfSimulation(params));
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/simulate/sli`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commodity: params.commodity,
      initial_sli: params.initialSli,
      temperature: params.temperature,
      humidity: params.humidity,
      ethylene_ppm: params.ethylenePpm,
      projection_days: params.projectionDays,
      baseline_temp: params.baselineTemp,
      baseline_humidity: params.baselineHumidity,
      baseline_ethylene: params.baselineEthylene,
      batch_value_usd: params.batchValueUsd
    })
  });
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  const data = await res.json();
  return {
    commodity: data.commodity,
    baselineDaysRemaining: data.baseline_days_remaining,
    simulatedDaysRemaining: data.simulated_days_remaining,
    shelfLifeDeltaDays: data.shelf_life_delta_days,
    estimatedEconomicImpactUsd: data.estimated_economic_impact_usd,
    riskVerdict: data.risk_verdict,
    trajectory: data.trajectory.map(pt => ({
      day: pt.day,
      date: pt.date,
      baselineSli: pt.baseline_sli,
      simulatedSli: pt.simulated_sli,
      vpdKpa: pt.vpd_kpa,
      decayMultiplier: pt.decay_multiplier
    }))
  };
}

export async function fetchAlerts() {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.getAlerts());
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/alerts`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return await res.json();
}

export async function acknowledgeAlert(alertId) {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.acknowledgeAlert(alertId));
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/alerts/${alertId}/acknowledge`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return await res.json();
}

export async function fetchSystemSummary() {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.getSummary());
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/summary`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  const s = await res.json();
  return {
    totalBins: s.total_bins,
    activeBins: s.active_bins,
    avgTemperature: s.avg_temperature,
    avgHumidity: s.avg_humidity,
    avgEthylene: s.avg_ethylene,
    avgSli: s.avg_sli,
    warningCount: s.warning_count,
    criticalCount: s.critical_count,
    totalInventoryValueUsd: s.total_inventory_value_usd,
    systemStatus: s.system_status
  };
}

// Helpers for normalizing backend snake_case response
function normalizeBin(b) {
  return {
    id: b.id,
    code: b.code,
    name: b.name,
    zone: b.zone,
    facility: b.facility,
    produceName: b.produce_name,
    variety: b.variety,
    batchId: b.batch_id,
    capacityPallets: b.capacity_pallets,
    currentPallets: b.current_pallets,
    telemetry: {
      timestamp: b.telemetry.timestamp,
      temperature: b.telemetry.temperature,
      humidity: b.telemetry.humidity,
      ethylenePpm: b.telemetry.ethylene_ppm,
      co2Ppm: b.telemetry.co2_ppm,
      sli: b.telemetry.sli,
      vpdKpa: b.telemetry.vpd_kpa
    },
    thresholds: {
      minTemp: b.thresholds.min_temp,
      maxTemp: b.thresholds.max_temp,
      minHumidity: b.thresholds.min_humidity,
      maxHumidity: b.thresholds.max_humidity,
      maxEthylene: b.thresholds.max_ethylene
    },
    hardware: b.hardware ? {
      esp32DeviceId: b.hardware.esp32_device_id || b.hardware.esp32DeviceId || "ESP32-NODE-01",
      dht11: {
        tempC: b.hardware.dht11.temp_c !== undefined ? b.hardware.dht11.temp_c : b.hardware.dht11.tempC,
        rhPct: b.hardware.dht11.rh_pct !== undefined ? b.hardware.dht11.rh_pct : b.hardware.dht11.rhPct,
        status: b.hardware.dht11.status
      },
      gas: {
        sensorType: b.hardware.gas.sensor_type || b.hardware.gas.sensorType || "MQ-135 / Ethylene",
        rawAdc: b.hardware.gas.raw_adc !== undefined ? b.hardware.gas.raw_adc : b.hardware.gas.rawAdc,
        ppm: b.hardware.gas.ppm,
        status: b.hardware.gas.status
      },
      ultrasonic: {
        distanceCm: b.hardware.ultrasonic.distance_cm !== undefined ? b.hardware.ultrasonic.distance_cm : b.hardware.ultrasonic.distanceCm,
        fillLevelPct: b.hardware.ultrasonic.fill_level_pct !== undefined ? b.hardware.ultrasonic.fill_level_pct : b.hardware.ultrasonic.fillLevelPct,
        status: b.hardware.ultrasonic.status
      },
      wifiRssiDbm: b.hardware.wifi_rssi_dbm !== undefined ? b.hardware.wifi_rssi_dbm : b.hardware.wifiRssiDbm,
      uptimeSeconds: b.hardware.uptime_seconds !== undefined ? b.hardware.uptime_seconds : b.hardware.uptimeSeconds,
      lastHeartbeat: b.hardware.last_heartbeat || b.hardware.lastHeartbeat
    } : null,
    status: b.status,
    estimatedDaysRemaining: b.estimated_days_remaining,
    compressorActive: b.compressor_active,
    evaporatorFanActive: b.evaporator_fan_active,
    ethyleneScrubberActive: b.ethylene_scrubber_active,
    lastUpdated: b.last_updated
  };
}

function normalizeBins(bins) {
  return bins.map(normalizeBin);
}

function normalizeBatches(batches) {
  return batches.map(b => ({
    id: b.id,
    binId: b.bin_id,
    binName: b.bin_name,
    commodity: b.commodity,
    variety: b.variety,
    category: b.category,
    harvestDate: b.harvest_date,
    intakeDate: b.intake_date,
    quantityMetricTons: b.quantity_metric_tons,
    initialSli: b.initial_sli,
    currentSli: b.current_sli,
    nominalShelfLifeDays: b.nominal_shelf_life_days,
    projectedSpoilageDate: b.projected_spoilage_date,
    marketValueUsd: b.market_value_usd,
    qualityGrade: b.quality_grade,
    riskLevel: b.risk_level
  }));
}
