from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class BinStatus(str, Enum):
    NOMINAL = "NOMINAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    OFFLINE = "OFFLINE"

class ProduceCategory(str, Enum):
    CLIMACTERIC = "CLIMACTERIC"
    NON_CLIMACTERIC = "NON_CLIMACTERIC"

class ThresholdConfig(BaseModel):
    min_temp: float = Field(default=0.5, description="Min safe temperature in °C")
    max_temp: float = Field(default=4.0, description="Max safe temperature in °C")
    min_humidity: float = Field(default=85.0, description="Min relative humidity in %")
    max_humidity: float = Field(default=95.0, description="Max relative humidity in %")
    max_ethylene: float = Field(default=0.2, description="Max ethylene threshold in ppm")

class TelemetryPoint(BaseModel):
    timestamp: datetime
    temperature: float
    humidity: float
    ethylene_ppm: float
    co2_ppm: Optional[float] = 450.0
    sli: float = Field(description="Shelf Life Index percentage (0-100%)")
    vpd_kpa: Optional[float] = 0.15

class StorageBin(BaseModel):
    id: str
    code: str
    name: str
    zone: str
    facility: str = "Central Cold Storage Hub #4"
    produce_name: str
    variety: str
    batch_id: str
    capacity_pallets: int = 240
    current_pallets: int = 180
    telemetry: TelemetryPoint
    thresholds: ThresholdConfig
    status: BinStatus
    estimated_days_remaining: float
    compressor_active: bool = True
    evaporator_fan_active: bool = True
    ethylene_scrubber_active: bool = False
    last_updated: datetime

class ProduceBatch(BaseModel):
    id: str
    bin_id: str
    bin_name: str
    commodity: str
    variety: str
    category: ProduceCategory
    harvest_date: str
    intake_date: str
    quantity_metric_tons: float
    initial_sli: float = 100.0
    current_sli: float
    nominal_shelf_life_days: float
    projected_spoilage_date: str
    market_value_usd: float
    quality_grade: str = "Grade A Export"
    risk_level: str = "LOW"

class TelemetryIngest(BaseModel):
    bin_id: str
    temperature: float
    humidity: float
    ethylene_ppm: float
    co2_ppm: Optional[float] = 450.0

class SLISimulationRequest(BaseModel):
    commodity: str
    initial_sli: float = 90.0
    temperature: float
    humidity: float
    ethylene_ppm: float
    projection_days: int = 14
    baseline_temp: Optional[float] = 1.5
    baseline_humidity: Optional[float] = 90.0
    baseline_ethylene: Optional[float] = 0.05
    batch_value_usd: Optional[float] = 25000.0

class SLISimulationPoint(BaseModel):
    day: int
    date: str
    baseline_sli: float
    simulated_sli: float
    vpd_kpa: float
    decay_multiplier: float

class SLISimulationResponse(BaseModel):
    commodity: str
    baseline_days_remaining: float
    simulated_days_remaining: float
    shelf_life_delta_days: float
    estimated_economic_impact_usd: float
    risk_verdict: str
    trajectory: List[SLISimulationPoint]

class SystemSummary(BaseModel):
    total_bins: int
    active_bins: int
    avg_temperature: float
    avg_humidity: float
    avg_ethylene: float
    avg_sli: float
    warning_count: int
    critical_count: int
    total_inventory_value_usd: float
    system_status: str
