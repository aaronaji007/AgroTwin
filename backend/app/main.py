from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import bins, batches, history, telemetry, simulation, alerts, summary

app = FastAPI(
    title="AgroTwin-Share Engine API",
    description="IoT & Hydro-Thermal Digital Twin Platform for Post-Harvest Storage & Shelf-Life Index (SLI) Prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for full-stack communication with frontend (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(summary.router)
app.include_router(bins.router)
app.include_router(batches.router)
app.include_router(history.router)
app.include_router(telemetry.router)
app.include_router(simulation.router)
app.include_router(alerts.router)

@app.get("/")
def root():
    return {
        "service": "AgroTwin-Share Digital Twin API",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs": "/docs",
        "endpoints": [
            "/api/summary",
            "/api/bins",
            "/api/batches",
            "/api/bins/{id}/history",
            "/api/telemetry",
            "/api/simulate/sli",
            "/api/alerts"
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": "2026-11-01T22:25:00Z",
        "engine": "Hydro-Thermal Arrhenius & VPD SLI Model"
    }
