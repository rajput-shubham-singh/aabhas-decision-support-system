# AABHAS | Integrated Decision Support System (IDSS)
**Chamoli District Emergency Operations Center (EOC) • Uttarakhand State Disaster Management Authority (USDMA)**

---

## 1. System Overview
AABHAS is an integrated, operational geotechnical monitoring and tactical evacuation decision support platform deployed for the high-altitude terrain of Chamoli District (Joshimath, Helang, Karnaprayag, Tharali, Nandaprayag corridors). The system unifies multi-source sensor telemetry, slope stability models, AIS-140 transit telemetry, and Common Alerting Protocol (CAP) citizen broadcast gateways into a centralized command console.

```
+-----------------------------------------------------------------------------------+
|                           AABHAS Operational Topology                             |
+-----------------------------------------------------------------------------------+
|  [IMD Doppler & AWS]   [ISRO-NRSC InSAR Subsidence]   [USGS/DGM Geotechnical DB]  |
|            \                         |                         /                  |
|             \                        v                        /                   |
|              +--------> [ FastAPI Telemetry Backend ] <-------+                   |
|                                      |                                            |
|                         +------------+------------+                               |
|                         |                         |                               |
|                         v                         v                               |
|              [Bishop Stability / ML]   [Google OR-Tools Logistics]                |
|                         |                         |                               |
|                         +------------+------------+                               |
|                                      v                                            |
|                [ Supabase PostGIS Geospatial Registry ]                           |
|                                      v                                            |
|            [ Production React / Tailwind Tactical Command Web GUI ]               |
|                                      |                                            |
|                   +------------------+------------------+                         |
|                   v                                     v                         |
|      [AIS-140 Convoy Logistics]             [C-DOT / CAP SMS Gateway]             |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Operational Modules

### A. Geotechnical & Subsidence Analysis
- **Limit-Equilibrium Modeling**: Bishop slice equilibrium computation conformant with NDMA-2019 landslide hazard guidelines.
- **Interferometric Synthetic Aperture Radar (InSAR)**: Hydrates line-of-sight (LOS) crustal velocity vectors along the Main Central Thrust (MCT) and Vaikrita Thrust zones.
- **Pore Pressure & Infiltration**: Real-time integration of antecedent moisture conditions and 24-hour IMD Doppler precipitation grids.

### B. Evacuation Logistics & Optimization Engine
- **Capacity Constraint Solver**: Google OR-Tools Mixed-Integer Linear Programming (MILP) allocating habitations to regional bedrock relief shelters (Gopeshwar, Gauchar, Pipalkoti, Gairsain, Joshimath Cantonment).
- **Dynamic Chute Re-Routing**: Automated rerouting matrix triggered upon structural severance along NH-07 (e.g., Helang Chute / Joshimath Bypass).
- **Transit Telemetry**: Real-time AIS-140 GPS convoy tracking for Uttarakhand Transport Corporation (UTC) and ITBP 1st Bn logistical assets.

### C. Common Alerting Protocol (CAP) Broadcast Gateway
- **C-DOT Geofenced Cell Broadcast**: Instantaneous SMS and cell broadcast trigger to Tier-1 BTS nodes across vulnerable border corridors.
- **Multilingual Telemetry Bulletins**: Automated bilingual generation (English & Hindi) in adherence to ITU-T X.1303 disaster messaging specifications.

---

## 3. Technology Stack & Directory Structure

```
SIH_V2/
├── backend/
│   ├── main.py              # FastAPI core services & geotechnical inference endpoints
│   ├── models/              # Pretrained scikit-learn / XGBoost hazard classification models
│   ├── train_model.py       # Geotechnical risk baseline model trainer
│   └── requirements.txt     # Python runtime dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Tactical GIS, Fleet Logistics, Shelter, & Broadcast views
│   │   ├── hooks/           # Real-time Supabase / API hydration hooks
│   │   ├── lib/             # PostGIS Supabase client & utility helpers
│   │   ├── data/            # Chamoli cadastral sector geometries & baseline parameters
│   │   ├── App.jsx          # Master tactical incident command shell
│   │   └── main.jsx         # Application entrypoint
│   ├── package.json         # Build configuration
│   └── vite.config.js       # Bundler configuration
└── README.md
```

---

## 4. Setup & Deployment Instructions

### Backend (Python FastAPI)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Security & Governance
- **Statutory Authority**: District Disaster Management Authority (DDMA) Chamoli / State Remote Sensing Center.
- **Classification**: Sovereign Disaster Management Operational Asset (Proprietary - Government of Uttarakhand).
