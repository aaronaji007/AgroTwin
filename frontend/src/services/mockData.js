import { calculateVPD, stepSLI } from "./digitalTwinModel";

export const INITIAL_BATCHES = [
  {
    id: "BATCH-2026-HCA01",
    binId: "BIN-01",
    binName: "Cold Room Alpha",
    commodity: "Honeycrisp Apples",
    variety: "Highland Select Premium",
    category: "CLIMACTERIC",
    harvestDate: "2026-10-14",
    intakeDate: "2026-10-16",
    quantityMetricTons: 42.5,
    initialSli: 100.0,
    currentSli: 91.4,
    nominalShelfLifeDays: 180,
    projectedSpoilageDate: "2027-04-14",
    marketValueUsd: 51000,
    qualityGrade: "Grade A Export",
    riskLevel: "LOW"
  },
  {
    id: "BATCH-2026-BAN02",
    binId: "BIN-02",
    binName: "Ripening Chamber Beta",
    commodity: "Cavendish Bananas",
    variety: "Ecuador Gold (Stage 3)",
    category: "CLIMACTERIC",
    harvestDate: "2026-10-23",
    intakeDate: "2026-10-29",
    quantityMetricTons: 38.0,
    initialSli: 95.0,
    currentSli: 72.8,
    nominalShelfLifeDays: 28,
    projectedSpoilageDate: "2026-11-20",
    marketValueUsd: 32300,
    qualityGrade: "Commercial Stage 3.5",
    riskLevel: "MEDIUM"
  },
  {
    id: "BATCH-2026-AVO03",
    binId: "BIN-03",
    binName: "Controlled Atmosphere Gamma",
    commodity: "Hass Avocados",
    variety: "Michoacán Prime",
    category: "CLIMACTERIC",
    harvestDate: "2026-10-20",
    intakeDate: "2026-10-24",
    quantityMetricTons: 29.5,
    initialSli: 100.0,
    currentSli: 85.0,
    nominalShelfLifeDays: 35,
    projectedSpoilageDate: "2026-11-28",
    marketValueUsd: 53100,
    qualityGrade: "Pre-conditioning Grade 1",
    riskLevel: "LOW"
  },
  {
    id: "BATCH-2026-STR04",
    binId: "BIN-04",
    binName: "Pre-Cooling Unit Delta",
    commodity: "Sweet Strawberries",
    variety: "Albion Fresh Berry",
    category: "NON_CLIMACTERIC",
    harvestDate: "2026-10-30",
    intakeDate: "2026-10-31",
    quantityMetricTons: 14.2,
    initialSli: 100.0,
    currentSli: 96.2,
    nominalShelfLifeDays: 14,
    projectedSpoilageDate: "2026-11-14",
    marketValueUsd: 34080,
    qualityGrade: "Direct Retail Ultra",
    riskLevel: "LOW"
  },
  {
    id: "BATCH-2026-TOM05",
    binId: "BIN-05",
    binName: "Post-Harvest Bay Epsilon",
    commodity: "Roma Tomatoes",
    variety: "San Marzano Greenhouse",
    category: "CLIMACTERIC",
    harvestDate: "2026-10-26",
    intakeDate: "2026-10-28",
    quantityMetricTons: 25.0,
    initialSli: 98.0,
    currentSli: 78.5,
    nominalShelfLifeDays: 24,
    projectedSpoilageDate: "2026-11-19",
    marketValueUsd: 23000,
    qualityGrade: "Culinary Grade A",
    riskLevel: "LOW"
  }
];

export const INITIAL_BINS = [
  {
    id: "BIN-01",
    code: "CR-ALPHA",
    name: "Cold Room Alpha",
    zone: "North Wing - Sector 1",
    facility: "Central Cold Storage Hub #4",
    produceName: "Honeycrisp Apples",
    variety: "Highland Select Premium",
    batchId: "BATCH-2026-HCA01",
    capacityPallets: 240,
    currentPallets: 180,
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 1.8,
      humidity: 92.1,
      ethylenePpm: 0.08,
      co2Ppm: 510,
      sli: 91.4,
      vpdKpa: calculateVPD(1.8, 92.1)
    },
        hardware: {
      esp32DeviceId: "ESP32-NODE-01",
      dht11: { tempC: 1.8, rhPct: 92.1, status: "ONLINE" },
      gas: { sensorType: "MQ-135 / Ethylene", rawAdc: 320, ppm: 0.08, status: "ONLINE" },
      ultrasonic: { distanceCm: 44.0, fillLevelPct: 78.0, status: "ONLINE" },
      wifiRssiDbm: -56,
      uptimeSeconds: 14200,
      lastHeartbeat: new Date().toISOString()
    },
    thresholds: {
      minTemp: 0.5,
      maxTemp: 3.5,
      minHumidity: 88.0,
      maxHumidity: 96.0,
      maxEthylene: 0.15
    },
    status: "NOMINAL",
    estimatedDaysRemaining: 164,
    compressorActive: true,
    evaporatorFanActive: true,
    ethyleneScrubberActive: false,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "BIN-02",
    code: "RC-BETA",
    name: "Ripening Chamber Beta",
    zone: "Ripening Annex - Hall 2",
    facility: "Central Cold Storage Hub #4",
    produceName: "Cavendish Bananas",
    variety: "Ecuador Gold (Stage 3)",
    batchId: "BATCH-2026-BAN02",
    capacityPallets: 220,
    currentPallets: 210,
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 14.5,
      humidity: 88.4,
      ethylenePpm: 1.25,
      co2Ppm: 1120,
      sli: 72.8,
      vpdKpa: calculateVPD(14.5, 88.4)
    },
        hardware: {
      esp32DeviceId: "ESP32-NODE-02",
      dht11: { tempC: 14.5, rhPct: 88.4, status: "ONLINE" },
      gas: { sensorType: "MQ-135 / Ethylene", rawAdc: 1850, ppm: 1.25, status: "WARNING" },
      ultrasonic: { distanceCm: 22.0, fillLevelPct: 89.0, status: "ONLINE" },
      wifiRssiDbm: -62,
      uptimeSeconds: 28400,
      lastHeartbeat: new Date().toISOString()
    },
    thresholds: {
      minTemp: 12.5,
      maxTemp: 16.0,
      minHumidity: 84.0,
      maxHumidity: 94.0,
      maxEthylene: 1.50
    },
    status: "WARNING",
    estimatedDaysRemaining: 19,
    compressorActive: true,
    evaporatorFanActive: true,
    ethyleneScrubberActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "BIN-03",
    code: "CA-GAMMA",
    name: "Controlled Atmosphere Gamma",
    zone: "Hermetic Vault - Bay 3",
    facility: "Central Cold Storage Hub #4",
    produceName: "Hass Avocados",
    variety: "Michoacán Prime",
    batchId: "BATCH-2026-AVO03",
    capacityPallets: 180,
    currentPallets: 160,
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 5.2,
      humidity: 91.0,
      ethylenePpm: 0.12,
      co2Ppm: 620,
      sli: 85.0,
      vpdKpa: calculateVPD(5.2, 91.0)
    },
        hardware: {
      esp32DeviceId: "ESP32-NODE-03",
      dht11: { tempC: 5.2, rhPct: 91.0, status: "ONLINE" },
      gas: { sensorType: "MQ-135 / Ethylene", rawAdc: 490, ppm: 0.12, status: "WARNING" },
      ultrasonic: { distanceCm: 52.0, fillLevelPct: 74.0, status: "ONLINE" },
      wifiRssiDbm: -51,
      uptimeSeconds: 8900,
      lastHeartbeat: new Date().toISOString()
    },
    thresholds: {
      minTemp: 4.0,
      maxTemp: 7.0,
      minHumidity: 85.0,
      maxHumidity: 95.0,
      maxEthylene: 0.10
    },
    status: "WARNING",
    estimatedDaysRemaining: 27,
    compressorActive: true,
    evaporatorFanActive: true,
    ethyleneScrubberActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "BIN-04",
    code: "PC-DELTA",
    name: "Pre-Cooling Unit Delta",
    zone: "Hydro-Cooling Line - Cell A",
    facility: "Central Cold Storage Hub #4",
    produceName: "Sweet Strawberries",
    variety: "Albion Fresh Berry",
    batchId: "BATCH-2026-STR04",
    capacityPallets: 100,
    currentPallets: 95,
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 0.8,
      humidity: 94.3,
      ethylenePpm: 0.04,
      co2Ppm: 420,
      sli: 96.2,
      vpdKpa: calculateVPD(0.8, 94.3)
    },
        hardware: {
      esp32DeviceId: "ESP32-NODE-04",
      dht11: { tempC: 0.8, rhPct: 94.3, status: "ONLINE" },
      gas: { sensorType: "MQ-135 / Ethylene", rawAdc: 210, ppm: 0.04, status: "ONLINE" },
      ultrasonic: { distanceCm: 16.0, fillLevelPct: 92.0, status: "ONLINE" },
      wifiRssiDbm: -68,
      uptimeSeconds: 5200,
      lastHeartbeat: new Date().toISOString()
    },
    thresholds: {
      minTemp: 0.0,
      maxTemp: 2.2,
      minHumidity: 90.0,
      maxHumidity: 97.0,
      maxEthylene: 0.50
    },
    status: "NOMINAL",
    estimatedDaysRemaining: 13,
    compressorActive: true,
    evaporatorFanActive: true,
    ethyleneScrubberActive: false,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "BIN-05",
    code: "PH-EPSILON",
    name: "Post-Harvest Bay Epsilon",
    zone: "Buffer Transit Hub - Dock 5",
    facility: "Central Cold Storage Hub #4",
    produceName: "Roma Tomatoes",
    variety: "San Marzano Greenhouse",
    batchId: "BATCH-2026-TOM05",
    capacityPallets: 160,
    currentPallets: 140,
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 11.8,
      humidity: 86.5,
      ethylenePpm: 0.35,
      co2Ppm: 680,
      sli: 78.5,
      vpdKpa: calculateVPD(11.8, 86.5)
    },
        hardware: {
      esp32DeviceId: "ESP32-NODE-05",
      dht11: { tempC: 11.8, rhPct: 86.5, status: "ONLINE" },
      gas: { sensorType: "MQ-135 / Ethylene", rawAdc: 820, ppm: 0.35, status: "ONLINE" },
      ultrasonic: { distanceCm: 35.0, fillLevelPct: 82.5, status: "ONLINE" },
      wifiRssiDbm: -54,
      uptimeSeconds: 36100,
      lastHeartbeat: new Date().toISOString()
    },
    thresholds: {
      minTemp: 9.5,
      maxTemp: 14.0,
      minHumidity: 85.0,
      maxHumidity: 92.0,
      maxEthylene: 0.40
    },
    status: "NOMINAL",
    estimatedDaysRemaining: 18,
    compressorActive: true,
    evaporatorFanActive: true,
    ethyleneScrubberActive: false,
    lastUpdated: new Date().toISOString()
  }
];

export const INITIAL_ALERTS = [
  {
    id: "ALT-1092",
    binId: "BIN-03",
    binName: "Controlled Atmosphere Gamma",
    parameter: "ETHYLENE",
    severity: "WARNING",
    value: 0.12,
    threshold: 0.10,
    unit: "ppm",
    message: "Ethylene level (0.12 ppm) exceeded threshold (0.10 ppm). Auto-activated catalytic scrubber.",
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    acknowledged: false
  },
  {
    id: "ALT-1091",
    binId: "BIN-02",
    binName: "Ripening Chamber Beta",
    parameter: "TEMPERATURE",
    severity: "INFO",
    value: 14.5,
    threshold: 14.0,
    unit: "°C",
    message: "Scheduled thermal rise initiated for Cavendish ripening ramp sequence Stage 3.",
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    acknowledged: true
  }
];

/**
 * Generate 24 historical points for a bin
 */
export function generateBinHistory(bin, count = 24) {
  const points = [];
  const now = Date.now();
  const baseT = bin.telemetry.temperature;
  const baseRh = bin.telemetry.humidity;
  const baseEth = bin.telemetry.ethylenePpm;
  let curSli = Math.min(100, bin.telemetry.sli + 3.8);

  for (let i = count; i >= 0; i--) {
    const ptTime = new Date(now - i * 3600000);
    const timeLabel = ptTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const wave = Math.sin(((count - i) / count) * Math.PI * 2) * 0.25;
    
    const t = +(baseT + wave + (Math.random() - 0.5) * 0.12).toFixed(2);
    const rh = +(baseRh - wave * 0.7 + (Math.random() - 0.5) * 0.25).toFixed(1);
    const eth = +Math.max(0.01, baseEth + (Math.random() - 0.5) * 0.015).toFixed(3);
    
    curSli = stepSLI(curSli, bin.produceName, t, rh, eth, 1);

    points.push({
      timestamp: ptTime.toISOString(),
      timeLabel,
      temperature: t,
      humidity: rh,
      ethylenePpm: eth,
      co2Ppm: Math.round(bin.telemetry.co2Ppm + (Math.random() - 0.5) * 12),
      sli: +curSli.toFixed(1),
      vpdKpa: calculateVPD(t, rh)
    });
  }
  return points;
}
