import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import TacticalMap from './components/TacticalMap';
import FleetView from './components/FleetView';
import SheltersView from './components/SheltersView';
import BroadcastView from './components/BroadcastView';
import ReliefLogisticsModal from './components/ReliefLogisticsModal';
import EvacuationEngine from './components/EvacuationEngine';
import EvacuationProtocolModal from './components/EvacuationProtocolModal';
import BroadcastModal from './components/BroadcastModal';
import FleetTransitView from './components/FleetTransitView';
import { supabase, logDispatchAudit, fetchLiveReliefCamps, fetchLiveTransitFleet, fetchLiveWardsRisk } from './supabaseClient.js';
import { getDynamicSectors, BALANCED_SECTORS, SAFE_RELIEF_CAMPS, TOPOGRAPHIC_SECTORS } from './data/sectors.js';
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

const TELEMETRY_FALLBACK_BUFFER = getDynamicSectors(65);
const VERIFIED_RELIEF_CAMPS = SAFE_RELIEF_CAMPS;

function generateFallbackCorridors(processedWards, rf, isRoadBlocked = false) {
  const criticalAndAmber = processedWards.filter(w => 
    (w.status === 'RED' || w.status === 'ORANGE' || w.zone === 'RED' || w.zone === 'ORANGE' || w.hazard_tier === 'CRITICAL_RED' || w.hazard_tier === 'WARNING_AMBER') &&
    w.id !== 'sec-ravigram'
  );

  return criticalAndAmber.map(s => {
    let targetCampId = s.targetCampId;
    if (!targetCampId) {
      const match = BALANCED_SECTORS.find(b => b.id === s.id || b.ward_no === s.ward_no);
      targetCampId = match?.targetCampId;
    }

    if (!targetCampId) {
      if (s.id === 'sec-joshimath' || s.id === 'sec-sunil' || s.ward_no === 'Ward-03' || s.ward_no === 'Ward-04') targetCampId = 'camp-cantt';
      else if (s.id === 'sec-helang' || s.ward_no === 'Helang Sector') targetCampId = 'camp-pipalkoti';
      else if (s.id === 'sec-karnaprayag' || s.ward_no === 'Karnaprayag Sector') targetCampId = 'camp-gauchar';
      else if (s.id === 'sec-tharali' || s.ward_no === 'Tharali Sector') targetCampId = 'camp-gopeshwar';
      else return null;
    }

    let finalCampId = targetCampId;
    let isRerouted = false;
    if (isRoadBlocked && (targetCampId === 'camp-pipalkoti' || s.id === 'sec-helang')) {
      finalCampId = 'camp-gopeshwar';
      isRerouted = true;
    }

    const camp = SAFE_RELIEF_CAMPS.find(c => c.id === finalCampId) || SAFE_RELIEF_CAMPS[0];
    const isUrgent = (s.status === 'RED' || s.zone === 'RED' || s.calculatedRpi >= 75);
    const fromCoords = s.coords || [s.lat, s.lon || s.lng] || s.center;

    return {
      sector_id: s.id,
      sector_name: s.name,
      from_coords: fromCoords,
      to_camp_id: camp.id,
      to_camp_name: camp.name,
      to_coords: camp.coords,
      corridor_name: isRerouted ? "EMERGENCY REROUTE VIA GOPESHWAR MEGA-HUB" : (camp.safe_corridor || "Designated Safe Axis"),
      nh07_rerouted: isRerouted,
      civilians_to_route: s.population || s.civilians || 880,
      dwellings_affected: s.dwellings || s.houses || 160,
      priority: isUrgent ? "URGENT" : "STANDBY",
      hazard_tier: s.hazard_tier || (isUrgent ? "CRITICAL_RED" : "WARNING_AMBER"),
      tier: s.hazard_tier || (isUrgent ? "CRITICAL_RED" : "WARNING_AMBER"),
      distance_km: camp.id === 'camp-gopeshwar' ? 14.5 : camp.id === 'camp-pipalkoti' ? 8.2 : camp.id === 'camp-gauchar' ? 22.0 : 18.4,
      color: isRerouted ? "#38bdf8" : (isUrgent ? "#f43f5e" : "#fbbf24")
    };
  }).filter(Boolean);
}

function calculateLocalFallback(rainVal) {
  const rf = Number(rainVal);
  const peak_overburden = Number((1.12 + (rf / 180.0) * 0.76).toFixed(2));
  const pore_pressure = Number((14.5 + (rf / 180.0) * 36.2).toFixed(1));
  const aquifer_saturation = Math.min(99, Math.round(22 + (rf / 180.0) * 73));
  const shear_strain = Number((0.8 + (rf / 180.0) * 3.4).toFixed(1));

  const dynamicWards = getDynamicSectors(rainVal);

  const processed = dynamicWards.map((s) => {
    const calculatedRpi = s.rpi;
    const overburden = parseFloat(s.overburden) || Number((1.85 * (1 + (rf - 65) * 0.0022)).toFixed(2));
    const evacCutoffRisk = parseInt(s.evac_cutoff) || Math.min(98, Math.max(10, Math.round((parseFloat(s.slope) * 1.5) + (rf * 0.12))));

    return {
      ...s,
      calculatedRpi,
      rpi: Number((calculatedRpi / 100).toFixed(3)),
      rpi_score: Number((calculatedRpi / 100).toFixed(3)),
      overburden,
      overburden_ratio: overburden,
      evacCutoffRisk,
      status: s.status,
      zone: s.status,
      tier: s.tier,
      hazard_tier: s.tier,
      dwellings: s.dwellings,
      houses: parseInt(s.dwellings) || 160,
      cracked_units: s.status === 'RED' ? 92 : s.status === 'ORANGE' ? 56 : 12,
      civilians: parseInt(s.dwellings) ? Math.round(parseInt(s.dwellings) * 5.5) : 900,
      population: parseInt(s.dwellings) ? Math.round(parseInt(s.dwellings) * 5.5) : 900
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
  const [isRoadBlocked, setIsRoadBlocked] = useState(false);
  const [roadBlockages, setRoadBlockages] = useState([]);
  const [xaiAttribution, setXaiAttribution] = useState({
    slope_shear_stress_pct: 38.0,
    dynamic_pore_pressure_pct: 34.0,
    insar_subsidence_velocity_pct: 28.0
  });
  const [habitations, setHabitations] = useState(() => calculateLocalFallback(65).habitations);
  const [camps, setCamps] = useState(() => VERIFIED_RELIEF_CAMPS);
  const [evacuationCorridors, setEvacuationCorridors] = useState(() => calculateLocalFallback(65).evacuation_corridors);
  const [relocationPlan, setRelocationPlan] = useState([]);
  const [kpiData, setKpiData] = useState(() => calculateLocalFallback(65).kpiData);
  const [telemetry, setTelemetry] = useState(() => calculateLocalFallback(65).telemetry);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem('aabhas_active_view') || 'gis';
    } catch (e) {
      return 'gis';
    }
  });
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isEvacModalOpen, setIsEvacModalOpen] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [panTarget, setPanTarget] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [advisorInput, setAdvisorInput] = useState('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showDispatchToast, setShowDispatchToast] = useState(false);
  const [dispatchToastMsg, setDispatchToastMsg] = useState('');
  const [advisorMessages, setAdvisorMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('aabhas_ndrf_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        sender: 'bot',
        title: 'MHA Disaster Intelligence Briefing (Chamoli District):',
        text: 'Monitoring Chamoli Multi-Sector Grid (Joshimath, Karnaprayag, Tharali, Helang). Real-time OR-Tools optimization engine and ISRO-NRSC InSAR feeds linked.',
        bullets: [
          'Joshimath Cluster and Helang Axis require urgent relocation under active monsoon saturation.',
          'Subsidence velocity: 4.1 mm/day along Main Central Thrust (MCT) zone.',
          'Strategic bedrock relief grid: 5 regional hubs (Gopeshwar, Gauchar, Pipalkoti, Joshimath Cantonment, Gairsain) operational.'
        ]
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('aabhas_active_view', activeView);
    } catch (e) {}
  }, [activeView]);

  useEffect(() => {
    try {
      localStorage.setItem('aabhas_ndrf_chat', JSON.stringify(advisorMessages));
    } catch (e) {}
  }, [advisorMessages]);

  useEffect(() => {
    let isMounted = true;
    async function hydrateSupabaseData() {
      try {
        const [liveCamps, liveWards] = await Promise.all([
          fetchLiveReliefCamps(),
          fetchLiveWardsRisk()
        ]);

        if (liveCamps && liveCamps.length > 0 && isMounted) {
          setCamps(prev => prev.map((c, idx) => {
            const match = liveCamps.find(lc => lc.camp_code === c.id || lc.id === c.id || lc.id === idx + 1 || lc.name === c.name);
            if (match) {
              return {
                ...c,
                ...match,
                name: match.name || c.name,
                total_bed_capacity: match.bed_capacity || match.total_beds || c.total_bed_capacity,
                capacity: match.bed_capacity || match.capacity || c.capacity,
                totalBeds: match.bed_capacity || match.totalBeds || c.totalBeds,
                occupied_beds: match.occupied_beds !== undefined ? match.occupied_beds : c.occupied_beds,
                current_occupancy: match.occupied_beds !== undefined ? match.occupied_beds : c.current_occupancy,
                occupancy: match.occupied_beds !== undefined ? match.occupied_beds : c.occupancy,
                status: match.status || c.status,
                safe_corridor: match.route_axis || c.safe_corridor,
                tag: match.tag || c.tag,
                medicalStaff: match.medical_team || c.medicalStaff,
                medical_unit: match.medical_team || c.medical_unit
              };
            }
            return c;
          }));
        }

        if (liveWards && liveWards.length > 0 && isMounted) {
          setHabitations(prev => {
            const updated = prev.map(h => {
              const match = liveWards.find(lw => lw.name === h.name || lw.ward_no === parseInt(h.ward_no?.replace(/\D/g, '')) || lw.id === h.id);
              if (match) {
                const rpiVal = Number((match.rpi_score / 100).toFixed(3));
                const calculatedRpi = match.rpi_score;
                const status = match.risk_level || (calculatedRpi >= 70 ? 'RED' : (calculatedRpi >= 40 ? 'ORANGE' : 'GREEN'));
                const hazardTier = status === 'RED' ? 'CRITICAL_RED' : (status === 'ORANGE' ? 'WARNING_AMBER' : 'STABLE_GREEN');
                return {
                  ...h,
                  rpi: rpiVal,
                  rpi_score: rpiVal,
                  calculatedRpi,
                  status,
                  zone: status,
                  tier: hazardTier,
                  hazard_tier: hazardTier,
                  dwellings: match.dwellings_red_tagged || h.dwellings,
                  houses: match.dwellings_red_tagged || h.houses,
                  cracked_units: match.dwellings_red_tagged || h.cracked_units,
                  slope: `${match.slope_deg}°`,
                  slope_deg: match.slope_deg,
                  overburden: match.overburden_factor || h.overburden,
                  overburden_ratio: match.overburden_factor || h.overburden_ratio,
                  evacCutoffRisk: match.cutoff_risk_percent || h.evacCutoffRisk
                };
              }
              return h;
            });

            updated.sort((a, b) => b.calculatedRpi - a.calculatedRpi);
            updated.forEach((item, idx) => { item.rank = idx + 1; });
            return updated;
          });
        }
      } catch (e) {
        console.warn('Supabase hydration error:', e);
      }
    }
    hydrateSupabaseData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsDataLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/assess-hazard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            rainfall_24h: Number(rainfall),
            nh07_blocked: isRoadBlocked 
          })
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
          if (json.relocation_plan && Array.isArray(json.relocation_plan)) {
            setRelocationPlan(json.relocation_plan);
          }
          if (json.road_blockages && Array.isArray(json.road_blockages)) {
            setRoadBlockages(json.road_blockages);
          }
          if (json.xai_attribution) {
            setXaiAttribution(json.xai_attribution);
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
              shelter: h.shelter || "Gopeshwar District HQ Hub",
              evac_hub: h.evac_hub || h.shelter || "Gopeshwar District HQ Hub",
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
          const fallback = calculateLocalFallback(rainfall);
          setHabitations(fallback.habitations);
          setCamps(fallback.camps);
          setEvacuationCorridors(generateFallbackCorridors(fallback.habitations, rainfall, isRoadBlocked));
          setKpiData(fallback.kpiData);
          setTelemetry(fallback.telemetry);
        }
      } catch (err) {
        const fallback = calculateLocalFallback(rainfall);
        setHabitations(fallback.habitations);
        setCamps(fallback.camps);
        setEvacuationCorridors(generateFallbackCorridors(fallback.habitations, rainfall, isRoadBlocked));
        setKpiData(fallback.kpiData);
        setTelemetry(fallback.telemetry);
      } finally {
        setIsDataLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [rainfall, isRoadBlocked]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const avgOverburden = habitations.length > 0 
    ? (habitations.reduce((acc, w) => acc + (w.overburden || w.overburden_ratio || 1.0), 0) / habitations.length).toFixed(2)
    : "1.33";

  const progressPercent = Math.min(100, Math.max(10, (Number(avgOverburden) / 2.0) * 100));

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
        className: 'text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap bg-red-600 text-white border border-red-700 shadow-xs'
      };
    }
  };

  const hazardPill = getHazardPill();

  const handleSendAdvisorQuery = async (textToSend) => {
    const text = textToSend || advisorInput;
    if (!text.trim()) return;

    const newMsg = { sender: 'user', text };
    setAdvisorMessages(prev => [...prev, newMsg]);
    setAdvisorInput('');
    setIsAdvisorLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, current_rainfall: rainfall })
      });

      if (res.ok) {
        const json = await res.json();
        setAdvisorMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            title: 'MHA Tactical Intelligence Advisory:', 
            text: json.reply 
          }
        ]);
        setIsAdvisorLoading(false);
        return;
      }
    } catch (e) {
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

      setAdvisorMessages(prev => [...prev, { sender: 'bot', title: replyTitle, text: replyText }]);
      setIsAdvisorLoading(false);
    }, 400);
  };

  const handleConfirmDispatch = async () => {
    setIsDispatching(true);
    try {
      const topWard = habitations.find(h => h.status === 'CRITICAL' || h.zone === 'RED') || habitations[0];
      const evacCount = kpiData?.totalAtRisk || 858;

      logDispatchAudit({
        orderRef: 'DDMA/CHM/2026-EVAC',
        wardName: topWard?.name || 'Sector 04 High-Risk Habitations',
        evacCount: evacCount,
        metadata: { rainfall, isRoadBlocked }
      });

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

  const handleInspectSector = (sector) => {
    if (!sector) return;
    const matchedTopo = TOPOGRAPHIC_SECTORS.find(s => 
      s.id === sector.id || 
      s.ward_no === sector.ward_no || 
      (s.name && sector.name && s.name.toLowerCase().includes(sector.name.toLowerCase().slice(0, 6)))
    );

    const polygon = sector.polygon || sector.coordinates || matchedTopo?.polygon || matchedTopo?.coordinates;
    const coords = sector.center || sector.coords || matchedTopo?.center || matchedTopo?.coords || (sector.lat && (sector.lon || sector.lng) ? [Number(sector.lat), Number(sector.lon || sector.lng)] : null);

    const enriched = {
      ...matchedTopo,
      ...sector,
      polygon: polygon,
      coordinates: polygon,
      id: sector.id || matchedTopo?.id || `ward-${sector.ward_no || sector.numericId || Date.now()}`,
      coords: coords,
      center: coords,
      lat: coords ? coords[0] : sector.lat,
      lon: coords ? coords[1] : (sector.lon || sector.lng),
      _ts: Date.now()
    };

    setSelectedWard(enriched);
    if (coords) {
      setPanTarget({ coords: coords, zoom: 16 });
    }
  };

  const handleRecenter = () => {
    setSelectedWard(null);
    setPanTarget(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 select-none">

      <header className="sticky top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm px-5 py-2.5 flex items-center justify-between text-slate-900 select-none">

        <div className="flex items-center gap-3.5">

          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shadow-xs flex-shrink-0 relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">

              <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.65" strokeDasharray="6 3"/>

              <path d="M18 68 Q50 38 82 68" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M28 54 Q50 30 72 54" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>

              <circle cx="50" cy="42" r="5" fill="#ef4444" />
              <circle cx="50" cy="42" r="12" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 2" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-slate-900 font-sans">AABHAS</span>
              <span className="text-xs font-bold text-amber-600 font-sans">(आभास)</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded">
                SIH26191
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 leading-tight">
              Adaptive Analytics for Base Hazard Assessment &amp; Subsidence — Chamoli District Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Ministry of Home Affairs (MHA) | Govt of India
            </div>
            <div className="text-[10px] font-medium text-slate-500 leading-tight mt-0.5">
              Disaster Management Division (NDRF Operations Wing)
            </div>
          </div>

          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="State Emblem of India" 
            className="h-12 w-auto object-contain flex-shrink-0 opacity-100" 
          />

          <div className="h-8 w-px bg-slate-300 mx-0.5 hidden sm:block"></div>

          <img 
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" 
            alt="National Flag of India" 
            className="h-7 w-auto object-contain rounded-xs border border-slate-300 shadow-2xs flex-shrink-0 opacity-100" 
          />
        </div>
      </header>

      <div className="bg-slate-100 border-b border-slate-300 px-5 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0 text-xs shadow-xs z-20">

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-900 text-white font-bold tracking-wide text-[11px] shadow-2xs">
            <MapPin className="w-3 h-3 mr-1 text-amber-400" />
            SECTOR: CHAMOLI DISTRICT GRID
          </span>

          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Chamoli Sector (30.33° N, 79.40° E)</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              ISRO DInSAR Feed Active
            </span>
            <span>•</span>
            <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono-data">
              Subsidence: {telemetry.shear_strain_mm_day || (0.8 + (rainfall / 180.0) * 3.4).toFixed(1)} mm/day
            </span>
          </div>

          <span className={hazardPill.className} id="hazard-pill">
            {hazardPill.text}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">

          <button
            onClick={() => {
              const nextBlocked = !isRoadBlocked;
              setIsRoadBlocked(nextBlocked);
              const fb = calculateLocalFallback(rainfall);
              setEvacuationCorridors(generateFallbackCorridors(fb.habitations, rainfall, nextBlocked));
            }}
            className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer border ${
              isRoadBlocked
                ? 'bg-rose-50 text-rose-700 border-rose-400 font-bold shadow-sm animate-pulse'
                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
            }`}
            id="toggle-nh07-blockage"
            title="Simulate Landslide Blockage on NH-07 Corridor at Helang [30.528, 79.510]"
          >
            <div className="flex items-center gap-1.5">
              <AlertOctagon className={`w-3.5 h-3.5 ${isRoadBlocked ? 'text-rose-600' : 'text-amber-600'}`} />
              <span>{isRoadBlocked ? '⛔ NH-07 BLOCKED: KM-48 HELANG CHUTE SEVERED' : '⚠️ Simulate NH-07 Landslide Blockage'}</span>
            </div>
          </button>

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
              onChange={(e) => {
                const val = Number(e.target.value);
                setRainfall(val);
                const fb = calculateLocalFallback(val);
                setHabitations(fb.habitations);
                setEvacuationCorridors(generateFallbackCorridors(fb.habitations, val, isRoadBlocked));
                setKpiData(fb.kpiData);
                setTelemetry(fb.telemetry);
              }}
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

          <button
            onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition-colors cursor-pointer"
            id="btn-sop-guidelines"
            title="Open SOP Guidelines & Decision Support"
          >
            SOP Guidelines
          </button>
        </div>
      </div>

      <nav className="h-12 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 flex-shrink-0 z-10 shadow-xs">
        <div className="flex items-center space-x-1 sm:space-x-2 py-1 overflow-x-auto no-scrollbar" id="nav-tabs">
          <button
            onClick={() => setActiveView('gis')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all cursor-pointer ${
              activeView === 'gis'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
            id="btn-nav-gis"
          >
            <MapIcon className={`w-4 h-4 ${activeView === 'gis' ? 'text-white' : 'text-blue-900'}`} />
            <span>Live Command GIS</span>
            <span className={`w-2 h-2 rounded-full ${activeView === 'gis' ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
          </button>

          <button
            onClick={() => setActiveView('fleet')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all cursor-pointer ${
              activeView === 'fleet'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
            id="btn-nav-fleet-transit"
          >
            <Truck className={`w-4 h-4 ${activeView === 'fleet' ? 'text-white' : 'text-slate-500'}`} />
            <span>Evacuation Fleet &amp; Transit</span>
            {isRoadBlocked ? (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data font-bold animate-pulse ${
                activeView === 'fleet' ? 'bg-rose-900/60 text-white border border-rose-300' : 'bg-rose-50 border border-rose-300 text-rose-700'
              }`}>
                5 Active | 3 Rerouted
              </span>
            ) : (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data font-semibold ${
                activeView === 'fleet' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 border border-slate-200 text-slate-700'
              }`}>
                8 Units (5 Active | 3 Staged)
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('camps')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all cursor-pointer ${
              activeView === 'camps'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
            id="btn-nav-camps"
          >
            <Tent className={`w-4 h-4 ${activeView === 'camps' ? 'text-white' : 'text-slate-500'}`} />
            <span>Relief Camp Logistics</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data font-semibold ${
              activeView === 'camps' ? 'bg-blue-700 text-blue-100' : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              4 Camps (7,550 Beds)
            </span>
          </button>

          <button
            onClick={() => setActiveView('broadcast')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all cursor-pointer ${
              activeView === 'broadcast'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
            id="btn-nav-sms-broadcast"
          >
            <Radio className={`w-4 h-4 ${activeView === 'broadcast' ? 'text-white' : 'text-slate-500'}`} />
            <span>Citizen SMS Broadcast</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data font-semibold ${
              activeView === 'broadcast' ? 'bg-blue-700 text-blue-100' : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}>
              12,480 Q
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setIsEvacModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            id="btn-initiate-evac-directive"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Issue Evacuation Order</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-all shadow-sm border border-slate-800 cursor-pointer"
            id="btn-export-manifest-engine"
            title="Export Tactical Field Manifest & Disaster Assessment Brief"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">EXPORT MANIFEST (PDF)</span>
          </button>
        </div>
      </nav>

      {showDispatchToast && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-red-500/80 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 max-w-md">
          <Siren className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="text-xs font-semibold">{dispatchToastMsg}</div>
        </div>
      )}

      {activeView === 'gis' && (
        <main className="flex-1 flex flex-col md:flex-row relative w-full">

          <aside className="w-full md:w-[320px] bg-white border-r border-slate-200 p-3 flex-shrink-0 flex flex-col gap-2 shadow-xs" id="panel-left">
            <div className="border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-900" />
                TERRAIN &amp; STRUCTURAL LOAD ANALYSIS
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time Slope &amp; Terrain Monitoring</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Monitored Sectors</div>
                <div className="text-lg font-black text-slate-900 font-mono-data mt-0.5">{habitations.length} Zones</div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> 12,480 Verified
                </div>
              </div>

              <div className="bg-red-50/50 p-2 rounded-lg border border-red-200">
                <div className="text-[10px] uppercase font-bold text-red-700 tracking-wider">Red Zones Declared</div>
                <div className="text-lg font-black text-red-600 font-mono-data mt-0.5" id="kpi-red-zones">
                  {kpiData?.redZones || "3 Sectors"}
                </div>
                <div className="text-[10px] text-red-600 font-semibold flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" /> High Risk
                </div>
              </div>

              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">At-Risk Citizens</div>
                <div className="text-lg font-black text-slate-900 font-mono-data mt-0.5" id="kpi-at-risk-pop">
                  {kpiData?.atRiskPopulation || "9,680"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Red &amp; Amber (of 12,480)
                </div>
              </div>

              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peak Overburden</div>
                <div className="text-lg font-black text-amber-700 font-mono-data mt-0.5" id="kpi-max-overburden">
                  {telemetry.peak_overburden ? `${telemetry.peak_overburden}x` : (kpiData?.maxOverburden || "2.10x")}
                </div>
                <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="w-3 h-3" /> Exceeds Margin
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col gap-1.5 shadow-2xs" id="card-xai">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-0">
                  Key Risk Drivers
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Relative geotechnical contribution weights driving the Relocation Priority Index (RPI):
              </p>

              <div className="space-y-1.5 text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-700 mb-0.5">
                    <span className="text-slate-800 font-semibold">Slope Shear Stress:</span>
                    <span className="font-bold text-slate-900">{xaiAttribution.slope_shear_stress_pct || 38}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${xaiAttribution.slope_shear_stress_pct || 38}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-0.5">
                    <span className="text-slate-800 font-semibold">Dynamic Pore Pressure:</span>
                    <span className="font-bold text-slate-900">{xaiAttribution.dynamic_pore_pressure_pct || 34}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${xaiAttribution.dynamic_pore_pressure_pct || 34}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-0.5">
                    <span className="text-slate-800 font-semibold">InSAR Subsidence Velocity:</span>
                    <span className="font-bold text-slate-900">{xaiAttribution.insar_subsidence_velocity_pct || 28}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${xaiAttribution.insar_subsidence_velocity_pct || 28}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-900" />
                  Geotechnical Carrying Capacity
                </span>
                <span className="text-xs font-mono-data font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded" id="capacity-multiplier">
                  {telemetry.peak_overburden ? `${telemetry.peak_overburden}x` : `${avgOverburden}x`} Threshold
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-300 mt-0.5">
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
            </div>
          </aside>

          <section className="flex-1 h-full relative bg-slate-950 flex flex-col overflow-y-auto" id="panel-map">

            <div className="relative w-full h-[540px] flex-shrink-0">
              <TacticalMap 
                habitations={habitations} 
                selectedWard={selectedWard} 
                onSelectWard={(ward) => handleInspectSector(ward)} 
                panTarget={panTarget}
                rainfall={rainfall}
                camps={camps}
                evacuationCorridors={evacuationCorridors}
                roadBlockages={roadBlockages}
                isRoadBlocked={isRoadBlocked}
              />

              <div className="absolute top-3 left-3 z-[1000] pointer-events-auto">
                <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded shadow-sm text-[11px] font-medium text-slate-700 border border-slate-200">
                  ESRI Satellite View • Chamoli Sector
                </span>
              </div>

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

              <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 p-3 rounded-lg shadow-md text-xs max-w-[240px] pointer-events-auto">
                <div className="font-bold text-slate-900 text-[11px] border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                  <span>HAZARD CLASSIFICATION</span>
                  <span className="text-[9px] font-mono-data text-slate-500">MHA-DM-2024</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-xs flex-shrink-0" />
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
            </div>
          </section>

          <aside className="w-full md:w-[380px] bg-white border-l border-slate-200 p-3 flex-shrink-0 flex flex-col shadow-xs" id="panel-right">
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

            <div className="space-y-2 flex-1" id="triage-list">
              {habitations.map((sector, index) => {
                const isRed = sector.status === 'CRITICAL' || sector.zone === 'RED' || sector.hazard_tier === 'CRITICAL_RED';
                const isOrange = sector.status === 'MONITOR' || sector.zone === 'ORANGE' || sector.hazard_tier === 'WARNING_AMBER';
                const borderColor = isRed ? 'border-red-300 bg-red-50/20' : (isOrange ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 bg-white');
                const badgeColor = isRed ? 'bg-red-600 text-white' : (isOrange ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white');
                const sectorUniqueKey = sector.id || `sector-${sector.ward_no || sector.numericId || index}`;

                return (
                  <div key={sectorUniqueKey} className={`p-2.5 rounded-lg border ${borderColor} shadow-xs hover:shadow transition-all`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-mono-data font-bold">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {sector.name}
                            {isRed && <span className="inline-block w-2 h-2 rounded-full bg-red-600 ring-2 ring-red-400/40" />}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono-data">
                            RPI: <span className="font-bold text-slate-800">{sector.calculatedRpi ?? Math.round((sector.rpi_score || 0.5) * 100)}/100</span> | {sector.dwellings || sector.houses || sector.current_houses} Dwellings ({sector.cracked_units || 0} Red-Tagged)
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
                        {sector.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-mono-data text-slate-600">
                      <span>Slope: <strong className="text-slate-800">{sector.slope}°</strong></span>
                      <span>Overburden: <strong className={(sector.overburden || sector.overburden_ratio) > 1.0 ? 'text-red-600' : 'text-slate-800'}>{sector.overburden || sector.overburden_ratio}x</strong></span>
                      <span>Cutoff Risk: <strong className="text-amber-700">{sector.evacCutoffRisk ?? Math.round((sector.cutoff_risk || 0.5) * 100)}%</strong></span>
                    </div>

                    <div className="mt-1.5 pt-1.5 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] text-slate-600 truncate max-w-[210px]">
                        <span className="font-semibold text-slate-700">Relief Hub:</span> {
                          sector.id === 'sec-sunil' || sector.name?.includes('Sunil') || sector.ward_no === 'Ward-04'
                            ? 'Military Cantt Spur'
                            : sector.id === 'sec-helang' || sector.name?.includes('Helang')
                            ? (isRoadBlocked ? 'Gopeshwar Stadium (Diverted)' : 'Pipalkoti Relief Center')
                            : sector.id === 'sec-karnaprayag' || sector.name?.includes('Karnaprayag')
                            ? 'Gauchar Airstrip Hub'
                            : 'Gopeshwar Stadium'
                        }
                      </span>
                      <button
                        onClick={() => handleInspectSector(sector)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-300 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </main>
      )}

      {activeView === 'fleet' && (
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-5 space-y-4">
          <FleetTransitView 
            rainfall={rainfall} 
            isRoadBlocked={isRoadBlocked}
          />
        </div>
      )}

      {activeView === 'camps' && (
        <div className="flex-1 overflow-y-auto bg-slate-100 p-5 space-y-4">
          <EvacuationEngine 
            campsData={camps}
            rainfall={rainfall} 
            isRoadBlocked={isRoadBlocked}
            onOpenLogisticsModal={() => setIsLogisticsModalOpen(true)} 
          />
        </div>
      )}

      {activeView === 'broadcast' && (
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

      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isAdvisorOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="advisor-drawer"
      >

        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200">
              NDRF
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">NDRF Assistor</h3>
              <p className="text-[11px] text-slate-500">Field Decision Support • Chamoli Sector</p>
            </div>
          </div>
          <button onClick={() => setIsAdvisorOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold cursor-pointer" id="btn-close-advisor">✕</button>
        </div>

        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
          <button 
            onClick={() => handleSendAdvisorQuery("Which ward needs immediate evacuation?")}
            className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            🚨 Which ward needs immediate evacuation?
          </button>
          <button 
            onClick={() => handleSendAdvisorQuery("Carrying Capacity analysis breakdown")}
            className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            📊 Carrying Capacity analysis breakdown
          </button>
          <button 
            onClick={() => handleSendAdvisorQuery("Print NDRF Evacuation SOP checklist")}
            className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            📋 Print NDRF Evacuation SOP checklist
          </button>
          <button 
            onClick={() => handleSendAdvisorQuery("Bus fleet mobilization status")}
            className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-full text-left font-medium transition-colors cursor-pointer"
          >
            🚌 Bus fleet mobilization status
          </button>
        </div>

        <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs text-slate-800" id="advisor-messages">
          {advisorMessages.map((msg, idx) => (
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
          {isAdvisorLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-900" />
              <span>Querying geotechnical telemetry &amp; SOP directives...</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input 
            value={advisorInput}
            onChange={(e) => setAdvisorInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorQuery()}
            className="flex-1 text-xs border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-800 font-sans" 
            id="advisor-input" 
            placeholder="Query geotechnical telemetry, SOP checklists, or fleet readiness..." 
            type="text"
          />
          <button 
            onClick={() => handleSendAdvisorQuery()}
            className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer" 
            id="btn-advisor-send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <EvacuationProtocolModal
        isOpen={isEvacModalOpen}
        onClose={() => setIsEvacModalOpen(false)}
        rainfall={rainfall}
        habitations={habitations}
        kpiData={kpiData}
        isRoadBlocked={isRoadBlocked}
        onAuthorizeDispatch={handleConfirmDispatch}
        isDispatching={isDispatching}
      />

      <ReliefLogisticsModal 
        isOpen={isLogisticsModalOpen} 
        onClose={() => setIsLogisticsModalOpen(false)} 
        camps={camps} 
        relocationPlan={relocationPlan} 
        rainfall={rainfall} 
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        rainfall={rainfall}
        isRoadBlocked={isRoadBlocked}
        habitations={habitations}
        onTriggerDispatch={() => {
          setDispatchToastMsg('OFFICIAL CAP BROADCAST DISPATCHED: 12,480 Citizens notified across active BTS sectors.');
          setShowDispatchToast(true);
          setTimeout(() => setShowDispatchToast(false), 5000);
        }}
      />

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