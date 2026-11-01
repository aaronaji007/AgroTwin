from fastapi import APIRouter
from ..models.schemas import SystemSummary, BinStatus
from ..services.storage import storage

router = APIRouter(prefix="/api/summary", tags=["System Summary"])

@router.get("", response_model=SystemSummary)
def get_system_summary():
    """Retrieve aggregate SCADA metrics across all storage bins."""
    bins = storage.get_bins()
    batches = storage.get_batches()

    total_bins = len(bins)
    active_bins = len([b for b in bins if b.status != BinStatus.OFFLINE])
    
    avg_temp = sum(b.telemetry.temperature for b in bins) / max(1, total_bins)
    avg_rh = sum(b.telemetry.humidity for b in bins) / max(1, total_bins)
    avg_eth = sum(b.telemetry.ethylene_ppm for b in bins) / max(1, total_bins)
    avg_sli = sum(b.telemetry.sli for b in bins) / max(1, total_bins)

    warning_count = len([b for b in bins if b.status == BinStatus.WARNING])
    critical_count = len([b for b in bins if b.status == BinStatus.CRITICAL])
    total_val = sum(batch.market_value_usd for batch in batches)

    system_status = "OPTIMAL"
    if critical_count > 0:
        system_status = "CRITICAL_ACTION_REQUIRED"
    elif warning_count > 0:
        system_status = "ATTENTION_REQUIRED"

    return SystemSummary(
        total_bins=total_bins,
        active_bins=active_bins,
        avg_temperature=round(avg_temp, 2),
        avg_humidity=round(avg_rh, 1),
        avg_ethylene=round(avg_eth, 3),
        avg_sli=round(avg_sli, 1),
        warning_count=warning_count,
        critical_count=critical_count,
        total_inventory_value_usd=round(total_val, 2),
        system_status=system_status
    )
