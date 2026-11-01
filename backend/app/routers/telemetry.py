from fastapi import APIRouter, HTTPException
from ..models.schemas import TelemetryIngest, StorageBin
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
