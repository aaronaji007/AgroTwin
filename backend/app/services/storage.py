import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from ..models.schemas import StorageBin, ProduceBatch, ThresholdConfig, TelemetryPoint, BinStatus, ProduceCategory, DHT11SensorState, GasSensorState, UltrasonicSensorState, SensorClusterState, ESP32TelemetryIngest
from .digital_twin_engine import DigitalTwinEngine

class StorageService:
    def __init__(self):
        self.bins: Dict[str, StorageBin] = {}
        self.batches: Dict[str, ProduceBatch] = {}
        self.history: Dict[str, List[TelemetryPoint]] = {}
        self.alerts: List[Dict] = []
        self._initialize_seed_data()

    def _initialize_seed_data(self):
        now = datetime.now()
        
        # 1. Batches
        batch_1 = ProduceBatch(
            id="BATCH-2026-HCA01",
            bin_id="BIN-01",
            bin_name="Cold Room Alpha",
            commodity="Honeycrisp Apples",
            variety="Highland Select Premium",
            category=ProduceCategory.CLIMACTERIC,
            harvest_date=(now - timedelta(days=18)).strftime("%Y-%m-%d"),
            intake_date=(now - timedelta(days=16)).strftime("%Y-%m-%d"),
            quantity_metric_tons=42.5,
            initial_sli=100.0,
            current_sli=91.4,
            nominal_shelf_life_days=180.0,
            projected_spoilage_date=(now + timedelta(days=164)).strftime("%Y-%m-%d"),
            market_value_usd=51000.0,
            quality_grade="Grade A Export",
            risk_level="LOW"
        )
        
        batch_2 = ProduceBatch(
            id="BATCH-2026-BAN02",
            bin_id="BIN-02",
            bin_name="Ripening Chamber Beta",
            commodity="Cavendish Bananas",
            variety="Ecuador Gold (Stage 3)",
            category=ProduceCategory.CLIMACTERIC,
            harvest_date=(now - timedelta(days=9)).strftime("%Y-%m-%d"),
            intake_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
            quantity_metric_tons=38.0,
            initial_sli=95.0,
            current_sli=72.8,
            nominal_shelf_life_days=28.0,
            projected_spoilage_date=(now + timedelta(days=19)).strftime("%Y-%m-%d"),
            market_value_usd=32300.0,
            quality_grade="Commercial Stage 3.5",
            risk_level="MEDIUM"
        )

        batch_3 = ProduceBatch(
            id="BATCH-2026-AVO03",
            bin_id="BIN-03",
            bin_name="Controlled Atmosphere Gamma",
            commodity="Hass Avocados",
            variety="Michoacán Prime",
            category=ProduceCategory.CLIMACTERIC,
            harvest_date=(now - timedelta(days=12)).strftime("%Y-%m-%d"),
            intake_date=(now - timedelta(days=8)).strftime("%Y-%m-%d"),
            quantity_metric_tons=29.5,
            initial_sli=100.0,
            current_sli=85.0,
            nominal_shelf_life_days=35.0,
            projected_spoilage_date=(now + timedelta(days=27)).strftime("%Y-%m-%d"),
            market_value_usd=53100.0,
            quality_grade="Pre-conditioning Grade 1",
            risk_level="LOW"
        )

        batch_4 = ProduceBatch(
            id="BATCH-2026-STR04",
            bin_id="BIN-04",
            bin_name="Pre-Cooling Unit Delta",
            commodity="Sweet Strawberries",
            variety="Albion Fresh Berry",
            category=ProduceCategory.NON_CLIMACTERIC,
            harvest_date=(now - timedelta(days=2)).strftime("%Y-%m-%d"),
            intake_date=(now - timedelta(days=1)).strftime("%Y-%m-%d"),
            quantity_metric_tons=14.2,
            initial_sli=100.0,
            current_sli=96.2,
            nominal_shelf_life_days=14.0,
            projected_spoilage_date=(now + timedelta(days=13)).strftime("%Y-%m-%d"),
            market_value_usd=34080.0,
            quality_grade="Direct Retail Ultra",
            risk_level="LOW"
        )

        batch_5 = ProduceBatch(
            id="BATCH-2026-TOM05",
            bin_id="BIN-05",
            bin_name="Post-Harvest Bay Epsilon",
            commodity="Roma Tomatoes",
            variety="San Marzano Greenhouse",
            category=ProduceCategory.CLIMACTERIC,
            harvest_date=(now - timedelta(days=6)).strftime("%Y-%m-%d"),
            intake_date=(now - timedelta(days=4)).strftime("%Y-%m-%d"),
            quantity_metric_tons=25.0,
            initial_sli=98.0,
            current_sli=78.5,
            nominal_shelf_life_days=24.0,
            projected_spoilage_date=(now + timedelta(days=18)).strftime("%Y-%m-%d"),
            market_value_usd=23000.0,
            quality_grade="Culinary Grade A",
            risk_level="LOW"
        )

        for b in [batch_1, batch_2, batch_3, batch_4, batch_5]:
            self.batches[b.id] = b

        # 2. Storage Bins
        bin_1 = StorageBin(
            id="BIN-01",
            code="CR-ALPHA",
            name="Cold Room Alpha",
            zone="North Wing - Sector 1",
            facility="Central Cold Storage Hub #4",
            produce_name="Honeycrisp Apples",
            variety="Highland Select Premium",
            batch_id="BATCH-2026-HCA01",
            capacity_pallets=240,
            current_pallets=180,
            telemetry=TelemetryPoint(
                timestamp=now,
                temperature=1.8,
                humidity=92.1,
                ethylene_ppm=0.08,
                co2_ppm=510.0,
                sli=91.4,
                vpd_kpa=DigitalTwinEngine.calculate_vpd(1.8, 92.1)
            ),
            hardware=SensorClusterState(
                esp32_device_id="ESP32-NODE-01",
                dht11=DHT11SensorState(temp_c=1.8, rh_pct=92.1, status="ONLINE"),
                gas=GasSensorState(sensor_type="MQ-135 / Ethylene", raw_adc=320, ppm=0.08, status="ONLINE"),
                ultrasonic=UltrasonicSensorState(distance_cm=44.0, fill_level_pct=78.0, status="ONLINE"),
                wifi_rssi_dbm=-56,
                uptime_seconds=14200,
                last_heartbeat=now
            ),
            thresholds=ThresholdConfig(
                min_temp=0.5,
                max_temp=3.5,
                min_humidity=88.0,
                max_humidity=96.0,
                max_ethylene=0.15
            ),
            status=BinStatus.NOMINAL,
            estimated_days_remaining=164.0,
            compressor_active=True,
            evaporator_fan_active=True,
            ethylene_scrubber_active=False,
            last_updated=now
        )

        bin_2 = StorageBin(
            id="BIN-02",
            code="RC-BETA",
            name="Ripening Chamber Beta",
            zone="Ripening Annex - Hall 2",
            facility="Central Cold Storage Hub #4",
            produce_name="Cavendish Bananas",
            variety="Ecuador Gold (Stage 3)",
            batch_id="BATCH-2026-BAN02",
            capacity_pallets=220,
            current_pallets=210,
            telemetry=TelemetryPoint(
                timestamp=now,
                temperature=14.5,
                humidity=88.4,
                ethylene_ppm=1.25,
                co2_ppm=1120.0,
                sli=72.8,
                vpd_kpa=DigitalTwinEngine.calculate_vpd(14.5, 88.4)
            ),
            hardware=SensorClusterState(
                esp32_device_id="ESP32-NODE-02",
                dht11=DHT11SensorState(temp_c=14.5, rh_pct=88.4, status="ONLINE"),
                gas=GasSensorState(sensor_type="MQ-135 / Ethylene", raw_adc=1850, ppm=1.25, status="WARNING"),
                ultrasonic=UltrasonicSensorState(distance_cm=22.0, fill_level_pct=89.0, status="ONLINE"),
                wifi_rssi_dbm=-62,
                uptime_seconds=28400,
                last_heartbeat=now
            ),
            thresholds=ThresholdConfig(
                min_temp=12.5,
                max_temp=16.0,
                min_humidity=84.0,
                max_humidity=94.0,
                max_ethylene=1.50
            ),
            status=BinStatus.WARNING, # Ethylene is elevated due to ripening cycle
            estimated_days_remaining=19.0,
            compressor_active=True,
            evaporator_fan_active=True,
            ethylene_scrubber_active=True,
            last_updated=now
        )

        bin_3 = StorageBin(
            id="BIN-03",
            code="CA-GAMMA",
            name="Controlled Atmosphere Gamma",
            zone="Hermetic Vault - Bay 3",
            facility="Central Cold Storage Hub #4",
            produce_name="Hass Avocados",
            variety="Michoacán Prime",
            batch_id="BATCH-2026-AVO03",
            capacity_pallets=180,
            current_pallets=160,
            telemetry=TelemetryPoint(
                timestamp=now,
                temperature=5.2,
                humidity=91.0,
                ethylene_ppm=0.12,
                co2_ppm=620.0,
                sli=85.0,
                vpd_kpa=DigitalTwinEngine.calculate_vpd(5.2, 91.0)
            ),
            hardware=SensorClusterState(
                esp32_device_id="ESP32-NODE-03",
                dht11=DHT11SensorState(temp_c=5.2, rh_pct=91.0, status="ONLINE"),
                gas=GasSensorState(sensor_type="MQ-135 / Ethylene", raw_adc=490, ppm=0.12, status="WARNING"),
                ultrasonic=UltrasonicSensorState(distance_cm=52.0, fill_level_pct=74.0, status="ONLINE"),
                wifi_rssi_dbm=-51,
                uptime_seconds=8900,
                last_heartbeat=now
            ),
            thresholds=ThresholdConfig(
                min_temp=4.0,
                max_temp=7.0,
                min_humidity=85.0,
                max_humidity=95.0,
                max_ethylene=0.10 # threshold slightly breached: triggers attention
            ),
            status=BinStatus.WARNING,
            estimated_days_remaining=27.0,
            compressor_active=True,
            evaporator_fan_active=True,
            ethylene_scrubber_active=True,
            last_updated=now
        )

        bin_4 = StorageBin(
            id="BIN-04",
            code="PC-DELTA",
            name="Pre-Cooling Unit Delta",
            zone="Hydro-Cooling Line - Cell A",
            facility="Central Cold Storage Hub #4",
            produce_name="Sweet Strawberries",
            variety="Albion Fresh Berry",
            batch_id="BATCH-2026-STR04",
            capacity_pallets=100,
            current_pallets=95,
            telemetry=TelemetryPoint(
                timestamp=now,
                temperature=0.8,
                humidity=94.3,
                ethylene_ppm=0.04,
                co2_ppm=420.0,
                sli=96.2,
                vpd_kpa=DigitalTwinEngine.calculate_vpd(0.8, 94.3)
            ),
            hardware=SensorClusterState(
                esp32_device_id="ESP32-NODE-04",
                dht11=DHT11SensorState(temp_c=0.8, rh_pct=94.3, status="ONLINE"),
                gas=GasSensorState(sensor_type="MQ-135 / Ethylene", raw_adc=210, ppm=0.04, status="ONLINE"),
                ultrasonic=UltrasonicSensorState(distance_cm=16.0, fill_level_pct=92.0, status="ONLINE"),
                wifi_rssi_dbm=-68,
                uptime_seconds=5200,
                last_heartbeat=now
            ),
            thresholds=ThresholdConfig(
                min_temp=0.0,
                max_temp=2.2,
                min_humidity=90.0,
                max_humidity=97.0,
                max_ethylene=0.50
            ),
            status=BinStatus.NOMINAL,
            estimated_days_remaining=13.0,
            compressor_active=True,
            evaporator_fan_active=True,
            ethylene_scrubber_active=False,
            last_updated=now
        )

        bin_5 = StorageBin(
            id="BIN-05",
            code="PH-EPSILON",
            name="Post-Harvest Bay Epsilon",
            zone="Buffer Transit Hub - Dock 5",
            facility="Central Cold Storage Hub #4",
            produce_name="Roma Tomatoes",
            variety="San Marzano Greenhouse",
            batch_id="BATCH-2026-TOM05",
            capacity_pallets=160,
            current_pallets=140,
            telemetry=TelemetryPoint(
                timestamp=now,
                temperature=11.8,
                humidity=86.5,
                ethylene_ppm=0.35,
                co2_ppm=680.0,
                sli=78.5,
                vpd_kpa=DigitalTwinEngine.calculate_vpd(11.8, 86.5)
            ),
            hardware=SensorClusterState(
                esp32_device_id="ESP32-NODE-05",
                dht11=DHT11SensorState(temp_c=11.8, rh_pct=86.5, status="ONLINE"),
                gas=GasSensorState(sensor_type="MQ-135 / Ethylene", raw_adc=820, ppm=0.35, status="ONLINE"),
                ultrasonic=UltrasonicSensorState(distance_cm=35.0, fill_level_pct=82.5, status="ONLINE"),
                wifi_rssi_dbm=-54,
                uptime_seconds=36100,
                last_heartbeat=now
            ),
            thresholds=ThresholdConfig(
                min_temp=9.5,
                max_temp=14.0,
                min_humidity=85.0,
                max_humidity=92.0,
                max_ethylene=0.40
            ),
            status=BinStatus.NOMINAL,
            estimated_days_remaining=18.0,
            compressor_active=True,
            evaporator_fan_active=True,
            ethylene_scrubber_active=False,
            last_updated=now
        )

        for b in [bin_1, bin_2, bin_3, bin_4, bin_5]:
            self.bins[b.id] = b
            self._generate_bin_history(b)

        # Seed initial alerts
        self.alerts = [
            {
                "id": "ALT-1092",
                "bin_id": "BIN-03",
                "bin_name": "Controlled Atmosphere Gamma",
                "parameter": "ETHYLENE",
                "severity": "WARNING",
                "value": 0.12,
                "threshold": 0.10,
                "unit": "ppm",
                "message": "Ethylene level (0.12 ppm) exceeded threshold (0.10 ppm). Auto-activated catalytic scrubber.",
                "timestamp": (now - timedelta(minutes=42)).isoformat(),
                "acknowledged": False
            },
            {
                "id": "ALT-1091",
                "bin_id": "BIN-02",
                "bin_name": "Ripening Chamber Beta",
                "parameter": "TEMPERATURE",
                "severity": "INFO",
                "value": 14.5,
                "threshold": 14.0,
                "unit": "°C",
                "message": "Scheduled thermal rise initiated for Cavendish ripening ramp sequence Stage 3.",
                "timestamp": (now - timedelta(hours=3)).isoformat(),
                "acknowledged": True
            }
        ]

    def _generate_bin_history(self, b: StorageBin):
        history_points: List[TelemetryPoint] = []
        now = datetime.now()
        
        base_temp = b.telemetry.temperature
        base_rh = b.telemetry.humidity
        base_eth = b.telemetry.ethylene_ppm
        cur_sli = min(100.0, b.telemetry.sli + 4.5) # slightly higher 24 hours ago
        
        # 24 historical points, 1 hour apart
        for i in range(24, -1, -1):
            pt_time = now - timedelta(hours=i)
            # Add diurnal cycle and gentle random walk
            hour_factor = math.sin((24 - i) / 24.0 * math.pi * 2) * 0.3
            t = round(base_temp + hour_factor + (random.random() - 0.5) * 0.15, 2)
            rh = round(base_rh - (hour_factor * 0.8) + (random.random() - 0.5) * 0.3, 1)
            eth = max(0.01, round(base_eth + (random.random() - 0.5) * 0.02, 3))
            
            cur_sli = DigitalTwinEngine.calculate_step_sli(cur_sli, b.produce_name, t, rh, eth, delta_hours=1.0)
            
            history_points.append(TelemetryPoint(
                timestamp=pt_time,
                temperature=t,
                humidity=rh,
                ethylene_ppm=eth,
                co2_ppm=round(b.telemetry.co2_ppm + (random.random() - 0.5) * 15, 0),
                sli=round(cur_sli, 2),
                vpd_kpa=DigitalTwinEngine.calculate_vpd(t, rh)
            ))
            
        self.history[b.id] = history_points

    def get_bins(self) -> List[StorageBin]:
        return list(self.bins.values())

    def get_bin(self, bin_id: str) -> Optional[StorageBin]:
        return self.bins.get(bin_id)

    def get_batches(self) -> List[ProduceBatch]:
        return list(self.batches.values())

    def get_history(self, bin_id: str, limit: int = 25) -> List[TelemetryPoint]:
        return self.history.get(bin_id, [])[-limit:]

    def get_alerts(self) -> List[Dict]:
        return self.alerts

    def acknowledge_alert(self, alert_id: str) -> bool:
        for a in self.alerts:
            if a["id"] == alert_id:
                a["acknowledged"] = True
                return True
        return False

    def update_thresholds(self, bin_id: str, thresholds: ThresholdConfig) -> Optional[StorageBin]:
        bin_obj = self.bins.get(bin_id)
        if not bin_obj:
            return None
        bin_obj.thresholds = thresholds
        self._evaluate_bin_status(bin_obj)
        return bin_obj

    def ingest_esp32_telemetry(self, packet: ESP32TelemetryIngest) -> Optional[StorageBin]:
        """
        Specialized ingestion pipeline for ESP32 microcontroller nodes streaming
        DHT11, MQ gas sensors, and HC-SR04 ultrasonic distance sensors.
        """
        b = self.bins.get(packet.bin_id)
        if not b:
            return None

        now = datetime.now()
        
        # 1. Resolve DHT11 metrics
        temp = packet.dht11_temp if packet.dht11_temp is not None else (packet.temperature if packet.temperature is not None else b.telemetry.temperature)
        rh = packet.dht11_humidity if packet.dht11_humidity is not None else (packet.humidity if packet.humidity is not None else b.telemetry.humidity)
        
        # 2. Resolve Gas sensor metrics (MQ series ADC / PPM)
        raw_adc = packet.gas_raw if packet.gas_raw is not None else (b.hardware.gas.raw_adc if b.hardware else 350)
        if packet.gas_ppm is not None:
            gas_ppm = packet.gas_ppm
        elif packet.ethylene_ppm is not None:
            gas_ppm = packet.ethylene_ppm
        elif packet.gas_raw is not None:
            gas_ppm = round((packet.gas_raw / 4095.0) * 2.5, 3)
        else:
            gas_ppm = b.telemetry.ethylene_ppm

        # 3. Resolve Ultrasonic sensor metrics (HC-SR04 distance & produce fill level)
        if packet.ultrasonic_distance_cm is not None:
            dist_cm = packet.ultrasonic_distance_cm
        elif b.hardware and b.hardware.ultrasonic:
            dist_cm = b.hardware.ultrasonic.distance_cm
        else:
            dist_cm = 45.0

        if packet.fill_level_pct is not None:
            fill_pct = packet.fill_level_pct
        else:
            fill_pct = max(0.0, min(100.0, round((1.0 - dist_cm / 200.0) * 100.0, 1)))

        # 4. Update Hardware Cluster State
        dht_status = "FAULT" if (temp < -10.0 or temp > 70.0 or rh < 10.0 or rh > 100.0) else "ONLINE"
        gas_status = "CRITICAL" if gas_ppm > b.thresholds.max_ethylene * 2.0 else ("WARNING" if gas_ppm > b.thresholds.max_ethylene else "ONLINE")
        ultra_status = "FAULT" if (dist_cm > 400.0 or dist_cm < 2.0) else "ONLINE"

        uptime = packet.uptime_s or (b.hardware.uptime_seconds + 5 if b.hardware else 3600)
        rssi = packet.rssi_dbm or (b.hardware.wifi_rssi_dbm if b.hardware else -58)

        b.hardware = SensorClusterState(
            esp32_device_id=packet.device_id or "ESP32-NODE-01",
            dht11=DHT11SensorState(temp_c=round(temp, 1), rh_pct=round(rh, 1), status=dht_status),
            gas=GasSensorState(sensor_type="MQ-135 / Ethylene", raw_adc=raw_adc, ppm=round(gas_ppm, 3), status=gas_status),
            ultrasonic=UltrasonicSensorState(distance_cm=round(dist_cm, 1), fill_level_pct=round(fill_pct, 1), status=ultra_status),
            wifi_rssi_dbm=rssi,
            uptime_seconds=uptime,
            last_heartbeat=now
        )

        # 5. Pipeline into core biophysical twin ingestion
        return self.ingest_telemetry(b.id, temp, rh, gas_ppm, packet.co2_ppm)

    def ingest_telemetry(self, bin_id: str, temp: float, rh: float, eth: float, co2: Optional[float] = None) -> Optional[StorageBin]:
        b = self.bins.get(bin_id)
        if not b:
            return None
        
        now = datetime.now()
        vpd = DigitalTwinEngine.calculate_vpd(temp, rh)
        new_sli = DigitalTwinEngine.calculate_step_sli(b.telemetry.sli, b.produce_name, temp, rh, eth, delta_hours=0.25)
        
        pt = TelemetryPoint(
            timestamp=now,
            temperature=round(temp, 2),
            humidity=round(rh, 1),
            ethylene_ppm=round(eth, 3),
            co2_ppm=co2 or b.telemetry.co2_ppm,
            sli=round(new_sli, 2),
            vpd_kpa=vpd
        )
        b.telemetry = pt
        b.last_updated = now

        # Append to history
        if bin_id not in self.history:
            self.history[bin_id] = []
        self.history[bin_id].append(pt)
        if len(self.history[bin_id]) > 100:
            self.history[bin_id].pop(0)

        # Update associated batch
        if b.batch_id in self.batches:
            batch = self.batches[b.batch_id]
            batch.current_sli = new_sli
            if new_sli < 40.0:
                batch.risk_level = "CRITICAL"
            elif new_sli < 75.0:
                batch.risk_level = "MEDIUM"
            else:
                batch.risk_level = "LOW"

        self._evaluate_bin_status(b)
        return b

    def simulate_event(self, bin_id: str, event_type: str) -> Optional[StorageBin]:
        """
        Injects realistic simulation stress events into a bin.
        Event types:
        - "DOOR_OPEN": Temp spikes +3°C, RH drops -12%
        - "COOLING_FAIL": Temp rises +6°C, humidity fluctuates
        - "ETHYLENE_SPIKE": Ethylene increases +0.6 ppm (climacteric surge)
        - "RESTORE_OPTIMAL": Returns parameters to biological optimum
        """
        b = self.bins.get(bin_id)
        if not b:
            return None

        now = datetime.now()
        t = b.telemetry.temperature
        rh = b.telemetry.humidity
        eth = b.telemetry.ethylene_ppm
        
        if event_type == "DOOR_OPEN":
            t += 3.2
            rh = max(60.0, rh - 14.0)
            self.alerts.insert(0, {
                "id": f"ALT-{random.randint(2000, 9999)}",
                "bin_id": b.id,
                "bin_name": b.name,
                "parameter": "BAY_DOOR",
                "severity": "WARNING",
                "value": round(t, 1),
                "threshold": b.thresholds.max_temp,
                "unit": "°C",
                "message": f"Storage bay door left ajar in {b.name}. Thermal leakage detected (+3.2°C).",
                "timestamp": now.isoformat(),
                "acknowledged": False
            })
        elif event_type == "COOLING_FAIL":
            t += 6.5
            rh = max(55.0, rh - 20.0)
            b.compressor_active = False
            self.alerts.insert(0, {
                "id": f"ALT-{random.randint(2000, 9999)}",
                "bin_id": b.id,
                "bin_name": b.name,
                "parameter": "COMPRESSOR",
                "severity": "CRITICAL",
                "value": round(t, 1),
                "threshold": b.thresholds.max_temp,
                "unit": "°C",
                "message": f"Primary refrigeration compressor trip fault in {b.name}. Emergency backup engaged.",
                "timestamp": now.isoformat(),
                "acknowledged": False
            })
        elif event_type == "ETHYLENE_SPIKE":
            eth += 0.65
            self.alerts.insert(0, {
                "id": f"ALT-{random.randint(2000, 9999)}",
                "bin_id": b.id,
                "bin_name": b.name,
                "parameter": "ETHYLENE",
                "severity": "WARNING",
                "value": round(eth, 3),
                "threshold": b.thresholds.max_ethylene,
                "unit": "ppm",
                "message": f"Sudden ethylene surge ({eth:.2f} ppm) detected in {b.name}. Ripening cascade initiated.",
                "timestamp": now.isoformat(),
                "acknowledged": False
            })
        elif event_type == "RESTORE_OPTIMAL":
            profile = DigitalTwinEngine.COMMODITY_PROFILES.get(b.produce_name, {})
            t = profile.get("optimal_temp_c", 2.0)
            rh = profile.get("optimal_rh_pct", 90.0)
            eth = min(0.05, profile.get("ethylene_threshold_ppm", 0.1) * 0.5)
            b.compressor_active = True
            b.evaporator_fan_active = True
            b.ethylene_scrubber_active = False

        return self.ingest_telemetry(bin_id, t, rh, eth)

    def _evaluate_bin_status(self, b: StorageBin):
        t = b.telemetry.temperature
        rh = b.telemetry.humidity
        eth = b.telemetry.ethylene_ppm
        th = b.thresholds

        temp_critical = t > (th.max_temp + 2.5) or t < (th.min_temp - 2.0)
        rh_critical = rh < (th.min_humidity - 12.0)
        eth_critical = eth > (th.max_ethylene * 2.5)

        temp_warning = t > th.max_temp or t < th.min_temp
        rh_warning = rh < th.min_humidity or rh > th.max_humidity
        eth_warning = eth > th.max_ethylene

        if temp_critical or rh_critical or eth_critical or b.telemetry.sli < 45.0:
            b.status = BinStatus.CRITICAL
        elif temp_warning or rh_warning or eth_warning or b.telemetry.sli < 75.0:
            b.status = BinStatus.WARNING
        else:
            b.status = BinStatus.NOMINAL

        # Automatically record unacknowledged SCADA alarm if not already logged
        now_str = datetime.now().isoformat()
        if temp_critical or temp_warning:
            has_active_temp_alert = any(a["bin_id"] == b.id and a["parameter"] == "TEMPERATURE" and not a["acknowledged"] for a in self.alerts)
            if not has_active_temp_alert:
                self.alerts.insert(0, {
                    "id": f"ALT-{random.randint(1000, 9999)}",
                    "bin_id": b.id,
                    "bin_name": b.name,
                    "parameter": "TEMPERATURE",
                    "severity": "CRITICAL" if temp_critical else "WARNING",
                    "value": round(t, 1),
                    "threshold": th.max_temp if t > th.max_temp else th.min_temp,
                    "unit": "°C",
                    "message": f"{'CRITICAL Thermal Breach' if temp_critical else 'Thermal Warning'}: Temperature ({t:.1f}°C) departed safe bounds ({th.min_temp}-{th.max_temp}°C) in {b.name}.",
                    "timestamp": now_str,
                    "acknowledged": False
                })

        if eth_critical or eth_warning:
            has_active_eth_alert = any(a["bin_id"] == b.id and a["parameter"] == "ETHYLENE" and not a["acknowledged"] for a in self.alerts)
            if not has_active_eth_alert:
                self.alerts.insert(0, {
                    "id": f"ALT-{random.randint(1000, 9999)}",
                    "bin_id": b.id,
                    "bin_name": b.name,
                    "parameter": "ETHYLENE",
                    "severity": "CRITICAL" if eth_critical else "WARNING",
                    "value": round(eth, 3),
                    "threshold": th.max_ethylene,
                    "unit": "ppm",
                    "message": f"Climacteric Surge: Ethylene concentration ({eth:.3f} ppm) exceeded threshold ({th.max_ethylene} ppm) in {b.name}.",
                    "timestamp": now_str,
                    "acknowledged": False
                })

# Singleton storage instance
storage = StorageService()
