from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.storage import storage

router = APIRouter(prefix="/api/alerts", tags=["Alarm System"])

@router.get("", response_model=List[Dict[str, Any]])
def list_alerts():
    """List recent and active threshold alarms across all storage bins."""
    return storage.get_alerts()

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    """Mark an operational alarm as acknowledged by an operator."""
    success = storage.acknowledge_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    return {"status": "SUCCESS", "alert_id": alert_id, "acknowledged": True}
