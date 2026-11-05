from fastapi import APIRouter, HTTPException
from ..models.schemas import TelemetryIngest, ESP32TelemetryIngest, StorageBin
from ..services.storage import storage

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry Ingestion"])

@router.post("", response_model=StorageBin)
def ingest_telemetry_packet(packet: TelemetryIngest):
    """
    Ingest real-time IoT sensor telemetry packet from storage bin microcontrollers.
    Instantly recalculates dynamic Shelf-Life Index (SLI) and triggers threshold alerts.
    """
    bin_obj = storage.ingest_telemetry(
        bin_id=packet.bin_id,
        temp=packet.temperature,
        rh=packet.humidity,
        eth=packet.ethylene_ppm,
        co2=packet.co2_ppm
    )
    if not bin_obj:
        raise HTTPException(status_code=404, detail=f"Target storage bin '{packet.bin_id}' does not exist.")
    return bin_obj

@router.post("/esp32", response_model=StorageBin)
def ingest_esp32_telemetry_packet(packet: ESP32TelemetryIngest):
    """
    Direct ingestion endpoint for ESP32 microcontroller nodes.
    Supports live DHT11 temperature/humidity, MQ-series gas ADC/PPM,
    and HC-SR04 ultrasonic produce level distance tracking.
    """
    bin_obj = storage.ingest_esp32_telemetry(packet)
    if not bin_obj:
        raise HTTPException(status_code=404, detail=f"Target storage bin '{packet.bin_id}' does not exist.")
    return bin_obj

@router.get("/esp32/sample")
def get_esp32_sample_payload():
    """
    Returns sample ESP32 payload for hardware testing & curl verification during expo demos.
    """
    return {
        "description": "Sample JSON payload format for ESP32 microcontroller with DHT11, MQ-135, and HC-SR04",
        "sample_payload": {
            "device_id": "ESP32-NODE-01",
            "bin_id": "BIN-01",
            "dht11_temp": 2.1,
            "dht11_humidity": 91.8,
            "gas_raw": 345,
            "gas_ppm": 0.085,
            "ultrasonic_distance_cm": 43.5,
            "fill_level_pct": 78.2,
            "co2_ppm": 520.0,
            "rssi_dbm": -55,
            "uptime_s": 14500
        },
        "curl_command": "curl -X POST http://localhost:8000/api/telemetry/esp32 -H \"Content-Type: application/json\" -d \"{\\\"device_id\\\":\\\"ESP32-NODE-01\\\",\\\"bin_id\\\":\\\"BIN-01\\\",\\\"dht11_temp\\\":2.1,\\\"dht11_humidity\\\":91.8,\\\"gas_raw\\\":345,\\\"gas_ppm\\\":0.085,\\\"ultrasonic_distance_cm\\\":43.5}\""
    }
