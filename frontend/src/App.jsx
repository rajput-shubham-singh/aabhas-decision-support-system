import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import TacticalMap from './components/TacticalMap';
import FleetView from './components/FleetView';
import SheltersView from './components/SheltersView';
import BroadcastView from './components/BroadcastView';
import { useDisasterData } from './hooks/useDisasterData.js';
import { 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  ArrowUpRight, 
  Bot, 
  Check, 
  CheckCircle2, 
  CloudRain, 
  Crosshair, 
  Gauge, 
  Info, 
  ListOrdered, 
  Map as MapIcon, 
  MapPin, 
  Printer, 
  Radio, 
  Send, 
  Shield, 
  ShieldAlert, 
  Siren, 
  Sparkles, 
  Tent, 
  Truck, 
  X,
  RefreshCw
} from 'lucide-react';

const FALLBACK_HABITATIONS = [
  { id: 1, ward_no: 3, name: "Upper Sunil (Ward 3)", alt_name: "Upper Sunil Slope", lat: 30.5588, lon: 79.5580, slope: 38.5, houses: 178, dwellings: 178, cracked_units: 84, civilians: 890, population: 890, soil: "Glacial Till", soilProfile: "Glacial Till", status: "RED", zone: "RED", rpi: 0.725, rpi_score: 0.725, calculatedRpi: 73, baseRpi: 73, baseOverburden: 1.82, overburden: 1.82, overburden_ratio: 1.82, evacCutoffRisk: 85, shelter: "Military Cantonment & Helipad", evac_hub: "Military Cantonment & Helipad", hazard_tier: "CRITICAL_RED", tier: "CRITICAL_RED" },
  { id: 2, ward_no: 5, name: "Manohar Bagh (Ward 5)", alt_name: "Manohar Bagh Sector", lat: 30.5565, lon: 79.5680, slope: 34.2, houses: 154, dwellings: 154, cracked_units: 66, civilians: 740, population: 740, soil: "Moraine Clay", soilProfile: "Moraine Clay", status: "ORANGE", zone: "ORANGE", rpi: 0.450, rpi_score: 0.450, calculatedRpi: 45, baseRpi: 45, baseOverburden: 1.88, overburden: 1.88, overburden_ratio: 1.88, evacCutoffRisk: 70, shelter: "Tapovan GIC Civil Center", evac_hub: "Tapovan GIC Civil Center", hazard_tier: "WARNING_AMBER", tier: "WARNING_AMBER" },
  { id: 3, ward_no: 4, name: "Singhdhar (Ward 4)", alt_name: "Singhdhar Ridge", lat: 30.5542, lon: 79.5635, slope: 41.0, houses: 162, dwellings: 162, cracked_units: 98, civilians: 780, population: 780, soil: "Loose Colluvial Silt", soilProfile: "Loose Colluvial Silt", status: "RED", zone: "RED", rpi: 0.788, rpi_score: 0.788, calculatedRpi: 79, baseRpi: 79, baseOverburden: 2.95, overburden: 2.95, overburden_ratio: 2.95, evacCutoffRisk: 90, shelter: "Pipalkoti Intermediate Staging Center", evac_hub: "Pipalkoti Intermediate Staging Center", hazard_tier: "CRITICAL_RED", tier: "CRITICAL_RED" },
  { id: 4, ward_no: 2, name: "Marwari (Ward 2)", alt_name: "Marwari Scarp", lat: 30.5615, lon: 79.5740, slope: 28.0, houses: 192, dwellings: 192, cracked_units: 58, civilians: 960, population: 960, soil: "Alluvial Terrace", soilProfile: "Alluvial Terrace", status: "GREEN", zone: "GREEN", rpi: 0.386, rpi_score: 0.386, calculatedRpi: 39, baseRpi: 39, baseOverburden: 1.75, overburden: 1.75, overburden_ratio: 1.75, evacCutoffRisk: 60, shelter: "ITBP First Responder Transit Node", evac_hub: "ITBP First Responder Transit Node", hazard_tier: "STABLE_GREEN", tier: "STABLE_GREEN" },
  { id: 5, ward_no: 1, name: "Gandhi Nagar (Ward 1)", alt_name: "Gandhi Nagar Sector", lat: 30.5510, lon: 79.5595, slope: 22.0, houses: 138, dwellings: 138, cracked_units: 34, civilians: 690, population: 690, soil: "Fractured Gneiss", soilProfile: "Fractured Gneiss", status: "GREEN", zone: "GREEN", rpi: 0.185, rpi_score: 0.185, calculatedRpi: 19, baseRpi: 19, baseOverburden: 1.50, overburden: 1.50, overburden_ratio: 1.50, evacCutoffRisk: 35, shelter: "Military Cantonment & Helipad", evac_hub: "Military Cantonment & Helipad", hazard_tier: "STABLE_GREEN", tier: "STABLE_GREEN" },
  { id: 6, ward_no: 9, name: "Ravigram (Ward 9)", alt_name: "Ravigram Shelf", lat: 30.5502, lon: 79.5780, slope: 11.5, houses: 224, dwellings: 224, cracked_units: 12, civilians: 1120, population: 1120, soil: "Massive Quartzite Bedrock", soilProfile: "Massive Quartzite", status: "GREEN", zone: "GREEN", rpi: 0.145, rpi_score: 0.145, calculatedRpi: 15, baseRpi: 15, baseOverburden: 0.97, overburden: 0.97, overburden_ratio: 0.97, evacCutoffRisk: 15, shelter: "Military Cantonment & Helipad", evac_hub: "Military Cantonment & Helipad", hazard_tier: "STABLE_GREEN", tier: "STABLE_GREEN" }
];

const VERIFIED_RELIEF_CAMPS = [
  {
    id: "camp-1",
    name: "Military Cantonment & Helipad",
    alt_name: "Army Cantonment Staging Base",
    coords: [30.5435, 79.5710],
    lat: 30.5435,
    lon: 79.5710,
    capacity: 850,
    occupancy: 180,
    live_occupancy: 180,
    available_beds: 670,
    live_available_beds: 670,
    safe_corridor: "High Gneiss Plateau Axis",
    authority: "Indian Army 9th (I) Mtn Bde",
    rations_days: 21,
    medical_unit: "Army Military Hospital (MH) Ward",
    status: "OPERATIONAL"
  },
  {
    id: "camp-2",
    name: "ITBP First Responder Transit Node",
    alt_name: "ITBP Joshimath Staging Area",
    coords: [30.5685, 79.5520],
    lat: 30.5685,
    lon: 79.5520,
    capacity: 600,
    occupancy: 95,
    live_occupancy: 95,
    available_beds: 505,
    live_available_beds: 505,
    safe_corridor: "Auli Ridge Bypass",
    authority: "ITBP 1st Battalion Staging",
    rations_days: 18,
    medical_unit: "ITBP Tactical Trauma Team",
    status: "OPERATIONAL"
  },
  {
    id: "camp-3",
    name: "Tapovan GIC Civil Center",
    alt_name: "Tapovan Relief Center",
    coords: [30.4950, 79.6320],
    lat: 30.4950,
    lon: 79.6320,
    capacity: 450,
    occupancy: 120,
    live_occupancy: 120,
    available_beds: 330,
    live_available_beds: 330,
    safe_corridor: "Malari Link Route",
    authority: "Uttarakhand SDM Civil Sector",
    rations_days: 10,
    medical_unit: "Primary Health Centre (PHC) Annex",
    status: "OPERATIONAL"
  },
  {
    id: "camp-4",
    name: "Pipalkoti Intermediate Staging Center",
    alt_name: "Pipalkoti Transit Camp",
    coords: [30.4289, 79.4325],
    lat: 30.4289,
    lon: 79.4325,
    capacity: 1200,
    occupancy: 410,
    live_occupancy: 410,
    available_beds: 790,
    live_available_beds: 790,
    safe_corridor: "NH-07 Axis",
    authority: "NDRF 8th Bn / Chamoli District Admin",
    rations_days: 14,
    medical_unit: "Level-2 Field Surgical Facility",
    status: "OPERATIONAL"
  }
];

function generateFallbackCorridors(processedWards, rf) {
  const criticalAndAmber = processedWards.filter(w => w.status === 'RED' || w.status === 'ORANGE' || w.zone === 'RED' || w.zone === 'ORANGE' || w.hazard_tier === 'CRITICAL_RED' || w.hazard_tier === 'WARNING_AMBER');
  
  return criticalAndAmber.map(s => {
    let camp = VERIFIED_RELIEF_CAMPS[0];
    const nameLower = (s.name || '').toLowerCase();
    if (nameLower.includes("sunil")) camp = VERIFIED_RELIEF_CAMPS[0];
    else if (nameLower.includes("singhdhar")) camp = VERIFIED_RELIEF_CAMPS[3];
    else if (nameLower.includes("manohar")) camp = VERIFIED_RELIEF_CAMPS[2];
    else if (nameLower.includes("marwari")) camp = VERIFIED_RELIEF_CAMPS[1];
    else if (nameLower.includes("gandhi") || nameLower.includes("ravigram")) camp = VERIFIED_RELIEF_CAMPS[0];

    const isUrgent = (s.hazard_tier === 'CRITICAL_RED' || s.status === 'RED') && rf > 10;
    return {
      sector_id: s.id,
      sector_name: s.name,
      from_coords: [s.lat, s.lon || s.lng],
      to_camp_id: camp.id,
      to_camp_name: camp.name,
      to_coords: camp.coords,
      corridor_name: camp.safe_corridor,
      civilians_to_route: s.population || s.civilians || 750,
      dwellings_affected: s.dwellings || s.houses || 150,
      priority: isUrgent ? "URGENT" : "STANDBY",
      hazard_tier: s.hazard_tier || (isUrgent ? "CRITICAL_RED" : "WARNING_AMBER"),
      tier: s.hazard_tier || (isUrgent ? "CRITICAL_RED" : "WARNING_AMBER"),
      color: isUrgent ? "#ef4444" : "#f59e0b"
    };
  });
}

function calculateLocalFallback(rainVal) {
  const rf = Number(rainVal);
  const peak_overburden = Number((1.12 + (rf / 180.0) * 0.76).toFixed(2));
  const pore_pressure = Number((14.5 + (rf / 180.0) * 36.2).toFixed(1));
  const aquifer_saturation = Math.min(99, Math.round(22 + (rf / 180.0) * 73));
  const shear_strain = Number((0.8 + (rf / 180.0) * 3.4).toFixed(1));

  const processed = FALLBACK_HABITATIONS.map((ward) => {
    const rainFactor = (rainVal - 65) * 0.28;
    const calculatedRpi = Math.max(8, Math.min(99, Math.round(ward.baseRpi + rainFactor)));
    const overburden = Number((ward.baseOverburden * (1 + (rainVal - 65) * 0.0022)).toFixed(2));
    const evacCutoffRisk = Math.min(98, Math.max(10, Math.round((ward.slope * 1.5) + (rainVal * 0.12))));

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
      tier,
      hazard_tier: tier
    };
  });

  processed.sort((a, b) => b.calculatedRpi - a.calculatedRpi);
  processed.forEach((item, idx) => { item.rank = idx + 1; });

  const redWards = processed.filter(w => w.status === 'RED' || w.zone === 'RED');
  const orangeWards = processed.filter(w => w.status === 'ORANGE' || w.status === 'AMBER' || w.zone === 'ORANGE' || w.zone === 'AMBER');
  const atRiskWards = processed.filter(w => w.status === 'RED' || w.status === 'ORANGE' || w.status === 'AMBER' || w.zone === 'RED' || w.zone === 'ORANGE' || w.zone === 'AMBER');
  const redCount = redWards.length;
  const orangeCount = orangeWards.length;
  const greenCount = processed.filter(w => w.status === 'GREEN' || w.zone === 'GREEN').length;
  const totalAtRisk = atRiskWards.reduce((sum, w) => sum + (w.population || w.civilians || 0), 0);

  const telemetry = {
    peak_overburden,
    pore_pressure_kpa: pore_pressure,
    aquifer_saturation_pct: aquifer_saturation,
    shear_strain_mm_day: shear_strain
  };

  const evacuation_corridors = generateFallbackCorridors(processed, rainVal);

  return {
    habitations: processed,
    camps: VERIFIED_RELIEF_CAMPS,
    evacuation_corridors,
    telemetry,
    kpiData: {
      redZones: `${redCount} Sectors`,
      redZoneCount: redCount,
      orangeZoneCount: orangeCount,
      greenZoneCount: greenCount,
      atRiskPopulation: Math.round(totalAtRisk).toLocaleString('en-IN'),
      totalAtRisk: Math.round(totalAtRisk),
      maxOverburden: `${peak_overburden.toFixed(2)}x`,
      peakPorePressureKpa: pore_pressure.toFixed(1),
      rainfallStatus: rainVal < 60 ? '<60mm: Normal Precipitation' : (rainVal <= 140 ? '60-140mm: High Saturation Risk' : '>140mm: Critical Cloudburst Trigger')
    }
  };
}

export default function App() {
  const [rainfall, setRainfall] = useState(65);
  const [habitations, setHabitations] = useState(() => calculateLocalFallback(65).habitations);
  const [camps, setCamps] = useState(() => VERIFIED_RELIEF_CAMPS);
  const [evacuationCorridors, setEvacuationCorridors] = useState(() => calculateLocalFallback(65).evacuation_corridors);
  const [kpiData, setKpiData] = useState(() => calculateLocalFallback(65).kpiData);
  const [telemetry, setTelemetry] = useState(() => calculateLocalFallback(65).telemetry);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeTab, setActiveTab] = useState('gis'); // 'gis'/'map' | 'fleet'/'transit' | 'camps'/'shelters' | 'broadcast'
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isEvacModalOpen, setIsEvacModalOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showDispatchToast, setShowDispatchToast] = useState(false);
  const [dispatchToastMsg, setDispatchToastMsg] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: 'bot',
      title: 'MHA Disaster Intelligence Briefing:',
      text: 'Monitoring Sector Joshimath (Chamoli). Telemetry and carrying capacity models actively linked to ISRO-NRSC and NDRF 8th Bn.',
      bullets: [
        'Upper Sunil and Manohar Bagh have breached trigger redlines under monsoon saturation.',
        'Subsidence velocity: 4.1 mm/day along fault escarpment.',
        'Civil relocation standby: 18 buses deployed, 4 relief transit camps ready.'
      ]
    }
  ]);

  // Debounced real-time hazard assessment hook (250ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsDataLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/assess-hazard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rainfall_24h: Number(rainfall) })
        });

        if (res.ok) {
          const json = await res.json();
          const sectors = json.habitations || json.sectors || [];
          const summary = json.summary || json.kpis || {};

          if (json.camps && Array.isArray(json.camps)) {
            setCamps(json.camps);
          }
          if (json.evacuation_corridors && Array.isArray(json.evacuation_corridors)) {
            setEvacuationCorridors(json.evacuation_corridors);
          }

          if (json.telemetry) {
            setTelemetry(json.telemetry);
          } else {
            const rf = Number(rainfall);
            setTelemetry({
              peak_overburden: Number((1.12 + (rf / 180.0) * 0.76).toFixed(2)),
              pore_pressure_kpa: Number((14.5 + (rf / 180.0) * 36.2).toFixed(1)),
              aquifer_saturation_pct: Math.min(99, Math.round(22 + (rf / 180.0) * 73)),
              shear_strain_mm_day: Number((0.8 + (rf / 180.0) * 3.4).toFixed(1))
            });
          }

          const mapped = sectors.map((h, idx) => {
            const rpiVal = Number((h.rpi_score !== undefined ? h.rpi_score : (h.rpi !== undefined ? h.rpi : 0.5)).toFixed(3));
            const calculatedRpi = h.calculatedRpi !== undefined ? h.calculatedRpi : Math.round(rpiVal * 100);
            const hazardTier = h.hazard_tier || h.tier || (rpiVal >= 0.70 ? "CRITICAL_RED" : (rpiVal >= 0.45 ? "WARNING_AMBER" : "STABLE_GREEN"));
            const status = h.status || (rpiVal >= 0.70 ? "RED" : (rpiVal >= 0.45 ? "ORANGE" : "GREEN"));
            const zone = h.zone || (rpiVal >= 0.70 ? "RED" : (rpiVal >= 0.45 ? "ORANGE" : "GREEN"));

            return {
              id: h.id,
              ward_no: h.ward_no || h.id,
              name: h.name,
              alt_name: h.alt_name || h.name,
              lat: h.lat,
              lon: h.lon,
              lng: h.lon,
              slope: h.slope_deg || h.slope,
              slope_deg: h.slope_deg || h.slope,
              soil: h.soil || 'Colluvial Collapsible Soil',
              soilProfile: h.soil || 'Colluvial Collapsible Soil',
              dwellings: h.dwellings || h.houses || h.current_houses || 150,
              houses: h.dwellings || h.houses || h.current_houses || 150,
              current_houses: h.dwellings || h.houses || h.current_houses || 150,
              cracked_units: h.cracked_units !== undefined ? h.cracked_units : 50,
              population: h.population || h.civilians || 750,
              civilians: h.population || h.civilians || 750,
              overburden: Number((h.overburden_ratio || h.overburden || 1.0).toFixed(2)),
              overburden_ratio: Number((h.overburden_ratio || h.overburden || 1.0).toFixed(2)),
              shelter: h.shelter || "Army Cantonment Ground",
              evac_hub: h.evac_hub || h.shelter || "Army Cantonment Ground",
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

          // Sort descending by calculated RPI
          mapped.sort((a, b) => b.calculatedRpi - a.calculatedRpi);
          mapped.forEach((item, i) => { item.rank = i + 1; });

          setHabitations(mapped);

          const redWards = mapped.filter(w => w.status === 'RED' || w.zone === 'RED' || w.hazard_tier === 'CRITICAL_RED');
          const orangeWards = mapped.filter(w => w.status === 'ORANGE' || w.status === 'AMBER' || w.zone === 'ORANGE' || w.zone === 'AMBER' || w.hazard_tier === 'WARNING_AMBER');
          const atRiskWards = mapped.filter(w => w.status === 'RED' || w.status === 'ORANGE' || w.status === 'AMBER' || w.zone === 'RED' || w.zone === 'ORANGE' || w.zone === 'AMBER');
          const redCount = redWards.length;
          const orangeCount = orangeWards.length;
          const greenCount = mapped.filter(w => w.status === 'GREEN' || w.zone === 'GREEN' || w.hazard_tier === 'STABLE_GREEN').length;
          const totalAtRisk = summary.totalAtRisk || json.total_at_risk_pop || atRiskWards.reduce((acc, w) => acc + (w.population || w.civilians || 0), 0);
          const maxOverburden = summary.maxOverburden || `${(json.telemetry?.peak_overburden || Math.max(...mapped.map(w => w.overburden || 1.0))).toFixed(2)}x`;

          setKpiData({
            redZones: summary.redZones || `${redCount} Sectors`,
            redZoneCount: redCount,
            orangeZoneCount: orangeCount,
            greenZoneCount: greenCount,
            atRiskPopulation: summary.atRiskPopulation || (totalAtRisk ? totalAtRisk.toLocaleString('en-IN') : "0"),
            totalAtRisk: totalAtRisk,
            maxOverburden: typeof maxOverburden === 'string' ? maxOverburden : `${maxOverburden}x`,
            peakPorePressureKpa: summary.peakPorePressureKpa || (json.telemetry?.pore_pressure_kpa || (14.5 + (rainfall / 180.0) * 36.2)).toFixed(1),
            rainfallStatus: rainfall < 60 ? '<60mm: Normal Precipitation' : (rainfall <= 140 ? '60-140mm: High Saturation Risk' : '>140mm: Critical Cloudburst Trigger')
          });
        } else {
          // Graceful fallback
          const fallback = calculateLocalFallback(rainfall);
          setHabitations(fallback.habitations);
          setCamps(fallback.camps);
          setEvacuationCorridors(fallback.evacuation_corridors);
          setKpiData(fallback.kpiData);
          setTelemetry(fallback.telemetry);
        }
      } catch (err) {
        // Graceful resilient fallback on network error
        const fallback = calculateLocalFallback(rainfall);
        setHabitations(fallback.habitations);
        setCamps(fallback.camps);
        setEvacuationCorridors(fallback.evacuation_corridors);
        setKpiData(fallback.kpiData);
        setTelemetry(fallback.telemetry);
      } finally {
        setIsDataLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [rainfall]);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Top RPI Overburden average
  const avgOverburden = habitations.length > 0 
    ? (habitations.reduce((acc, w) => acc + (w.overburden || w.overburden_ratio || 1.0), 0) / habitations.length).toFixed(2)
    : "1.33";

  const progressPercent = Math.min(100, Math.max(10, (Number(avgOverburden) / 2.0) * 100));

  // Dynamic Hazard Pill styling
  const getHazardPill = () => {
    if (rainfall < 60) {
      return {
        text: '<60mm: Normal Precipitation',
        className: 'text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-300'
      };
    } else if (rainfall <= 140) {
      return {
        text: '60-140mm: High Saturation Risk',
        className: 'text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap bg-amber-100 text-amber-900 border border-amber-300'
      };
    } else {
      return {
        text: '>140mm: Critical Cloudburst Trigger',
        className: 'text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap bg-red-600 text-white border border-red-700 animate-pulse'
      };
    }
  };

  const hazardPill = getHazardPill();

  const handleSendCopilot = async (textToSend) => {
    const text = textToSend || copilotInput;
    if (!text.trim()) return;

    const newMsg = { sender: 'user', text };
    setCopilotMessages(prev => [...prev, newMsg]);
    setCopilotInput('');
    setIsCopilotLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, current_rainfall: rainfall })
      });

      if (res.ok) {
        const json = await res.json();
        setCopilotMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            title: 'MHA Tactical Intelligence Advisory:', 
            text: json.reply 
          }
        ]);
        setIsCopilotLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      let replyTitle = 'Geotechnical Analysis:';
      let replyText = '';
      const lower = text.toLowerCase();

      if (lower.includes('immediate') || lower.includes('ward') || lower.includes('evacuat')) {
        replyTitle = 'Immediate Relocation Priority:';
        replyText = `Upper Sunil (Rank #1, RPI ${habitations[0]?.calculatedRpi || 85}) and Manohar Bagh have exceeded critical shear thresholds. ${kpiData?.redZones || '2 Sectors'} require immediate bus transit dispatch to Sector Helipad and GIC Ground.`;
      } else if (lower.includes('fleet') || lower.includes('bus')) {
        replyTitle = 'Evacuation Fleet Status:';
        replyText = '18 State Transit Buses pre-staged at Marwari Bypass. 4 Platoons (NDRF 8th Bn) equipped with hydraulic cutters & stretcher units on standby. NH-7 green corridor open.';
      } else {
        replyTitle = 'Geotechnical Carrying Capacity Assessment:';
        replyText = `Active peak overburden multiplier is ${kpiData?.maxOverburden || '1.89x'}. Monitored pore pressure at ${(36 + rainfall * 0.205).toFixed(1)} kPa indicates saturated colluvium requiring strict evacuation triggers.`;
      }

      setCopilotMessages(prev => [...prev, { sender: 'bot', title: replyTitle, text: replyText }]);
      setIsCopilotLoading(false);
    }, 400);
  };

  const handleConfirmDispatch = async () => {
    setIsDispatching(true);
    try {
      const topWard = habitations.find(h => h.status === 'CRITICAL' || h.zone === 'RED') || habitations[0];
      const evacCount = kpiData?.totalAtRisk || 858;

      const res = await fetch('http://localhost:8000/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: topWard?.name || 'Sector 04 High-Risk Habitations',
          evac_count: evacCount
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchToastMsg(`OFFICIAL MHA DIRECTIVE DISPATCHED (${data.dispatch_id}): Sirens active (${data.siren_frequency_hz || 520} Hz). ${data.sms_sent} citizens notified via CAP broadcast.`);
      } else {
        setDispatchToastMsg('OFFICIAL MHA CIVIL DIRECTIVE DISPATCHED: Sirens and Cell Broadcast CAP alerts initiated for Sector Joshimath.');
      }
    } catch (e) {
      setDispatchToastMsg('OFFICIAL MHA CIVIL DIRECTIVE DISPATCHED: Sirens and Cell Broadcast CAP alerts initiated for Sector Joshimath.');
    } finally {
      setIsDispatching(false);
      setIsEvacModalOpen(false);
      setShowDispatchToast(true);
      setTimeout(() => setShowDispatchToast(false), 5000);
    }
  };

  const handleRecenter = () => {
    setSelectedWard({ lat: 30.556, lon: 79.566, id: 'center' });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 select-none">
      {/* ================= 1. LIGHT ADMINISTRATIVE 3-ZONE HEADER ================= */}
      {/* ================= TIER 1: MAIN AUTHORITY & NATIONAL BRANDING BAR ================= */}
      <header className="h-16 bg-[#f8fafc] border-b border-slate-300 px-5 flex items-center justify-between shadow-xs z-30 select-none">
        {/* Left Section: AABHAS Brand & Identity Hierarchy */}
        <div className="flex items-center gap-3.5">
          {/* Bespoke AABHAS Tactical Crest */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-slate-900 to-[#0b192c] border border-amber-500/40 p-1 flex items-center justify-center shadow-sm flex-shrink-0 relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Hexagonal Radar Grid */}
              <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.65" strokeDasharray="6 3"/>
              {/* Topographic Contour Rings */}
              <path d="M18 68 Q50 38 82 68" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M28 54 Q50 30 72 54" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Central Subsidence Focal Core */}
              <circle cx="50" cy="42" r="5" fill="#ef4444" />
              <circle cx="50" cy="42" r="12" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7" className="animate-ping" />
            </svg>
          </div>

          {/* Typography Stack */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-slate-900 font-sans">AABHAS</span>
              <span className="text-xs font-bold text-amber-700 font-sans">(आभास)</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                SIH26191
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-600 leading-tight">
              Adaptive Analytics for Base Hazard Assessment &amp; Subsidence — Joshimath Operations
            </p>
          </div>
        </div>

        {/* Right Section: Official State Emblem + Formal Bilateral MHA Lockup + Tiranga */}
        <div className="flex items-center gap-3.5">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-bold text-slate-900 leading-tight">
              Ministry of Home Affairs (MHA) | Govt of India
            </div>
            <div className="text-[10px] font-medium text-slate-600 leading-tight mt-0.5">
              Disaster Management Division (NDRF Operations Wing)
            </div>
          </div>

          {/* Official State Emblem of India (Ashoka Lion Capital with Satyameva Jayate) */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="State Emblem of India" 
            className="h-12 w-auto object-contain flex-shrink-0" 
          />

          <div className="h-8 w-px bg-slate-300 mx-0.5 hidden sm:block"></div>

          {/* Official Indian National Flag (Tiranga) */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" 
            alt="National Flag of India" 
            className="h-7 w-auto object-contain rounded-xs border border-slate-300 shadow-2xs flex-shrink-0" 
          />
        </div>
      </header>

      {/* ================= TIER 2: TACTICAL OPERATIONS SUB-BAR ================= */}
      <div className="bg-slate-100 border-b border-slate-300 px-5 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0 text-xs shadow-xs z-20">
        {/* Left Side: ISRO / DInSAR Downlink & Geodetic Quadrant Coordinates */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Sector Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-900 text-white font-bold tracking-wide text-[11px] shadow-2xs">
            <MapPin className="w-3 h-3 mr-1 text-amber-400" />
            SECTOR: JOSHIMATH QUADRANT
          </span>

          {/* Geodetic Coordinates */}
          <span className="hidden xl:inline text-[11px] text-slate-600 font-mono-data font-semibold">
            (CHAMOLI, UK | 30.556° N, 79.566° E)
          </span>

          {/* Real-time ISRO / DInSAR Downlink Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-300 text-[10px] font-mono font-bold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ISRO/DInSAR DOWNLINK: ACTIVE (100%)</span>
          </div>

          {/* Dynamic Hazard Status Pill */}
          <span className={hazardPill.className} id="hazard-pill">
            {hazardPill.text}
          </span>

          {/* Live Telemetry Metrics */}
          <div className="hidden 2xl:flex items-center gap-2 font-mono-data text-[11px] text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded">
            <span className="text-slate-500 font-medium">Real-time Telemetry:</span>
            <span className="font-bold text-amber-700">Subsidence: {telemetry.shear_strain_mm_day || (0.8 + (rainfall / 180.0) * 3.4).toFixed(1)} mm/day</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-800">Pore Pressure: {telemetry.pore_pressure_kpa || (14.5 + (rainfall / 180.0) * 36.2).toFixed(1)} kPa</span>
          </div>
        </div>

        {/* Right Side: Single 24h Rainfall Simulator & NDRF AI Copilot Drawer Trigger */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Compact, High-Contrast Rainfall Readout Box */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-300 rounded-md px-3 py-1 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700 whitespace-nowrap flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-600" />
              Simulated Rain (24h):
            </span>
            <input
              type="range"
              min="0"
              max="180"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-28 md:w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              id="precip-slider"
            />
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
              rainfall > 100 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : rainfall > 50 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`} id="precip-val-display">
              {rainfall} mm
            </span>
          </div>

          {/* NDRF Tactical AI Copilot Drawer Trigger */}
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className="bg-[#0b192c] hover:bg-[#1e3e62] text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            title="Open NDRF AI Copilot Tactical Drawer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NDRF Tactical Copilot</span>
          </button>
        </div>
      </div>

      {/* ================= MULTI-PAGE NAVIGATION BAR (Height ~48px) ================= */}
      <nav className="h-12 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 flex-shrink-0 z-10 shadow-xs">
        {/* Left: 4 Interactive Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 h-full overflow-x-auto no-scrollbar" id="nav-tabs">
          {/* Tab 1: GIS */}
          <button
            onClick={() => setActiveTab('gis')}
            className={`nav-tab h-full px-3.5 flex items-center gap-2 border-b-2 font-bold text-xs tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'gis' || activeTab === 'map'
                ? 'active-tab border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-blue-900'
            }`}
          >
            <MapIcon className="w-4 h-4 text-blue-900" />
            <span>Live Command GIS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* Tab 2: Fleet */}
          <button
            onClick={() => setActiveTab('fleet')}
            className={`nav-tab h-full px-3.5 flex items-center gap-2 border-b-2 font-medium text-xs tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'fleet' || activeTab === 'transit'
                ? 'active-tab border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-blue-900'
            }`}
          >
            <Truck className="w-4 h-4 text-slate-500" />
            <span>Evacuation Fleet &amp; Transit</span>
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono-data font-semibold">18 Veh</span>
          </button>

          {/* Tab 3: Camp Logistics */}
          <button
            onClick={() => setActiveTab('camps')}
            className={`nav-tab h-full px-3.5 flex items-center gap-2 border-b-2 font-medium text-xs tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'camps' || activeTab === 'shelters'
                ? 'active-tab border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-blue-900'
            }`}
          >
            <Tent className="w-4 h-4 text-slate-500" />
            <span>Relief Camp Logistics</span>
            <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.2 rounded-full font-mono-data font-semibold">4 Camps</span>
          </button>

          {/* Tab 4: SMS Broadcast */}
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`nav-tab h-full px-3.5 flex items-center gap-2 border-b-2 font-medium text-xs tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'broadcast'
                ? 'active-tab border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-blue-900'
            }`}
          >
            <Radio className="w-4 h-4 text-slate-500" />
            <span>Citizen SMS Broadcast</span>
            <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.2 rounded-full font-mono-data font-semibold">12,400 Q</span>
          </button>
        </div>

        {/* Right Utility Group: Evacuation Directive Button & PDF Export */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setIsEvacModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-all shadow border border-red-700 uppercase tracking-wider cursor-pointer"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span className="hidden md:inline">INITIATE EVACUATION DIRECTIVE</span>
            <span className="md:hidden">EVACUATE</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-all shadow-sm border border-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">EXPORT BRIEF (PDF)</span>
          </button>
        </div>
      </nav>

      {/* Toast Notification */}
      {showDispatchToast && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-red-500/80 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 max-w-md">
          <Siren className="w-5 h-5 text-red-400 animate-bounce flex-shrink-0" />
          <div className="text-xs font-semibold">{dispatchToastMsg}</div>
        </div>
      )}

      {/* ================= 4. MAIN CONTENT VIEWPORT (Conditional by activeTab) ================= */}
      {(activeTab === 'gis' || activeTab === 'map') && (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* ----------------- A. LEFT PANEL (320px): Terrain & Structural Load ----------------- */}
          <aside className="w-full md:w-[320px] bg-white border-r border-slate-200 p-3.5 overflow-y-auto flex-shrink-0 flex flex-col gap-3.5 shadow-xs" id="panel-left">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-900" />
                TERRAIN &amp; STRUCTURAL LOAD ANALYSIS
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated Multi-Hazard Geotechnical Ingress</p>
            </div>

            {/* 4 High-Authority KPI Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: Habitations */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Monitored Sectors</div>
                <div className="text-xl font-black text-slate-900 font-mono-data mt-0.5">6 Zones</div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> 5,180 Verified Residents
                </div>
              </div>

              {/* Card 2: Red Zones (Dynamic from hook) */}
              <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-200">
                <div className="text-[10px] uppercase font-bold text-red-700 tracking-wider">Red Zones Declared</div>
                <div className="text-xl font-black text-red-600 font-mono-data mt-0.5" id="kpi-red-zones">
                  {kpiData?.redZones || "2 Sectors"}
                </div>
                <div className="text-[10px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" /> High Subsidence Rate
                </div>
              </div>

              {/* Card 3: At-Risk Pop (Dynamic from hook) */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">At-Risk Citizens</div>
                <div className="text-xl font-black text-slate-900 font-mono-data mt-0.5" id="kpi-at-risk-pop">
                  {kpiData?.atRiskPopulation || "1,670"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  Red &amp; Amber Sectors (of 5,180)
                </div>
              </div>

              {/* Card 4: Peak Overburden (Dynamic from hook) */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peak Overburden</div>
                <div className="text-xl font-black text-amber-700 font-mono-data mt-0.5" id="kpi-max-overburden">
                  {telemetry.peak_overburden ? `${telemetry.peak_overburden}x` : (kpiData?.maxOverburden || "1.39x")}
                </div>
                <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" /> Exceeds Safety Margin
                </div>
              </div>
            </div>

            {/* Geotechnical Carrying Capacity Diagnostics Card */}
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-900" />
                  Geotechnical Carrying Capacity
                </span>
                <span className="text-xs font-mono-data font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded" id="capacity-multiplier">
                  {telemetry.peak_overburden ? `${telemetry.peak_overburden}x` : `${avgOverburden}x`} Threshold
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Safe Structural Threshold vs Existing Built Density under current precipitation stress factor.
              </p>
              {/* Dynamic Multi-Tier Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    (telemetry.peak_overburden || Number(avgOverburden)) < 1.3 ? 'bg-emerald-500' : ((telemetry.peak_overburden || Number(avgOverburden)) <= 1.6 ? 'bg-amber-500' : 'bg-red-600')
                  }`}
                  id="capacity-progress" 
                  style={{ width: `${Math.min(100, Math.max(10, ((telemetry.peak_overburden || Number(avgOverburden)) / 2.0) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono-data text-slate-500">
                <span>0.5x (Safe)</span>
                <span className="font-bold text-slate-800">1.0x (Limit)</span>
                <span>2.0x (Critical)</span>
              </div>
              {/* Sensor Diagnostics */}
              <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="text-slate-500">Pore Pressure:</div>
                <div className="font-mono-data font-bold text-slate-800 text-right" id="pore-pressure-val">
                  {telemetry.pore_pressure_kpa !== undefined ? `${telemetry.pore_pressure_kpa} kPa` : `${(14.5 + (rainfall / 180.0) * 36.2).toFixed(1)} kPa`}
                </div>
                <div className="text-slate-500">Shear Strain:</div>
                <div className="font-mono-data font-bold text-amber-700 text-right" id="shear-strain-val">
                  {telemetry.shear_strain_mm_day !== undefined ? `${telemetry.shear_strain_mm_day} mm/day` : `${(0.8 + (rainfall / 180.0) * 3.4).toFixed(1)} mm/day`}
                </div>
                <div className="text-slate-500">Aquifer Saturation:</div>
                <div className="font-mono-data font-bold text-slate-800 text-right" id="aquifer-val">
                  {telemetry.aquifer_saturation_pct !== undefined ? `${telemetry.aquifer_saturation_pct}%` : `${Math.min(99, Math.round(22 + (rainfall / 180.0) * 73))}%`}
                </div>
              </div>
            </div>

            {/* NDRF SOP Protocol Note Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 text-[11px] text-blue-900 leading-snug">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-950">
                <Info className="w-3.5 h-3.5 text-blue-700" />
                NDRF SOPS ACTIVE (CODE 42-A)
              </div>
              Pre-position 3x Quick Response Teams at Sector Helipad. Maintain continuous satellite InSAR telemetry feed with ISRO-NRSC.
            </div>
          </aside>

          {/* ----------------- B. CENTER PANEL: Tactical GIS View ----------------- */}
          <section className="flex-1 h-full relative bg-slate-100 flex flex-col" id="panel-map">
            {/* Live Map Canvas bound to habitations, camps, and dynamic corridors */}
            <TacticalMap 
              habitations={habitations} 
              selectedWard={selectedWard} 
              onSelectWard={(ward) => setSelectedWard(ward)} 
              rainfall={rainfall}
              camps={camps}
              evacuationCorridors={evacuationCorridors}
            />

            {/* Floating Map Header Pill */}
            <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 text-white backdrop-blur-xs border border-slate-700 px-3 py-1.5 rounded-md shadow-md flex items-center space-x-2.5 pointer-events-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100">LIVE SATELLITE GEODETIC GRID</span>
              <span className="text-[10px] text-amber-400 font-mono-data border-l border-slate-700 pl-2">ESRI WORLD IMAGERY HD</span>
            </div>

            {/* Floating Map Tools (Top Right) */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center space-x-1.5 pointer-events-auto">
              <button
                onClick={handleRecenter}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                id="btn-recenter" 
                title="Recenter Map View"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Center View</span>
              </button>
            </div>

            {/* Floating Tactical Hazard Classification Legend (Bottom Left) */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 p-3 rounded-lg shadow-md text-xs max-w-[240px] pointer-events-auto">
              <div className="font-bold text-slate-900 text-[11px] border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                <span>HAZARD CLASSIFICATION</span>
                <span className="text-[9px] font-mono-data text-slate-500">MHA-DM-2024</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-xs flex-shrink-0 animate-pulse" />
                  <span className="text-[11px] text-slate-700 font-medium">Red: Evacuation Alert (RPI &gt; 70)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white shadow-xs flex-shrink-0" />
                  <span className="text-[11px] text-slate-700 font-medium">Orange: Heightened Vigil (40-70)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shadow-xs flex-shrink-0" />
                  <span className="text-[11px] text-slate-700 font-medium">Green: Stable Baseline (&lt; 40)</span>
                </div>
              </div>
              <div className="mt-2 pt-1 border-t border-slate-200 text-[9px] text-slate-400">
                Click any ward marker to trigger detailed geotechnical diagnostics.
              </div>
            </div>
          </section>

          {/* ----------------- C. RIGHT PANEL (380px): Relocation Priority Index (RPI) ----------------- */}
          <aside className="w-full md:w-[380px] bg-white border-l border-slate-200 p-3.5 overflow-y-auto flex-shrink-0 flex flex-col shadow-xs" id="panel-right">
            <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-blue-900" />
                  RELOCATION PRIORITY INDEX (RPI)
                </h2>
                <p className="text-[11px] text-slate-500">Ranked by Geo-Instability &amp; Dwelling Risk</p>
              </div>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-mono-data font-bold px-2 py-0.5 rounded border border-slate-300">
                {habitations.length} WARDS
              </span>
            </div>

            {/* Triage Items Container */}
            <div className="space-y-2.5 flex-1" id="triage-list">
              {habitations.map((ward, index) => {
                const isRed = ward.status === 'CRITICAL' || ward.zone === 'RED';
                const isOrange = ward.status === 'MONITOR' || ward.zone === 'ORANGE';
                const borderColor = isRed ? 'border-red-300 bg-red-50/20' : (isOrange ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 bg-white');
                const badgeColor = isRed ? 'bg-red-600 text-white' : (isOrange ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white');

                return (
                  <div key={ward.id} className={`p-3 rounded-lg border ${borderColor} shadow-xs hover:shadow transition-all`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-mono-data font-bold">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {ward.name}
                            {isRed && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono-data">
                            RPI: <span className="font-bold text-slate-800">{ward.calculatedRpi ?? Math.round((ward.rpi_score || 0.5) * 100)}/100</span> | {ward.dwellings || ward.houses || ward.current_houses} Dwellings ({ward.cracked_units || 0} Red-Tagged)
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
                        {ward.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono-data">
                      <div>
                        <span className="text-slate-400 block text-[9px]">SLOPE</span>
                        <span className="font-bold text-slate-700">{ward.slope}°</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">OVERBURDEN</span>
                        <span className={`font-bold ${(ward.overburden || ward.overburden_ratio) > 1.0 ? 'text-red-600' : 'text-slate-700'}`}>{ward.overburden || ward.overburden_ratio}x</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">EVAC CUTOFF</span>
                        <span className="font-bold text-amber-700">{ward.evacCutoffRisk ?? Math.round((ward.cutoff_risk || 0.5) * 100)}%</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] text-slate-500 truncate max-w-[200px]" title={ward.shelter}>
                        <Shield className="w-3 h-3 inline text-slate-400 mr-1" />
                        {ward.shelter}
                      </span>
                      <button 
                        onClick={() => setSelectedWard(ward)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 rounded transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </main>
      )}

      {/* Tab 2: Evacuation Transit Fleet View */}
      {(activeTab === 'fleet' || activeTab === 'transit') && (
        <FleetView 
          habitations={habitations} 
          onInitiateEvac={() => setIsEvacModalOpen(true)} 
        />
      )}

      {/* Tab 3: Relief Camp Logistics View */}
      {(activeTab === 'camps' || activeTab === 'shelters') && (
        <SheltersView />
      )}

      {/* Tab 4: Citizen SMS Alert Terminal View */}
      {activeTab === 'broadcast' && (
        <BroadcastView 
          habitations={habitations} 
          rainfall={rainfall} 
          onTriggerDispatch={() => {
            setDispatchToastMsg('OFFICIAL CAP BROADCAST DISPATCHED: Telemetry and SMS queues triggered across 4 BTS towers.');
            setShowDispatchToast(true);
            setTimeout(() => setShowDispatchToast(false), 5000);
          }}
        />
      )}

      {/* ================= 5. NDRF AI COPILOT SLIDE-OVER DRAWER (420px) ================= */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isCopilotOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="copilot-drawer"
      >
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-blue-800 text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>NDRF AI Geotechnical Copilot</span>
                <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.2 rounded font-mono-data">v2.4-Gov</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono-data">MHA Sovereign Geo-LLM Active</div>
            </div>
          </div>
          <button 
            onClick={() => setIsCopilotOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer" 
            id="btn-close-copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
          <button 
            onClick={() => handleSendCopilot("Which ward needs immediate evacuation?")}
            className="copilot-chip text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            🚨 Which ward needs immediate evacuation?
          </button>
          <button 
            onClick={() => handleSendCopilot("Carrying Capacity analysis breakdown")}
            className="copilot-chip text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            📊 Carrying Capacity analysis breakdown
          </button>
          <button 
            onClick={() => handleSendCopilot("Print NDRF Evacuation SOP checklist")}
            className="copilot-chip text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            📋 Print NDRF Evacuation SOP checklist
          </button>
          <button 
            onClick={() => handleSendCopilot("Bus fleet mobilization status")}
            className="copilot-chip text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            🚌 Bus fleet mobilization status
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs text-slate-800" id="copilot-messages">
          {copilotMessages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  NDRF
                </div>
              )}
              <div className={`rounded-lg p-3 text-slate-800 space-y-2 max-w-[90%] ${
                msg.sender === 'user' ? 'bg-blue-900 text-white' : 'bg-slate-100 border border-slate-200'
              }`}>
                {msg.title && <div className="font-bold text-slate-900">{msg.title}</div>}
                <p className="text-[11px] leading-relaxed">{msg.text}</p>
                {msg.bullets && (
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                    {msg.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {isCopilotLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-900" />
              <span>Analyzing geotechnical telemetry &amp; SOP directives...</span>
            </div>
          )}
        </div>

        {/* Input Query Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input 
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
            className="flex-1 text-xs border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-800 font-sans" 
            id="copilot-input" 
            placeholder="Ask copilot about geotechnical telemetry or SOPs..." 
            type="text"
          />
          <button 
            onClick={() => handleSendCopilot()}
            className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer" 
            id="btn-copilot-send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= EVACUATION DIRECTIVE MODAL ================= */}
      {isEvacModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4" id="evacuation-modal">
          <div className="bg-white rounded-lg border-2 border-red-600 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-red-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-amber-300 animate-bounce" />
                <div>
                  <h3 className="text-sm font-black tracking-wide uppercase">DIRECTIVE AUTHORIZATION: IMMEDIATE EVACUATION</h3>
                  <p className="text-[10px] text-red-100 font-mono-data">MHA DISASTER MANAGEMENT CELL (SEC. 35/38 DM ACT 2005)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEvacModalOpen(false)}
                className="text-white hover:text-slate-200 p-1 cursor-pointer" 
                id="modal-close-x"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="font-bold text-red-900 text-sm mb-1 flex items-center gap-1.5">
                  <Siren className="w-4 h-4 text-red-600" />
                  TRIGGER CONDITIONS MET: HIGH SLOPE SLIPPAGE
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  The current simulated 24-hour precipitation stress has exceeded saturation thresholds in <span className="font-bold text-red-700" id="modal-red-count">{kpiData?.redZones || "2 Red-Zone Habitations"}</span>. Authorizing immediate civil dispatch protocol.
                </p>
              </div>

              {/* Dispatch Plan */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Command Operations Protocol:</div>
                <ul className="space-y-1 text-[11px] text-slate-600 pl-1">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>NDRF 8th Battalion:</strong> 4 platoons dispatched to Upper Sunil &amp; Manohar Bagh.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>State Highway 108:</strong> Joshimath-Badrinath arterial road closed to non-emergency vehicles.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Emergency Shelters:</strong> Gurudwara Camp &amp; Army Transit Base activated with 3,500 cot capacity.</span>
                  </li>
                </ul>
              </div>

              {/* SMS Broadcast Simulated Box */}
              <div className="bg-slate-100 p-2.5 rounded border border-slate-300 font-mono-data text-[10px] text-slate-800">
                <div className="text-slate-500 font-bold mb-1 flex items-center justify-between">
                  <span>CELL BROADCAST SYSTEM (SIMULATED SMS):</span>
                  <span className="text-emerald-600">TARGET: 14,200 IMSIs</span>
                </div>
                <p className="text-slate-900 bg-white p-2 rounded border border-slate-200">
                  [MHA EMERGENCY ALERT] Urgent: Subsidence sensors indicate critical ground displacement in Joshimath Upper Sunil/Singhdhar. Evacuate immediately via designated North Trail to Gurudwara Relief Camp. Helpline: 1070 / 1077.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => setIsEvacModalOpen(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded cursor-pointer" 
                id="modal-btn-cancel"
              >
                Standby / Cancel
              </button>
              <button 
                onClick={handleConfirmDispatch}
                disabled={isDispatching}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded shadow flex items-center gap-1 cursor-pointer transition-all" 
                id="modal-btn-confirm"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AUTHORIZING DISPATCH...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>EXECUTE OFFICIAL BROADCAST</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HIDDEN PRINT REPORT SECTION FOR PDF EXPORT ================= */}
      <div className="hidden" id="print-section">
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>GOVERNMENT OF INDIA | MINISTRY OF HOME AFFAIRS</h1>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: '#1e3a8a' }}>NATIONAL DISASTER RESPONSE FORCE (NDRF) - CRISIS MANAGEMENT CELL</h2>
          <p style={{ fontSize: '11px', margin: 0, color: '#475569' }}>OFFICIAL DISASTER SITUATION MANIFEST &amp; GEOTECHNICAL RISK LOG (SIH-26191)</p>
          <p style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'monospace' }}>Generated at: {new Date().toLocaleString()} | Region: Joshimath, District Chamoli, Uttarakhand</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>1. SYNOPTIC EXECUTIVE SUMMARY</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '6px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc', width: '25%' }}>Simulated 24h Precipitation:</td>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1' }}>{rainfall} mm</td>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc', width: '25%' }}>Total Monitored Habitations:</td>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1' }}>6 Municipal Wards</td>
              </tr>
              <tr>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>Critical Red Zones:</td>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1' }}>{kpiData?.redZones || "2 Sectors"}</td>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>Total At-Risk Population:</td>
                <td style={{ padding: '4px', border: '1px solid #cbd5e1' }}>{kpiData?.atRiskPopulation || "7,966"} Citizens</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>2. WARD RELOCATION PRIORITY INDEX (RPI) TRIAGE ROSTER</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '6px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#e2e8f0' }}>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Rank</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Ward Name</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Status</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>RPI Score</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Slope</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Overburden Ratio</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Dwellings</th>
                <th style={{ padding: '6px', border: '1px solid #94a3b8' }}>Designated Shelter</th>
              </tr>
            </thead>
            <tbody>
              {habitations.map((w, idx) => (
                <tr key={w.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold', textAlign: 'center' }}>#{idx + 1}</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{w.name}</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: w.status === 'CRITICAL' ? '#dc2626' : (w.status === 'MONITOR' ? '#d97706' : '#059669') }}>{w.status}</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{w.calculatedRpi}/100</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{w.slope}°</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{w.overburden}x</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{w.dwellings}</td>
                  <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{w.shelter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Field Operations Controller</p>
            <p style={{ margin: 0, color: '#64748b' }}>NDRF 8th Bn Disaster Response Command</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Directorate General</p>
            <p style={{ margin: 0, color: '#64748b' }}>Ministry of Home Affairs, New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  );
}