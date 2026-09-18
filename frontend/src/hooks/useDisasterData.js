import { useState, useEffect, useCallback } from 'react';

const TELEMETRY_FALLBACK_BUFFER = [
  { id: 1, name: "Upper Sunil Sector", alt_name: "Upper Sunil Ward", lat: 30.5582, lon: 79.5635, slope: 38.5, houses: 165, dwellings: 165, civilians: 860, soil: "Glacial Till", soilProfile: "Glacial Till", status: "RED", zone: "RED", rpi: 0.842, rpi_score: 0.842, calculatedRpi: 84, baseRpi: 84, baseOverburden: 1.89, overburden: 1.89, overburden_ratio: 1.89, evacCutoffRisk: 85, shelter: "Army Cantonment Ground" },
  { id: 2, name: "Manohar Bagh", alt_name: "Manohar Bagh Sector", lat: 30.5541, lon: 79.5670, slope: 34.2, houses: 120, dwellings: 120, civilians: 620, soil: "Moraine Clay", soilProfile: "Moraine Clay", status: "ORANGE", zone: "ORANGE", rpi: 0.655, rpi_score: 0.655, calculatedRpi: 66, baseRpi: 66, baseOverburden: 1.55, overburden: 1.55, overburden_ratio: 1.55, evacCutoffRisk: 70, shelter: "Tapovan Inter College" },
  { id: 3, name: "Singhdhar Ridge", alt_name: "Singhdhar Sector", lat: 30.5510, lon: 79.5615, slope: 41.0, houses: 95, dwellings: 95, civilians: 510, soil: "Loose Silt", soilProfile: "Loose Silt", status: "RED", zone: "RED", rpi: 0.890, rpi_score: 0.890, calculatedRpi: 89, baseRpi: 89, baseOverburden: 2.10, overburden: 2.10, overburden_ratio: 2.10, evacCutoffRisk: 90, shelter: "Pipalkoti Transit Camp" },
  { id: 4, name: "Marwari Basin", alt_name: "Marwari Lower Basti", lat: 30.5475, lon: 79.5580, slope: 28.0, houses: 180, dwellings: 180, civilians: 940, soil: "Alluvial Terrace", soilProfile: "Alluvial Terrace", status: "ORANGE", zone: "ORANGE", rpi: 0.540, rpi_score: 0.540, calculatedRpi: 54, baseRpi: 54, baseOverburden: 1.25, overburden: 1.25, overburden_ratio: 1.25, evacCutoffRisk: 60, shelter: "Birahi Multi-Purpose Hall" },
  { id: 5, name: "Gandhi Nagar", alt_name: "Gandhi Nagar Sector", lat: 30.5620, lon: 79.5710, slope: 22.0, houses: 80, dwellings: 80, civilians: 410, soil: "Fractured Gneiss", soilProfile: "Fractured Gneiss", status: "GREEN", zone: "GREEN", rpi: 0.380, rpi_score: 0.380, calculatedRpi: 38, baseRpi: 38, baseOverburden: 0.90, overburden: 0.90, overburden_ratio: 0.90, evacCutoffRisk: 35, shelter: "Helipad Sector Relief Camp" },
  { id: 6, name: "Ravigram Shelf", alt_name: "Ravigram Safe Zone", lat: 30.5660, lon: 79.5760, slope: 11.5, houses: 210, dwellings: 210, civilians: 1100, soil: "Massive Quartzite", soilProfile: "Massive Quartzite", status: "GREEN", zone: "GREEN", rpi: 0.210, rpi_score: 0.210, calculatedRpi: 21, baseRpi: 21, baseOverburden: 0.70, overburden: 0.70, overburden_ratio: 0.70, evacCutoffRisk: 15, shelter: "Joshimath Stadium Safe Zone" }
];

function calculateFallbackState(rainfall) {
  const processed = TELEMETRY_FALLBACK_BUFFER.map((ward) => {
    const rainFactor = (rainfall - 65) * 0.28;
    const calculatedRpi = Math.max(8, Math.min(99, Math.round(ward.baseRpi + rainFactor)));
    const overburden = Number((ward.baseOverburden * (1 + (rainfall - 65) * 0.0022)).toFixed(2));
    const evacCutoffRisk = Math.min(98, Math.max(10, Math.round((ward.slope * 1.5) + (rainfall * 0.12))));

    let status = 'GREEN';
    let zone = 'GREEN';
    let tier = 'STABLE_GREEN';
    if (calculatedRpi >= 70) {
      status = 'RED';
      zone = 'RED';
      tier = 'CRITICAL_RED';
    } else if (calculatedRpi >= 45) {
      status = 'ORANGE';
      zone = 'ORANGE';
      tier = 'WARNING_AMBER';
    }

    return {
      ...ward,
      calculatedRpi,
      rpi: Number((calculatedRpi / 100).toFixed(3)),
      rpi_score: Number((calculatedRpi / 100).toFixed(3)),
      overburden,
      overburden_ratio: overburden,
      evacCutoffRisk,
      status,
      zone,
      tier
    };
  });

  processed.sort((a, b) => b.calculatedRpi - a.calculatedRpi);
  processed.forEach((item, idx) => { item.rank = idx + 1; });

  const redWards = processed.filter(w => w.status === 'RED' || w.zone === 'RED');
  const redCount = redWards.length;
  const orangeCount = processed.filter(w => w.status === 'ORANGE' || w.zone === 'ORANGE').length;
  const greenCount = processed.filter(w => w.status === 'GREEN' || w.zone === 'GREEN').length;
  const totalAtRisk = redWards.reduce((sum, w) => sum + (w.civilians || w.houses * 5.2), 0);
  const maxOverburden = Math.max(...processed.map(w => w.overburden));

  return {
    habitations: processed,
    kpiData: {
      redZones: `${redCount} Sectors`,
      redZoneCount: redCount,
      orangeZoneCount: orangeCount,
      greenZoneCount: greenCount,
      atRiskPopulation: Math.round(totalAtRisk).toLocaleString('en-IN'),
      totalAtRisk: Math.round(totalAtRisk),
      maxOverburden: `${maxOverburden.toFixed(2)}x`,
      peakPorePressureKpa: (36.0 + rainfall * 0.205 + 8.2).toFixed(1),
      rainfallStatus: rainfall < 60 ? '<60mm: Normal Precipitation' : (rainfall <= 140 ? '60-140mm: High Saturation Risk' : '>140mm: Critical Cloudburst Trigger')
    }
  };
}

export function useDisasterData() {
  const [rainfall, setRainfall] = useState(65);
  const [habitations, setHabitations] = useState(() => calculateFallbackState(65).habitations);
  const [kpiData, setKpiData] = useState(() => calculateFallbackState(65).kpiData);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (rain) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/assess-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rainfall_24h: Number(rain) })
      });

      if (res.ok) {
        const json = await res.json();
        const sectors = json.habitations || json.sectors || [];
        const summary = json.summary || json.kpis || {};

        const mapped = sectors.map((h, idx) => {
          const rpiVal = Number((h.rpi_score !== undefined ? h.rpi_score : (h.rpi !== undefined ? h.rpi : 0.5)).toFixed(3));
          const calculatedRpi = h.calculatedRpi !== undefined ? h.calculatedRpi : Math.round(rpiVal * 100);
          const hazardTier = h.hazard_tier || h.tier || (rpiVal >= 0.70 ? "CRITICAL_RED" : (rpiVal >= 0.45 ? "WARNING_AMBER" : "STABLE_GREEN"));
          const status = h.status || (rpiVal >= 0.70 ? "RED" : (rpiVal >= 0.45 ? "ORANGE" : "GREEN"));
          const zone = h.zone || (rpiVal >= 0.70 ? "RED" : (rpiVal >= 0.45 ? "ORANGE" : "GREEN"));

          return {
            id: h.id,
            name: h.name,
            alt_name: h.alt_name || h.name,
            lat: h.lat,
            lon: h.lon,
            lng: h.lon,
            slope: h.slope_deg || h.slope,
            slope_deg: h.slope_deg || h.slope,
            soil: h.soil || 'Colluvial Collapsible Soil',
            soilProfile: h.soil || 'Colluvial Collapsible Soil',
            houses: h.houses || h.current_houses || 100,
            dwellings: h.houses || h.current_houses || 100,
            civilians: h.civilians || Math.round((h.houses || 100) * 5.2),
            overburden: Number((h.overburden_ratio || h.overburden || 1.0).toFixed(2)),
            overburden_ratio: Number((h.overburden_ratio || h.overburden || 1.0).toFixed(2)),
            shelter: h.shelter || "Army Cantonment Ground",
            calculatedRpi,
            rpi: rpiVal,
            rpi_score: rpiVal,
            hazard_tier: hazardTier,
            tier: hazardTier,
            evacCutoffRisk: Math.round((h.cutoff_risk || 0.5) * 100),
            status,
            zone,
            rank: h.rank || idx + 1,
            action_directive: h.action_directive || ""
          };
        });

        mapped.sort((a, b) => b.calculatedRpi - a.calculatedRpi);
        mapped.forEach((item, i) => { item.rank = i + 1; });

        setHabitations(mapped);

        const redWards = mapped.filter(w => w.status === 'RED' || w.zone === 'RED' || w.hazard_tier === 'CRITICAL_RED');
        const redCount = redWards.length;
        const orangeCount = mapped.filter(w => w.status === 'ORANGE' || w.status === 'AMBER' || w.zone === 'ORANGE' || w.zone === 'AMBER' || w.hazard_tier === 'WARNING_AMBER').length;
        const greenCount = mapped.filter(w => w.status === 'GREEN' || w.zone === 'GREEN' || w.hazard_tier === 'STABLE_GREEN').length;
        const totalAtRisk = summary.totalAtRisk || redWards.reduce((acc, w) => acc + (w.civilians || 0), 0);
        const maxOverburden = summary.maxOverburden || `${Math.max(...mapped.map(w => w.overburden || 1.0)).toFixed(2)}x`;

        setKpiData({
          redZones: summary.redZones || `${redCount} Sectors`,
          redZoneCount: redCount,
          orangeZoneCount: orangeCount,
          greenZoneCount: greenCount,
          atRiskPopulation: summary.atRiskPopulation || (totalAtRisk ? totalAtRisk.toLocaleString('en-IN') : "0"),
          totalAtRisk: totalAtRisk,
          maxOverburden: typeof maxOverburden === 'string' ? maxOverburden : `${maxOverburden}x`,
          peakPorePressureKpa: summary.peakPorePressureKpa || (36.0 + rain * 0.205 + 8.2).toFixed(1),
          rainfallStatus: rain < 60 ? '<60mm: Normal Precipitation' : (rain <= 140 ? '60-140mm: High Saturation Risk' : '>140mm: Critical Cloudburst Trigger'),
          modelStatus: summary.modelStatus || "ML_ACTIVE"
        });
      } else {
        const fallback = calculateFallbackState(rain);
        setHabitations(fallback.habitations);
        setKpiData(fallback.kpiData);
      }
    } catch (e) {
      const fallback = calculateFallbackState(rain);
      setHabitations(fallback.habitations);
      setKpiData(fallback.kpiData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(rainfall);
    }, 250);
    return () => clearTimeout(timer);
  }, [rainfall, fetchData]);

  return { rainfall, setRainfall, habitations, kpiData, loading, refreshData: () => fetchData(rainfall) };
}

export const useLiveDisasterData = useDisasterData;
