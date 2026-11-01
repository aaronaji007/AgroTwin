import math
from typing import Dict, Any, List
from datetime import datetime, timedelta

# Biological profiles for typical post-harvest commodities
COMMODITY_PROFILES: Dict[str, Dict[str, Any]] = {
    "Honeycrisp Apples": {
        "scientific_name": "Malus domestica 'Honeycrisp'",
        "climacteric": True,
        "optimal_temp_c": 1.5,
        "min_safe_temp_c": 0.5,
        "max_safe_temp_c": 3.5,
        "optimal_rh_pct": 92.0,
        "min_safe_rh_pct": 88.0,
        "max_safe_rh_pct": 95.0,
        "q10_respiration": 2.2,
        "ethylene_sensitivity": "HIGH",
        "ethylene_threshold_ppm": 0.15,
        "ethylene_slope": 1.8,
        "nominal_shelf_life_days": 180.0,
        "chilling_injury_threshold_c": -1.0,
        "base_decay_rate_daily": 0.0055, # ~0.55% SLI decay per day under optimal CA conditions
        "pallet_unit_value_usd": 1200.0
    },
    "Cavendish Bananas": {
        "scientific_name": "Musa acuminata",
        "climacteric": True,
        "optimal_temp_c": 13.5,
        "min_safe_temp_c": 12.5,
        "max_safe_temp_c": 16.0,
        "optimal_rh_pct": 90.0,
        "min_safe_rh_pct": 85.0,
        "max_safe_rh_pct": 95.0,
        "q10_respiration": 2.6,
        "ethylene_sensitivity": "CRITICAL",
        "ethylene_threshold_ppm": 0.20,
        "ethylene_slope": 3.2,
        "nominal_shelf_life_days": 28.0,
        "chilling_injury_threshold_c": 11.5, # severe chilling injury below 12°C
        "base_decay_rate_daily": 0.035, # ~3.5% decay per day
        "pallet_unit_value_usd": 850.0
    },
    "Hass Avocados": {
        "scientific_name": "Persea americana 'Hass'",
        "climacteric": True,
        "optimal_temp_c": 5.0,
        "min_safe_temp_c": 4.0,
        "max_safe_temp_c": 7.0,
        "optimal_rh_pct": 90.0,
        "min_safe_rh_pct": 85.0,
        "max_safe_rh_pct": 95.0,
        "q10_respiration": 2.4,
        "ethylene_sensitivity": "HIGH",
        "ethylene_threshold_ppm": 0.10,
        "ethylene_slope": 2.5,
        "nominal_shelf_life_days": 35.0,
        "chilling_injury_threshold_c": 3.0,
        "base_decay_rate_daily": 0.028,
        "pallet_unit_value_usd": 1800.0
    },
    "Sweet Strawberries": {
        "scientific_name": "Fragaria × ananassa",
        "climacteric": False,
        "optimal_temp_c": 0.5,
        "min_safe_temp_c": 0.0,
        "max_safe_temp_c": 2.0,
        "optimal_rh_pct": 93.0,
        "min_safe_rh_pct": 90.0,
        "max_safe_rh_pct": 97.0,
        "q10_respiration": 3.1,
        "ethylene_sensitivity": "LOW",
        "ethylene_threshold_ppm": 0.50,
        "ethylene_slope": 0.8,
        "nominal_shelf_life_days": 14.0,
        "chilling_injury_threshold_c": -0.8,
        "base_decay_rate_daily": 0.071, # ~7.1% per day
        "pallet_unit_value_usd": 2400.0
    },
    "Roma Tomatoes": {
        "scientific_name": "Solanum lycopersicum",
        "climacteric": True,
        "optimal_temp_c": 11.0,
        "min_safe_temp_c": 9.5,
        "max_safe_temp_c": 14.0,
        "optimal_rh_pct": 88.0,
        "min_safe_rh_pct": 85.0,
        "max_safe_rh_pct": 92.0,
        "q10_respiration": 2.3,
        "ethylene_sensitivity": "MEDIUM",
        "ethylene_threshold_ppm": 0.30,
        "ethylene_slope": 1.9,
        "nominal_shelf_life_days": 24.0,
        "chilling_injury_threshold_c": 8.0,
        "base_decay_rate_daily": 0.042,
        "pallet_unit_value_usd": 920.0
    }
}

class DigitalTwinEngine:
    """
    Mathematical hydro-thermal produce decay engine.
    Calculates dynamic Shelf Life Index (SLI) degradation based on:
    1. Arrhenius respiration kinetics (Q10 rule)
    2. Vapor Pressure Deficit (VPD) desiccation & high-humidity mold stress
    3. Ethylene receptor trigger rate for climacteric & non-climacteric crops
    """

    @staticmethod
    def calculate_saturation_vapor_pressure(temp_c: float) -> float:
        """Tetens formula: Saturation vapor pressure in kPa"""
        return 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))

    @classmethod
    def calculate_vpd(cls, temp_c: float, rh_pct: float) -> float:
        """
        Vapor Pressure Deficit in kPa.
        VPD indicates the drying potential of the air surrounding the produce.
        """
        vp_sat = cls.calculate_saturation_vapor_pressure(temp_c)
        vp_act = vp_sat * (max(0.0, min(100.0, rh_pct)) / 100.0)
        vpd = vp_sat - vp_act
        return max(0.0, round(vpd, 3))

    @classmethod
    def calculate_decay_factors(cls, commodity: str, temp_c: float, rh_pct: float, ethylene_ppm: float) -> Dict[str, float]:
        profile = COMMODITY_PROFILES.get(commodity, COMMODITY_PROFILES["Honeycrisp Apples"])
        
        # 1. Thermal factor via modified Q10 model
        temp_diff = temp_c - profile["optimal_temp_c"]
        if temp_diff >= 0:
            thermal_factor = math.pow(profile["q10_respiration"], temp_diff / 10.0)
        else:
            # Cooler than optimal: either slows down or triggers chilling injury
            if temp_c < profile["chilling_injury_threshold_c"]:
                # Chilling injury causes severe cellular membrane collapse
                chill_defect = abs(temp_c - profile["chilling_injury_threshold_c"])
                thermal_factor = 1.0 + (chill_defect * 1.5)
            else:
                # Modest safe cooling slowing down decay slightly
                thermal_factor = max(0.65, math.pow(profile["q10_respiration"], temp_diff / 10.0))

        # 2. Hydro factor (VPD desiccation or mold risk)
        optimal_vpd = cls.calculate_vpd(profile["optimal_temp_c"], profile["optimal_rh_pct"])
        current_vpd = cls.calculate_vpd(temp_c, rh_pct)
        vpd_diff = current_vpd - optimal_vpd
        
        if vpd_diff > 0:
            # Water loss / desiccation stress
            hydro_factor = 1.0 + (vpd_diff * 1.8)
        else:
            hydro_factor = 1.0

        # High humidity fungal/condensation penalty
        if rh_pct > 96.0:
            mold_risk_penalty = (rh_pct - 96.0) * 0.15
            hydro_factor += mold_risk_penalty

        # 3. Ethylene acceleration factor
        eth_threshold = profile["ethylene_threshold_ppm"]
        if ethylene_ppm > eth_threshold:
            excess_eth = ethylene_ppm - eth_threshold
            if profile["climacteric"]:
                eth_factor = 1.0 + profile["ethylene_slope"] * math.log1p(excess_eth * 5.0)
            else:
                eth_factor = 1.0 + (profile["ethylene_slope"] * 0.4) * math.log1p(excess_eth * 2.0)
        else:
            eth_factor = 1.0

        composite_multiplier = thermal_factor * hydro_factor * eth_factor

        return {
            "thermal_factor": round(thermal_factor, 3),
            "hydro_factor": round(hydro_factor, 3),
            "ethylene_factor": round(eth_factor, 3),
            "composite_multiplier": round(composite_multiplier, 3),
            "vpd_kpa": current_vpd
        }

    @classmethod
    def calculate_step_sli(cls, current_sli: float, commodity: str, temp_c: float, rh_pct: float, ethylene_ppm: float, delta_hours: float = 1.0) -> float:
        """
        Steps the Shelf-Life Index (SLI) forward by delta_hours.
        """
        profile = COMMODITY_PROFILES.get(commodity, COMMODITY_PROFILES["Honeycrisp Apples"])
        factors = cls.calculate_decay_factors(commodity, temp_c, rh_pct, ethylene_ppm)
        
        base_hourly_decay = (profile["base_decay_rate_daily"] * 100.0) / 24.0
        sli_drop = base_hourly_decay * factors["composite_multiplier"] * delta_hours
        
        new_sli = max(0.0, min(100.0, current_sli - sli_drop))
        return round(new_sli, 2)

    @classmethod
    def simulate_projection(
        cls,
        commodity: str,
        initial_sli: float,
        temp_c: float,
        rh_pct: float,
        ethylene_ppm: float,
        projection_days: int = 14,
        baseline_temp: float = 1.5,
        baseline_rh: float = 90.0,
        baseline_ethylene: float = 0.05,
        batch_value_usd: float = 25000.0
    ) -> Dict[str, Any]:
        """
        Performs a full trajectory comparison between baseline conditions and simulated conditions.
        """
        profile = COMMODITY_PROFILES.get(commodity, COMMODITY_PROFILES["Honeycrisp Apples"])
        trajectory: List[Dict[str, Any]] = []

        cur_baseline_sli = initial_sli
        cur_sim_sli = initial_sli
        
        now = datetime.now()
        
        sim_factors = cls.calculate_decay_factors(commodity, temp_c, rh_pct, ethylene_ppm)
        base_factors = cls.calculate_decay_factors(commodity, baseline_temp, baseline_rh, baseline_ethylene)
        
        daily_base_decay = profile["base_decay_rate_daily"] * 100.0 * base_factors["composite_multiplier"]
        daily_sim_decay = profile["base_decay_rate_daily"] * 100.0 * sim_factors["composite_multiplier"]

        # Project day by day
        for d in range(projection_days + 1):
            date_str = (now + timedelta(days=d)).strftime("%Y-%m-%d")
            trajectory.append({
                "day": d,
                "date": date_str,
                "baseline_sli": round(cur_baseline_sli, 1),
                "simulated_sli": round(cur_sim_sli, 1),
                "vpd_kpa": sim_factors["vpd_kpa"],
                "decay_multiplier": sim_factors["composite_multiplier"]
            })
            
            cur_baseline_sli = max(0.0, cur_baseline_sli - daily_base_decay)
            cur_sim_sli = max(0.0, cur_sim_sli - daily_sim_decay)

        # Estimate remaining days to 10% SLI (unmarketable threshold)
        base_days_rem = round(initial_sli / max(0.01, daily_base_decay), 1)
        sim_days_rem = round(initial_sli / max(0.01, daily_sim_decay), 1)
        delta_days = round(sim_days_rem - base_days_rem, 1)

        # Economic impact calculation
        # If simulated conditions accelerate decay, produce value drops or must be sold at fire-sale discount
        if delta_days < 0:
            loss_ratio = min(1.0, abs(delta_days) / max(1.0, base_days_rem))
            economic_impact = -round(batch_value_usd * loss_ratio * 0.75, 2)
            if delta_days < -5:
                risk_verdict = "CRITICAL: Accelerated shelf-life collapse. Immediate dispatch or cooling adjustment advised."
            else:
                risk_verdict = "ELEVATED: Premature quality degradation detected. Recommend reviewing chamber setpoints."
        elif delta_days > 0:
            economic_impact = round(batch_value_usd * 0.08, 2)
            risk_verdict = "OPTIMAL: Extended preservation window active. Commodity retention maximizes market arbitrage."
        else:
            economic_impact = 0.0
            risk_verdict = "NOMINAL: Operating strictly within baseline design tolerances."

        return {
            "commodity": commodity,
            "baseline_days_remaining": base_days_rem,
            "simulated_days_remaining": sim_days_rem,
            "shelf_life_delta_days": delta_days,
            "estimated_economic_impact_usd": economic_impact,
            "risk_verdict": risk_verdict,
            "trajectory": trajectory
        }
