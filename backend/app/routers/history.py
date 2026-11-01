from fastapi import APIRouter, HTTPException, Query
from typing import List
from ..models.schemas import TelemetryPoint
from ..services.storage import storage

router = APIRouter(prefix="/api/bins", tags=["Historical Telemetry"])

@router.get("/{bin_id}/history", response_model=List[TelemetryPoint])
def get_bin_history(
    bin_id: str,
    range: str = Query("24h", description="Time window range: 1h, 6h, 24h, 7d"),
    limit: int = Query(50, description="Max number of points to return")
):
    """Retrieve historical time-series sensor telemetry for graphing charts."""
    bin_obj = storage.get_bin(bin_id)
    if not bin_obj:
        raise HTTPException(status_code=404, detail=f"Storage bin '{bin_id}' not found.")
    
    # Calculate point limit based on range if specified
    pts_to_return = limit
    if range == "1h":
        pts_to_return = min(6, limit)
    elif range == "6h":
        pts_to_return = min(12, limit)
    elif range == "24h":
        pts_to_return = min(25, limit)
        
    return storage.get_history(bin_id, limit=pts_to_return)
