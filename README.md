# 🌱 AgroTwin-Share: IoT & Hydro-Thermal Digital Twin Platform

[![Version](https://img.shields.io/badge/Version-1.0.0-cyan.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React_19_|_FastAPI_|_Tailwind_CSS_v4-emerald.svg)](#)
[![Engine](https://img.shields.io/badge/Engine-Arrhenius_%2B_VPD_%2B_Ethylene_Decay-purple.svg)](#)
[![SCADA](https://img.shields.io/badge/SCADA-Dark_Industrial_Control_Center-blue.svg)](#)

**AgroTwin-Share** is an enterprise-grade, post-harvest cold storage SCADA and biophysical Digital Twin platform. Engineered for cold storage operators, packhouses, and produce exporters, AgroTwin-Share monitors environmental sensor telemetry—**Temperature (°C)**, **Relative Humidity (%)**, and **Ethylene Gas Concentration (ppm)**—to dynamically forecast crop **Shelf-Life Index (SLI %)** and preempt post-harvest losses.

---

## 🏛️ Monorepo Architecture Overview

AgroTwin-Share is organized as a clean monorepo separating the modern React client from the high-performance Python FastAPI biophysical simulation engine:

```
AgroTwin-Share/
├── frontend/                     # React 19 + Vite + Tailwind CSS v4 SCADA Dashboard
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js            # Toggleable Service Layer (const USE_MOCK = true)
│   │   │   ├── mockData.js       # Pre-seeded cold rooms, ripening chambers & batches
│   │   │   └── digitalTwinModel.js # Client-side Arrhenius, VPD & ethylene equations
│   │   ├── context/
│   │   └── TelemetryContext.jsx # Live fluctuation hook (setInterval) & sync
│   │   ├── components/
│   │   │   ├── layout/           # SCADA Header & Sidebar Navigation
│   │   │   ├── overview/         # Overview cards (Active Bins, Temp, RH, C2H4, SLI)
│   │   │   ├── bins/             # Multi-axis Recharts, visual threshold lines, actuators
│   │   │   ├── digitaltwin/      # Produce batch visualizer, countdowns, What-If simulator
│   │   │   ├── batches/          # Produce inventory registry & quality dossiers
│   │   │   ├── alerts/           # Alert drawer & configurable threshold modal
│   │   │   └── common/           # Status badges, gauges, indicators
│   │   ├── App.jsx
│   │   └── index.css             # Industrial dark theme design system
│   └── package.json
│
├── backend/                      # Python 3.12 / FastAPI Digital Twin Engine
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint with CORS & middleware
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic v2 data models & validation
│   │   ├── routers/
│   │   │   ├── bins.py           # /api/bins & /api/bins/{id}/thresholds
│   │   │   ├── batches.py        # /api/batches
│   │   │   ├── history.py        # /api/bins/{id}/history (1h, 6h, 24h, 7d)
│   │   │   ├── telemetry.py      # /api/telemetry (real-time IoT ingestion)
│   │   │   ├── simulation.py     # /api/simulate/sli & /api/simulate/commodities
│   │   │   ├── alerts.py         # /api/alerts & acknowledgment
│   │   │   └── summary.py        # /api/summary SCADA aggregates
│   │   └── services/
│   │       ├── digital_twin_engine.py # Biophysical decay mathematics
│   │       └── storage.py        # In-memory thread-safe state store & event simulator
│   ├── tests/
│   │   └── test_api.py           # Automated unit test suite (11 test cases)
│   └── requirements.txt
│
├── api/                          # Vercel Serverless Function bridge
│   └── index.py                  # ASGI handler for FastAPI endpoints on Vercel
│
├── vercel.json                   # Vercel deployment configuration
├── package.json                  # Root scripts for Vercel build
├── requirements.txt              # Root Python dependencies for Vercel
└── README.md                     # Complete project documentation
```

---

## 🧮 Mathematical & Biophysical Digital Twin Formulation

AgroTwin-Share models produce degradation using a coupled three-factor biophysical decay law:

$$K_{\text{decay}} = K_{\text{base}} \times f_{\text{thermal}}(T) \times f_{\text{hydro}}(T, RH) \times f_{\text{ethylene}}([C_2H_4])$$

### 1. Thermal Respiration Kinetics ($Q_{10}$ Law)
Biological respiration rate increases exponentially with temperature deviations:

$$f_{\text{thermal}}(T) = Q_{10}^{\frac{T - T_{\text{optimal}}}{10}}$$

- **Chilling Injury Hazard:** If $T < T_{\text{chill\_limit}}$ (e.g., $< 12^\circ\text{C}$ for Cavendish Bananas or $< 3^\circ\text{C}$ for Hass Avocados), cell membranes collapse, triggering severe chilling injury penalties:

$$f_{\text{thermal}}(T) = 1.0 + 1.5 \times |T - T_{\text{chill\_limit}}|$$

### 2. Hydro-Deficit & Transpiration ($VPD$)
Produce water loss induces cell desiccation and shriveling. Using the **Tetens Equation**, saturation vapor pressure $VP_{\text{sat}}(T)$ is:

$$VP_{\text{sat}}(T) = 0.61078 \times \exp\left(\frac{17.27 \times T}{T + 237.3}\right) \quad (\text{kPa})$$

The **Vapor Pressure Deficit ($VPD$)** is:

$$VPD = VP_{\text{sat}}(T) \times \left(1 - \frac{RH}{100}\right)$$

Transpiration stress amplifies decay when $VPD > VPD_{\text{optimal}}$:

$$f_{\text{hydro}} = 1.0 + 1.8 \times (VPD - VPD_{\text{optimal}})$$

*Note: Relative humidity exceeding $96\%$ activates fungal/mold risk penalties (e.g., Botrytis cinerea).*

### 3. Phytohormone Ethylene Acceleration ($[C_2H_4]$)
Ethylene is a natural ripening catalyst. For climacteric crops (apples, bananas, avocados, tomatoes), concentrations above safe ceilings trigger accelerated senescent breakdown:

$$f_{\text{ethylene}} = 1.0 + \beta \times \ln\left(1 + 5 \times ([C_2H_4] - [C_2H_4]_{\text{threshold}})\right)$$

### 4. Dynamic Shelf-Life Index (SLI %)
Remaining freshness percentage steps forward dynamically:

$$SLI(t + \Delta t) = SLI(t) - \left( \frac{\text{BaseDailyDecay} \times 100}{24} \times K_{\text{decay}} \times \Delta t \right)$$

Estimated days to commercial unmarketability ($SLI \le 10\%$):

$$T_{\text{remaining\_days}} = \frac{SLI(t)}{\text{BaseDailyDecay} \times 100 \times K_{\text{decay}}}$$

---

## ⚡ Toggleable Mock Service Layer

The frontend provides an API abstraction module in [`src/services/api.js`](file:///C:/Projects/AgroTwin-Share/frontend/src/services/api.js) featuring:

```javascript
// Toggle between autonomous in-browser simulation and FastAPI backend
export const USE_MOCK = true;
```

### Key Behaviors:
1. **When `USE_MOCK = true`:**
   - Operates **100% autonomously in the browser** with zero external backend dependencies.
   - Pre-seeds realistic post-harvest storage bins:
     - **Cold Room Alpha:** Honeycrisp Apples ($1.8^\circ\text{C}$, $92.1\%$, $0.08\text{ ppm}$, $91.4\%\text{ SLI}$)
     - **Ripening Chamber Beta:** Cavendish Bananas ($14.5^\circ\text{C}$, $88.4\%$, $1.25\text{ ppm}$, $72.8\%\text{ SLI}$)
     - **Controlled Atmosphere Gamma:** Hass Avocados ($5.2^\circ\text{C}$, $91.0\%$, $0.12\text{ ppm}$, $85.0\%\text{ SLI}$)
     - **Pre-Cooling Unit Delta:** Sweet Strawberries ($0.8^\circ\text{C}$, $94.3\%$, $0.04\text{ ppm}$, $96.2\%\text{ SLI}$)
     - **Post-Harvest Bay Epsilon:** Roma Tomatoes ($11.8^\circ\text{C}$, $86.5\%$, $0.35\text{ ppm}$, $78.5\%\text{ SLI}$)
   - **Dynamic React `useEffect` Hook:** Runs a `setInterval` (3s cycle) gently fluctuating telemetry via Brownian noise and stepping forward the hydro-thermal decay equations so the dashboard feels alive.
2. **When `USE_MOCK = false`:**
   - Seamlessly redirects all HTTP requests to the FastAPI backend (`http://localhost:8000/api/...` or the Vercel `/api` route).
   - Normalizes backend payloads into UI state and synchronizes alarms and historical charts.
3. **Runtime Header Switcher:**
   - Operators can toggle between **Mock Engine** and **FastAPI Live** directly from the top status bar pill without manually editing code.

---

## ☁️ Vercel Deployment Guide

AgroTwin-Share is pre-configured for one-click deployment on **Vercel**:

### 1. Zero-Config Import:
1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your repository: `https://github.com/aaronaji007/AgroTwin`.
3. Vercel automatically detects [`vercel.json`](file:///C:/Projects/AgroTwin-Share/vercel.json) and [`package.json`](file:///C:/Projects/AgroTwin-Share/package.json):
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Framework:** `Vite`
4. Click **Deploy**.

### 2. Autonomous Cloud Operation:
- Because `const USE_MOCK = true;` is active by default, the web dashboard immediately boots on your `*.vercel.app` domain with live fluctuating telemetry, interactive Recharts, What-If simulation, and alert triggers without needing database or Python setup!
- If deploying Python serverless functions, [`api/index.py`](file:///C:/Projects/AgroTwin-Share/api/index.py) routes FastAPI requests directly.

---

## 🖥️ SCADA Operations Dashboard Capabilities

### 1. Control Center (Overview Page)
- **5 High-Level SCADA Metric Cards:**
  - **Active Storage Bins:** Operational chamber status and online count.
  - **Average Chamber Temperature:** Thermal status across cold and ripening bays.
  - **Average Relative Humidity:** Moisture levels to prevent produce dehydration.
  - **Ethylene Spikes:** Anomaly count for chambers exceeding target thresholds.
  - **Overall Inventory Health:** Weighted SLI % and total biomass valuation in USD.
- **Quick-Status Health Grid:** Interactive tiles displaying real-time temperature, humidity, ethylene, VPD, and circular SLI gauges for each bin.
- **Quick Anomaly Injector:** One-click injection of door seal leaks, compressor breaker trips, or ethylene surges.

### 2. Storage Bin SCADA Detail View
- **Multi-Axis Recharts:**
  - **Dual Temp / RH Area Chart:** Dual Y-axes with upper/lower critical threshold reference lines.
  - **Ethylene Concentration Curve:** Displays catalytic scrubber activation limits.
  - **SLI Decay Trajectory:** Visualizes quality depletion toward the commercial spoilage floor.
- **Chamber Equipment & Actuators:** Real-time monitoring of refrigeration compressor inverter power (kW), circulation fan RPM & CFM, and catalytic ethylene scrubbers.
- **Physical Chamber Stress Injector:** Allows testing chamber resilience under failure scenarios.

### 3. Digital Twin Simulation Panel
- **Batch Biomass Visualizer:** Detailed biological dossiers with harvest dates, intake dates, and quality grades.
- **Dynamic SLI Countdown Timers:** Color-coded timers indicating remaining safe storage days.
- **Automated Spoilage Warning System:** Proactive alerts highlighting batches suffering accelerated degradation.
- **"What-If" Stress Simulator:**
  - Sliders for Temperature adjustment, Relative Humidity, and Ethylene gas concentration.
  - Projection window selector (7, 14, 30, 60 days).
  - Trajectory comparison graph (Baseline vs Simulated Perturbation).
  - Financial impact calculation (USD saved or lost).
  - Instant biophysical recommendation verdict.

### 4. Alarms Drawer & Safety Thresholds Modal
- **Slide-out Alarm Drawer:** Filter active alarms by severity (CRITICAL, WARNING, INFO) and acknowledge incidents.
- **Configurable Threshold Modal:** Fine-tune min/max temperature, humidity, and ethylene limits per bin with one-click commodity presets (Apples CA, Banana Ripen, Avocado Set, Hydro Berry).

---

## 🚀 Local Development Guide

### Prerequisites
- **Node.js** (v18+) & **npm** (v9+)
- **Python** (v3.10+) with `pip`

---

### Option A: Running in Autonomous Mock Mode (Frontend Only)
Zero backend configuration required. The app runs completely out-of-the-box in mock mode.

```bash
# 1. From root, install and run
npm run build
npm run dev
```

Open your browser at **`http://localhost:3000`** (or the port displayed in your terminal).

---

### Option B: Running in Full-Stack Mode (FastAPI + React)

#### 1. Start the FastAPI Backend Engine
```bash
# From the project root, navigate to the backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the backend API server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- FastAPI Backend will run at: **`http://127.0.0.1:8000`**
- Interactive Swagger UI: **`http://127.0.0.1:8000/docs`**
- ReDoc Documentation: **`http://127.0.0.1:8000/redoc`**

#### 2. Start the Frontend Dashboard
```bash
# In a separate terminal, start frontend
npm run dev
```
In the dashboard header, switch the toggle from **Mock Engine** to **FastAPI Live**. The frontend will immediately stream live data from your FastAPI server!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/summary` | Aggregate SCADA KPIs, warning counts, inventory asset value |
| `GET` | `/api/bins` | List all 5 storage bins with current telemetry and actuator states |
| `GET` | `/api/bins/{id}` | Retrieve details for an individual chamber |
| `PUT` | `/api/bins/{id}/thresholds` | Update temperature, humidity, and ethylene safety thresholds |
| `POST` | `/api/bins/{id}/simulate-event` | Inject operational anomaly (`DOOR_OPEN`, `COOLING_FAIL`, `ETHYLENE_SPIKE`) |
| `GET` | `/api/batches` | List all produce batches and biological parameters |
| `GET` | `/api/batches/{id}` | Retrieve specific batch quality dossier |
| `GET` | `/api/bins/{id}/history` | Historical time-series sensor points (`range=1h\|6h\|24h\|7d`) |
| `POST` | `/api/telemetry` | Ingest IoT sensor packets and recalculate SLI dynamically |
| `POST` | `/api/simulate/sli` | Execute What-If Arrhenius & VPD decay trajectory projections |
| `GET` | `/api/alerts` | List unacknowledged and historical system alarms |
| `POST` | `/api/alerts/{id}/acknowledge` | Acknowledge active alarm by operator ID |

---

## 🧪 Verification & Testing

### Running Backend Unit Tests
A comprehensive test suite is provided in `backend/tests/test_api.py`:

```bash
cd backend
python -m unittest discover -s tests -p "test_*.py" -v
```

**Test Output:**
```
test_alerts_and_acknowledgment ... ok
test_bin_history ... ok
test_get_single_bin ... ok
test_list_batches ... ok
test_list_bins ... ok
test_root_and_health ... ok
test_simulate_event ... ok
test_sli_digital_twin_simulation ... ok
test_system_summary ... ok
test_telemetry_ingestion ... ok
test_update_thresholds ... ok

Ran 11 tests in 0.125s - OK
```

### Running Frontend Production Build
```bash
npm run build
```
Vite transforms and bundles all assets with zero syntax or compilation warnings.

---

## 🛡️ License & Credits
Developed as part of the **AgroTwin-Share** project by [aaronaji007](https://github.com/aaronaji007) for post-harvest food preservation, cold chain resilience, and digital twin monitoring.
