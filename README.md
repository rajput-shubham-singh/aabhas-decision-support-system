# AABHAS | Integrated Decision Support System (IDSS)
**District Disaster Management Authority (DDMA) Chamoli • Uttarakhand State Disaster Management Authority (USDMA)**

---

## Operational Architecture

AABHAS (Automated Altitude-Baseline Hazard Assessment & Shelter-routing System) is an integrated decision-support platform engineered for real-time geotechnical hazard classification, dynamic evacuation route allocation, transit logistics coordination, and statutory Common Alerting Protocol (CAP) broadcasts across Chamoli District, Uttarakhand.

### Core Modules
1. **Real-Time Geotechnical Hazard Inference**: Integrates antecedent precipitation indexes (API), Bishop limit-equilibrium slice stability factors, and ISRO-NRSC InSAR subsidence velocity fields.
2. **OR-Tools Relocation Optimization**: High-throughput mixed-integer linear programming allocating vulnerable sectors (Joshimath, Helang, Karnaprayag, Tharali) to safe bedrock relief camps with transit capacity constraints.
3. **AIS-140 Fleet Tracking**: Live telemetry ingestion for UTC buses, ITBP troop carriers, and Advanced Life Support (ALS) ambulances.
4. **C-DOT CAP Broadcast Console**: Automated bilingual (Hindi / English) early warning dispatch across geofenced cellular BTS towers.

---

## Deployment & Execution

### Backend Telemetry Service
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Incident Command Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Institutional Authority
- **Implementing Agency**: DDMA Chamoli & USDMA
- **Technical Standards**: NDMA-2019 Landslide Guidelines • ITU-T X.1303 CAP Protocol • AIS-140 Intelligent Transportation Systems
