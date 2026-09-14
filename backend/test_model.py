import joblib
import pandas as pd
import numpy as np

# Load trained model artifact
artifact = joblib.load("models/hazard_model.pkl")
if isinstance(artifact, dict) and "pipeline" in artifact:
    model = artifact["pipeline"]
elif isinstance(artifact, dict) and "model" in artifact:
    model = artifact["model"]
else:
    model = artifact

# Test Scenarios based on Joshimath Ground Reality
test_cases = [
    {
        "name": "Scenario 1: Dry Weather - Bedrock (Ravigram)",
        "features": {
            "slope_deg": 11.5,
            "rainfall_24h": 0.0,
            "soil_cohesion_kpa": 48.0,
            "friction_angle_deg": 35.0,
            "pore_water_ratio": 0.05,
            "insar_base_rate": 0.4,
            "building_density": 60
        },
        "expected": "GREEN (Stable, RPI < 0.40)"
    },
    {
        "name": "Scenario 2: Moderate Rain - Colluvium Scree (Manohar Bagh)",
        "features": {
            "slope_deg": 34.2,
            "rainfall_24h": 65.0,
            "soil_cohesion_kpa": 22.0,
            "friction_angle_deg": 28.0,
            "pore_water_ratio": 0.45,
            "insar_base_rate": 6.8,
            "building_density": 120
        },
        "expected": "AMBER (Warning, RPI 0.45 - 0.70)"
    },
    {
        "name": "Scenario 3: Extreme Cloudburst - Fractured Glacial Till (Singhdhar Ridge)",
        "features": {
            "slope_deg": 41.0,
            "rainfall_24h": 140.0,
            "soil_cohesion_kpa": 11.0,
            "friction_angle_deg": 24.0,
            "pore_water_ratio": 0.88,
            "insar_base_rate": 16.1,
            "building_density": 180
        },
        "expected": "CRITICAL RED (Hazard Failure, RPI > 0.75)"
    }
]

print("\n" + "="*60)
print("AABHAS ML HAZARD MODEL AUDIT & STRESS TEST")
print("="*60)

for case in test_cases:
    df = pd.DataFrame([case["features"]])
    rpi = float(model.predict(df)[0])
    
    tier = "CRITICAL_RED" if rpi >= 0.70 else "WARNING_AMBER" if rpi >= 0.45 else "STABLE_GREEN"
    
    print(f"\nTarget: {case['name']}")
    print(f"Predicted RPI: {rpi:.4f} | Hazard Tier: {tier}")
    print(f"Benchmark Expectation: {case['expected']}")
    
print("\n" + "="*60 + "\n")
