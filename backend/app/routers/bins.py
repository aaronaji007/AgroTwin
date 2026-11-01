from fastapi import APIRouter, HTTPException, Query
from typing import List
from pydantic import BaseModel
from ..models.schemas import StorageBin, ThresholdConfig
from ..services.storage import storage

router = APIRouter(prefix="/api/bins", tags=["Storage Bins"])

class EventSimulationPayload(BaseModel):
    event_type: str # "DOOR_OPEN", "COOLING_FAIL", "ETHYLENE_SPIKE", "RESTORE_OPTIMAL"

@router.get("", response_model=List[StorageBin])
def list_bins():
    """List all storage bins with current telemetry and hydro-thermal status."""
    return storage.get_bins()

@router.get("/{bin_id}", response_model=StorageBin)
def get_bin(bin_id: str):
    """Retrieve detailed telemetry and configuration for a single bin."""
    bin_obj = storage.get_bin(bin_id)
    if not bin_obj:
        raise HTTPException(status_code=404, detail=f"Storage bin '{bin_id}' not found.")
    return bin_obj

@router.put("/{bin_id}/thresholds", response_model=StorageBin)
def update_bin_thresholds(bin_id: str, thresholds: ThresholdConfig):
    """Update temperature, humidity, and ethylene threshold boundaries for a bin."""
    bin_obj = storage.update_thresholds(bin_id, thresholds)
    if not bin_obj:
        raise HTTPException(status_code=404, detail=f"Storage bin '{bin_id}' not found.")
    return bin_obj

@router.post("/{bin_id}/simulate-event", response_model=StorageBin)
def simulate_event(bin_id: str, payload: EventSimulationPayload):
    """Inject a physical chamber anomaly (e.g., DOOR_OPEN, COOLING_FAIL, ETHYLENE_SPIKE)."""
    bin_obj = storage.simulate_event(bin_id, payload.event_type)
    if not bin_obj:
        raise HTTPException(status_code=404, detail=f"Storage bin '{bin_id}' not found.")
    return bin_obj
