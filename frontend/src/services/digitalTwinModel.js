/**
 * Hydro-Thermal Produce Decay & Shelf-Life Index (SLI) Engine
 * Scientific model implementing:
 * 1. Modified Arrhenius Kinetics / Respiration rate Q10 model
 * 2. Tetens Vapor Pressure Deficit (VPD) moisture desiccation
 * 3. Ethylene receptor sensitivity model (climacteric & non-climacteric)
 */

export const COMMODITY_PROFILES = {
  "Honeycrisp Apples": {
    scientificName: "Malus domestica 'Honeycrisp'",
    climacteric: true,
    optimalTempC: 1.5,
    minSafeTempC: 0.5,
    maxSafeTempC: 3.5,
    optimalRhPct: 92.0,
    minSafeRhPct: 88.0,
    maxSafeRhPct: 95.0,
    q10: 2.2,
    ethyleneSensitivity: "HIGH",
    ethyleneThresholdPpm: 0.15,
    ethyleneSlope: 1.8,
    nominalShelfLifeDays: 180,
    chillingThresholdC: -1.0,
    baseDecayRateDaily: 0.0055, // ~0.55% SLI decay per day under optimal CA conditions
    unitValueUsd: 1200
  },
  "Cavendish Bananas": {
    scientificName: "Musa acuminata",
    climacteric: true,
    optimalTempC: 13.5,
    minSafeTempC: 12.5,
    maxSafeTempC: 16.0,
    optimalRhPct: 90.0,
    minSafeRhPct: 85.0,
    maxSafeRhPct: 95.0,
    q10: 2.6,
    ethyleneSensitivity: "CRITICAL",
    ethyleneThresholdPpm: 0.20,
    ethyleneSlope: 3.2,
    nominalShelfLifeDays: 28,
    chillingThresholdC: 11.5,
    baseDecayRateDaily: 0.035, // ~3.5% decay per day
    unitValueUsd: 850
  },
  "Hass Avocados": {
    scientificName: "Persea americana 'Hass'",
    climacteric: true,
    optimalTempC: 5.0,
    minSafeTempC: 4.0,
    maxSafeTempC: 7.0,
    optimalRhPct: 90.0,
    minSafeRhPct: 85.0,
    maxSafeRhPct: 95.0,
    q10: 2.4,
    ethyleneSensitivity: "HIGH",
    ethyleneThresholdPpm: 0.10,
    ethyleneSlope: 2.5,
    nominalShelfLifeDays: 35,
    chillingThresholdC: 3.0,
    baseDecayRateDaily: 0.028,
    unitValueUsd: 1800
  },
  "Sweet Strawberries": {
    scientificName: "Fragaria × ananassa",
    climacteric: false,
    optimalTempC: 0.5,
    minSafeTempC: 0.0,
    maxSafeTempC: 2.0,
    optimalRhPct: 93.0,
    minSafeRhPct: 90.0,
    maxSafeRhPct: 97.0,
    q10: 3.1,
    ethyleneSensitivity: "LOW",
    ethyleneThresholdPpm: 0.50,
    ethyleneSlope: 0.8,
    nominalShelfLifeDays: 14,
    chillingThresholdC: -0.8,
    baseDecayRateDaily: 0.071,
    unitValueUsd: 2400
  },
  "Roma Tomatoes": {
    scientificName: "Solanum lycopersicum",
    climacteric: true,
    optimalTempC: 11.0,
    minSafeTempC: 9.5,
    maxSafeTempC: 14.0,
    optimalRhPct: 88.0,
    minSafeRhPct: 85.0,
    maxSafeRhPct: 92.0,
    q10: 2.3,
    ethyleneSensitivity: "MEDIUM",
    ethyleneThresholdPpm: 0.30,
    ethyleneSlope: 1.9,
    nominalShelfLifeDays: 24,
    chillingThresholdC: 8.0,
    baseDecayRateDaily: 0.042,
    unitValueUsd: 920
  }
};

/**
 * Tetens formula for Saturation Vapor Pressure in kPa
 */
export function calculateSaturationVaporPressure(tempC) {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Vapor Pressure Deficit (VPD) in kPa
 */
export function calculateVPD(tempC, rhPct) {
  const vpSat = calculateSaturationVaporPressure(tempC);
  const clampedRh = Math.max(0, Math.min(100, rhPct));
  const vpAct = vpSat * (clampedRh / 100);
  return Math.max(0, +(vpSat - vpAct).toFixed(3));
}

/**
 * Calculate decay acceleration factors
 */
export function calculateDecayFactors(commodity, tempC, rhPct, ethylenePpm) {
  const profile = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];

  // 1. Thermal factor
  const tempDiff = tempC - profile.optimalTempC;
  let thermalFactor = 1.0;
  if (tempDiff >= 0) {
    thermalFactor = Math.pow(profile.q10, tempDiff / 10);
  } else {
    if (tempC < profile.chillingThresholdC) {
      const chillPenalty = Math.abs(tempC - profile.chillingThresholdC);
      thermalFactor = 1.0 + chillPenalty * 1.5;
    } else {
      thermalFactor = Math.max(0.65, Math.pow(profile.q10, tempDiff / 10));
    }
  }

  // 2. Hydro factor (VPD desiccation + mold hazard)
  const optVpd = calculateVPD(profile.optimalTempC, profile.optimalRhPct);
  const curVpd = calculateVPD(tempC, rhPct);
  const vpdDiff = curVpd - optVpd;

  let hydroFactor = 1.0;
  if (vpdDiff > 0) {
    hydroFactor += vpdDiff * 1.8;
  }
  if (rhPct > 96.0) {
    hydroFactor += (rhPct - 96.0) * 0.15;
  }

  // 3. Ethylene factor
  let ethFactor = 1.0;
  if (ethylenePpm > profile.ethyleneThresholdPpm) {
    const excess = ethylenePpm - profile.ethyleneThresholdPpm;
    if (profile.climacteric) {
      ethFactor += profile.ethyleneSlope * Math.log1p(excess * 5);
    } else {
      ethFactor += (profile.ethyleneSlope * 0.4) * Math.log1p(excess * 2);
    }
  }

  const compositeMultiplier = +(thermalFactor * hydroFactor * ethFactor).toFixed(3);

  return {
    thermalFactor: +thermalFactor.toFixed(3),
    hydroFactor: +hydroFactor.toFixed(3),
    ethyleneFactor: +ethFactor.toFixed(3),
    compositeMultiplier,
    vpdKpa: curVpd
  };
}

/**
 * Forward step SLI calculation
 */
export function stepSLI(currentSli, commodity, tempC, rhPct, ethylenePpm, deltaHours = 1) {
  const profile = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];
  const factors = calculateDecayFactors(commodity, tempC, rhPct, ethylenePpm);
  const baseHourlyDrop = (profile.baseDecayRateDaily * 100) / 24;
  const sliDrop = baseHourlyDrop * factors.compositeMultiplier * deltaHours;
  return Math.max(0, Math.min(100, +(currentSli - sliDrop).toFixed(2)));
}

/**
 * Run What-If projection simulation
 */
export function runWhatIfSimulation({
  commodity,
  initialSli = 90,
  temperature,
  humidity,
  ethylenePpm,
  projectionDays = 14,
  baselineTemp = 1.5,
  baselineHumidity = 90.0,
  baselineEthylene = 0.05,
  batchValueUsd = 25000
}) {
  const profile = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES["Honeycrisp Apples"];
  const simFactors = calculateDecayFactors(commodity, temperature, humidity, ethylenePpm);
  const baseFactors = calculateDecayFactors(commodity, baselineTemp, baselineHumidity, baselineEthylene);

  const dailyBaseDecay = profile.baseDecayRateDaily * 100 * baseFactors.compositeMultiplier;
  const dailySimDecay = profile.baseDecayRateDaily * 100 * simFactors.compositeMultiplier;

  const trajectory = [];
  let curBaseSli = initialSli;
  let curSimSli = initialSli;
  const now = new Date();

  for (let d = 0; d <= projectionDays; d++) {
    const ptDate = new Date(now.getTime() + d * 86400000);
    const dateStr = ptDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    trajectory.push({
      day: d,
      date: dateStr,
      baselineSli: +curBaseSli.toFixed(1),
      simulatedSli: +curSimSli.toFixed(1),
      vpdKpa: simFactors.vpdKpa,
      decayMultiplier: simFactors.compositeMultiplier
    });

    curBaseSli = Math.max(0, curBaseSli - dailyBaseDecay);
    curSimSli = Math.max(0, curSimSli - dailySimDecay);
  }

  const baseDaysRem = +(initialSli / Math.max(0.01, dailyBaseDecay)).toFixed(1);
  const simDaysRem = +(initialSli / Math.max(0.01, dailySimDecay)).toFixed(1);
  const deltaDays = +(simDaysRem - baseDaysRem).toFixed(1);

  let economicImpact = 0;
  let riskVerdict = "NOMINAL: Operating strictly within safe baseline tolerances.";

  if (deltaDays < 0) {
    const lossRatio = Math.min(1, Math.abs(deltaDays) / Math.max(1, baseDaysRem));
    economicImpact = -Math.round(batchValueUsd * lossRatio * 0.75);
    if (deltaDays < -5) {
      riskVerdict = "CRITICAL: Accelerated shelf-life collapse. Immediate cold chain correction or priority market dispatch required.";
    } else {
      riskVerdict = "ELEVATED RISK: Environmental stress causing premature quality decay. Chamber setpoints should be adjusted.";
    }
  } else if (deltaDays > 0) {
    economicImpact = Math.round(batchValueUsd * 0.08);
    riskVerdict = "OPTIMIZED: Preservation window extended beyond baseline standard. Commodity retains peak export market grade.";
  }

  return {
    commodity,
    baselineDaysRemaining: baseDaysRem,
    simulatedDaysRemaining: simDaysRem,
    shelfLifeDeltaDays: deltaDays,
    estimatedEconomicImpactUsd: economicImpact,
    riskVerdict,
    simFactors,
    trajectory
  };
}
