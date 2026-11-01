from fastapi import APIRouter
from typing import Dict, Any, List
from ..models.schemas import SLISimulationRequest, SLISimulationResponse
from ..services.digital_twin_engine import DigitalTwinEngine, COMMODITY_PROFILES

router = APIRouter(prefix="/api/simulate", tags=["Digital Twin Simulation"])

@router.post("/sli", response_model=SLISimulationResponse)
def simulate_shelf_life(request: SLISimulationRequest):
    """
    Run hydro-thermal What-If projection for a produce batch.
    Compares baseline preservation against perturbed temperature, humidity, and ethylene levels.
    """
    result = DigitalTwinEngine.simulate_projection(
        commodity=request.commodity,
        initial_sli=request.initial_sli,
        temp_c=request.temperature,
        rh_pct=request.humidity,
        ethylene_ppm=request.ethylene_ppm,
        projection_days=request.projection_days,
        baseline_temp=request.baseline_temp or 1.5,
        baseline_rh=request.baseline_humidity or 90.0,
        baseline_ethylene=request.baseline_ethylene or 0.05,
        batch_value_usd=request.batch_value_usd or 25000.0
    )
    return result

@router.get("/commodities")
def list_supported_commodities():
    """List all biological commodity reference parameters."""
    return COMMODITY_PROFILES
