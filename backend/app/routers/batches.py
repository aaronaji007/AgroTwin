from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import ProduceBatch
from ..services.storage import storage

router = APIRouter(prefix="/api/batches", tags=["Produce Batches"])

@router.get("", response_model=List[ProduceBatch])
def list_batches():
    """List all registered produce batches across storage bins."""
    return storage.get_batches()

@router.get("/{batch_id}", response_model=ProduceBatch)
def get_batch(batch_id: str):
    """Retrieve details and biological degradation tracking for a specific batch."""
    batches = storage.get_batches()
    for b in batches:
        if b.id == batch_id:
            return b
    raise HTTPException(status_code=404, detail=f"Produce batch '{batch_id}' not found.")
