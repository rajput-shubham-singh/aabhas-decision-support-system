import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  HeartPulse, 
  Droplets, 
  Utensils, 
  ShieldCheck, 
  AlertTriangle, 
  Stethoscope, 
  FileText, 
  Package, 
  Layers, 
  CheckCircle2, 
  Truck, 
  Plane, 
  Radio, 
  XCircle, 
  Navigation 
} from 'lucide-react';

export const IMMUTABLE_RELIEF_HUBS = [
  {
    id: 'camp-gopeshwar',
    name: 'Gopeshwar District HQ Mega-Hub',
    alt_name: 'Gopeshwar Sports Complex & District HQ Ridge',
    role: 'District HQ Command & Primary Reception',
    location: 'Gopeshwar Terrace (Chamoli District HQ)',
    coords: [30.4135, 79.3245],
    totalBeds: 3500,
    waterCapLPD: 262500,
    foodPackets: 14000,
    authority: 'District Magistrate Chamoli',
    suitabilityScore: 96.5,
    suitabilityDesc: 'Verified Granite Gneiss Bedrock',
    accessBadgeDefault: '🟢 OPEN HIGHWAY ALL-WEATHER AXIS',
    icuBedsTotal: 45,
    observationBedsTotal: 140,
    staffingDesc: 'District Hospital Gopeshwar (24 Medics, 8 MOs) + NDRF Unit',
    oxygenCylinders: 75,
    surgicalKits: 20,
    antivenomVials: 500,
    sanitationUnits: 105,
    medicalUnitName: 'District Hospital Gopeshwar Emergency Annex'
  },
  {
    id: 'camp-gauchar',
    name: 'Gauchar Civil Airstrip Buffer Camp',
    alt_name: 'Strategic Air-Evacuation Node',
    role: 'Strategic Airhead & Heavy Triage Staging',
    location: 'Gauchar River Terrace (Air-Evac Axis)',
    coords: [30.2850, 79.1550],
    totalBeds: 5000,
    waterCapLPD: 400000,
    foodPackets: 20000,
    authority: 'Indian Air Force / NDRF 8th Bn',
    suitabilityScore: 98.0,
    suitabilityDesc: 'Deep River Alluvial Bedrock & Airstrip',
    accessBadgeDefault: '✈️ ALL-WEATHER AIRHEAD RUNWAY',
    icuBedsTotal: 65,
    observationBedsTotal: 220,
    staffingDesc: 'IAF Mobile Surgical Team + NDRF 8th Bn (35 Medics, 12 Surgeons)',
    oxygenCylinders: 140,
    surgicalKits: 35,
    antivenomVials: 900,
    sanitationUnits: 150,
    medicalUnitName: 'IAF Mobile Surgical Hospital & Air-Evac Trauma Hub'
  },
  {
    id: 'camp-pipalkoti',
    name: 'Pipalkoti Intermediate Relief Center',
    alt_name: 'TRC & Mandir Samiti Complex',
    role: 'Mid-Valley Highway Staging Base',
    location: 'Pipalkoti Mid-Valley Shelf (NH-07 Axis)',
    coords: [30.4289, 79.4325],
    totalBeds: 1200,
    waterCapLPD: 90000,
    foodPackets: 4800,
    authority: 'Chamoli District Admin / SDM Pipalkoti',
    suitabilityScore: 89.0,
    suitabilityDesc: 'NH-07 Road Corridor Staging Platform',
    accessBadgeDefault: '🚛 HEAVY_VEHICLE_ROAD',
    icuBedsTotal: 20,
    observationBedsTotal: 50,
    staffingDesc: 'SDM Pipalkoti Civil MO + NDRF Unit (12 Medics, 4 MOs)',
    oxygenCylinders: 35,
    surgicalKits: 10,
    antivenomVials: 250,
    sanitationUnits: 48,
    medicalUnitName: 'Pipalkoti Emergency Care Centre & Trauma Base'
  },
  {
    id: 'camp-cantt',
    name: 'Military Cantonment Joshimath',
    alt_name: 'Joshimath Immediate Refuge',
    role: 'Hard-Standing Armed Forces Ridge Refuge',
    location: 'Upper Military Spur, Joshimath',
    coords: [30.5465, 79.5690],
    totalBeds: 850,
    waterCapLPD: 63750,
    foodPackets: 3500,
    authority: 'Indian Army 9th Mtn Bde / ITBP 1st Bn',
    suitabilityScore: 91.5,
    suitabilityDesc: 'High Gneiss Plateau Axis Bedrock',
    accessBadgeDefault: '🛡️ HARD-STANDING SPUR AXIS',
    icuBedsTotal: 35,
    observationBedsTotal: 80,
    staffingDesc: 'Army Military Hospital (18 Military Surgeons & Paramedics)',
    oxygenCylinders: 50,
    surgicalKits: 25,
    antivenomVials: 300,
    sanitationUnits: 36,
    medicalUnitName: 'Army Military Hospital (MH) Joshimath Trauma Ward'
  },
  {
    id: 'camp-gairsain',
    name: 'Gairsain Bhararisain Reserve Hub',
    alt_name: 'Summer Capital Vidhan Sabha Complex',
    role: 'Southern Chamoli Macro-Staging Reserve',
    location: 'Bhararisain Elevated Plateau (Summer Capital)',
    coords: [30.0570, 79.2980],
    totalBeds: 4000,
    waterCapLPD: 300000,
    foodPackets: 16000,
    authority: 'State Emergency Operations Centre (SEOC)',
    suitabilityScore: 95.0,
    suitabilityDesc: 'Southern Chamoli Bedrock Shelf',
    accessBadgeDefault: '🟢 NH-109 SOUTH CORRIDOR OPEN',
    icuBedsTotal: 50,
    observationBedsTotal: 180,
    staffingDesc: 'Gairsain Super-Specialty Medical Annex (28 Medics, 10 MOs)',
    oxygenCylinders: 100,
    surgicalKits: 28,
    antivenomVials: 650,
    sanitationUnits: 120,
    medicalUnitName: 'Gairsain Vidhan Sabha Emergency Medical Annex'
  }
];

export const TOTAL_GRID_CAPACITY = 14550;

export default function EvacuationEngine({ rainfall = 35, isRoadBlocked = false, onOpenLogisticsModal }) {
  const [activeSubTab, setActiveSubTab] = useState({});

  const stats = useMemo(() => {
    const rf = Number(rainfall) || 0;

    const totalDisplaced = Math.min(TOTAL_GRID_CAPACITY, Math.round(1800 + (rf * 45)));
    const remainingVacancies = Math.max(0, TOTAL_GRID_CAPACITY - totalDisplaced);
    const globalOccupancyPct = Math.round((totalDisplaced / TOTAL_GRID_CAPACITY) * 100);

    let pipalkotiBaseline = Math.min(1200, Math.round(totalDisplaced * (1200 / TOTAL_GRID_CAPACITY)));
    let gaucharBaseline = Math.min(5000, Math.round(totalDisplaced * (5000 / TOTAL_GRID_CAPACITY)));
    let gopeshwarBaseline = Math.min(3500, Math.round(totalDisplaced * (3500 / TOTAL_GRID_CAPACITY)));
    let canttBaseline = Math.min(850, Math.round(totalDisplaced * (850 / TOTAL_GRID_CAPACITY)));
    let gairsainBaseline = Math.min(4000, Math.round(totalDisplaced * (4000 / TOTAL_GRID_CAPACITY)));

    let pipalkotiAssigned = pipalkotiBaseline;
    let gaucharAssigned = gaucharBaseline;
    let gopeshwarAssigned = gopeshwarBaseline;
    let canttAssigned = canttBaseline;
    let gairsainAssigned = gairsainBaseline;

    if (isRoadBlocked) {
      const divertedPool = pipalkotiBaseline;
      pipalkotiAssigned = 0;

      gaucharAssigned = Math.min(5000, gaucharBaseline + Math.round(divertedPool * 0.65));
      canttAssigned = Math.min(850, canttBaseline + Math.round(divertedPool * 0.20));
      gopeshwarAssigned = Math.min(3500, gopeshwarBaseline + Math.round(divertedPool * 0.15));

      const currentSum = pipalkotiAssigned + gaucharAssigned + gopeshwarAssigned + canttAssigned + gairsainAssigned;
      const discrepancy = totalDisplaced - currentSum;
      if (discrepancy !== 0) {
        gaucharAssigned = Math.min(5000, gaucharAssigned + discrepancy);
      }
    }

    const assignedMap = {
      'camp-pipalkoti': pipalkotiAssigned,
      'camp-gauchar': gaucharAssigned,
      'camp-gopeshwar': gopeshwarAssigned,
      'camp-cantt': canttAssigned,
      'camp-gairsain': gairsainAssigned
    };

    const allocation = IMMUTABLE_RELIEF_HUBS.map((camp) => {
      const assigned = assignedMap[camp.id] ?? 0;
      const occupancyPct = Math.round((assigned / camp.totalBeds) * 100);
      const freeBeds = camp.totalBeds - assigned;

      let suitabilityScore = camp.suitabilityScore;
      let suitabilityDesc = camp.suitabilityDesc;
      let accessBadge = camp.accessBadgeDefault;
      let accessBadgeClass = "bg-slate-100 text-slate-700 border-slate-300";

      if (camp.id === 'camp-pipalkoti') {
        if (isRoadBlocked) {
          accessBadge = "⛔ GROUND ROUTE SEVERED (CONVOY HALTED)";
          accessBadgeClass = "bg-rose-100 text-rose-800 border-rose-300 font-bold";
          suitabilityScore = 22.0;
          suitabilityDesc = "⛔ Severed Road Axis at Helang Chute";
        } else {
          accessBadge = "🚛 HEAVY_VEHICLE_ROAD";
          accessBadgeClass = "bg-blue-50 text-blue-800 border-blue-200";
        }
      } else if (camp.id === 'camp-gauchar') {
        if (isRoadBlocked) {
          accessBadge = "🚁 AIR-EVAC RUNWAY ACTIVE (PRIORITY INTAKE)";
          accessBadgeClass = "bg-cyan-50 text-cyan-900 border-cyan-300 font-bold";
          suitabilityScore = 98.5;
          suitabilityDesc = "Strategic IAF Airhead & Deep Bedrock";
        } else {
          accessBadge = "✈️ ALL-WEATHER AIRHEAD RUNWAY";
          accessBadgeClass = "bg-blue-50 text-blue-800 border-blue-200";
        }
      } else if (camp.id === 'camp-cantt') {
        if (isRoadBlocked) {
          accessBadge = "EMERGENCY IMMEDIATE REFUGE (WALKING DISTANCE BYPASS)";
          accessBadgeClass = "bg-amber-50 text-amber-900 border-amber-300 font-bold";
        } else {
          accessBadge = "🛡️ HARD-STANDING SPUR AXIS";
          accessBadgeClass = "bg-slate-100 text-slate-800 border-slate-200";
        }
      }

      let status = 'OPTIMAL';
      let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      let progressBarClass = 'bg-emerald-500';

      if (camp.id === 'camp-pipalkoti' && isRoadBlocked) {
        status = 'SEVERED / FROZEN';
        statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
        progressBarClass = 'bg-rose-600';
      } else if (occupancyPct >= 90) {
        status = 'CRITICAL';
        statusBadgeClass = 'bg-red-50 text-red-700 border-red-300';
        progressBarClass = 'bg-red-600';
      } else if (occupancyPct >= 65) {
        status = 'MODERATE';
        statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
        progressBarClass = 'bg-amber-500';
      }

      const dailyWaterReqL = assigned * 75;
      const dailyRationsReq = assigned * 3;
      const rationDaysRemaining = dailyRationsReq > 0 ? (camp.foodPackets / dailyRationsReq).toFixed(1) : 30;

      const triageFactor = occupancyPct / 100;
      const activeIcuBeds = Math.min(camp.icuBedsTotal, Math.round(camp.icuBedsTotal * triageFactor));
      const activeObservationBeds = Math.min(camp.observationBedsTotal, Math.round(camp.observationBedsTotal * triageFactor));
      const totalTriageBeds = camp.icuBedsTotal + camp.observationBedsTotal;
      const occupiedTriageBeds = activeIcuBeds + activeObservationBeds;
      const triageOccupancyPct = Math.round((occupiedTriageBeds / totalTriageBeds) * 100);

      const waterReservePct = Math.min(100, Math.round((dailyWaterReqL / camp.waterCapLPD) * 100));

      return {
        ...camp,
        assigned,
        occupancyPct,
        freeBeds,
        status,
        statusBadgeClass,
        progressBarClass,
        suitabilityScore,
        suitabilityDesc,
        accessBadge,
        accessBadgeClass,
        dailyWaterReqL,
        dailyRationsReq,
        rationDaysRemaining,
        activeIcuBeds,
        activeObservationBeds,
        totalTriageBeds,
        occupiedTriageBeds,
        triageOccupancyPct,
        waterReservePct
      };
    });

    const totalAssigned = allocation.reduce((acc, c) => acc + c.assigned, 0);
    const totalWaterNeed = totalDisplaced * 75;
    const totalRationsNeed = totalDisplaced * 3;
    const bottleneckLeft = Math.max(0, totalDisplaced - TOTAL_GRID_CAPACITY);

    return {
      totalDisplaced,
      totalBeds: TOTAL_GRID_CAPACITY,
      totalAssigned,
      remainingVacancies,
      globalOccupancyPct,
      totalWaterNeed,
      totalRationsNeed,
      bottleneckLeft,
      camps: allocation
    };
  }, [rainfall, isRoadBlocked]);

  const toggleSubTab = (campId, tabKey) => {
    setActiveSubTab(prev => ({
      ...prev,
      [campId]: tabKey
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 font-sans text-slate-800 shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-200 pb-4 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse"></span>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 uppercase">
              CHAMOLI DISTRICT DISPLACEMENT &amp; LOGISTICS OPTIMIZER
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              MHA SOVEREIGN PROTOCOL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Bipartite Capacity Engine &middot; 5 Strategic Regional Relief Hubs (14,550 Capacity Grid)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-500">TOTAL GRID:</span>
            <span className="font-bold text-slate-900 text-sm">14,550 Beds</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">DISPLACED:</span>
            <span className="font-bold text-red-600 text-sm">{stats.totalDisplaced.toLocaleString()}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">VACANT:</span>
            <span className="font-bold text-emerald-700 text-sm">{stats.remainingVacancies.toLocaleString()}</span>
          </div>

          {onOpenLogisticsModal && (
            <button
              onClick={onOpenLogisticsModal}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 shadow-sm border border-blue-900 cursor-pointer transition-all whitespace-nowrap"
              id="btn-open-manifest-modal"
              title="Open Complete Multi-Hub Logistics & Resource Manifest Modal"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Manifest Modal</span>
            </button>
          )}
        </div>
      </div>

      {isRoadBlocked && (
        <div 
          className="bg-rose-50 border-2 border-rose-400 text-rose-900 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 mb-4"
          id="banner-road-blockage-warning"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <div className="text-xs font-black uppercase tracking-wide text-rose-900 flex flex-wrap items-center gap-2">
              <span>🚨 ARTERIAL CORRIDOR SEVERED: NH-07 BLOCKED BY ACTIVE DEBRIS TORRENT AT HELANG</span>
              <span className="text-[10px] bg-rose-200 text-rose-900 border border-rose-400 px-1.5 py-0.2 rounded font-mono font-bold">
                KM-48 HELANG CHUTE
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Ground vehicular evacuation to Pipalkoti suspended. Rerouting all secondary cohorts to Gauchar Airhead and High-Ground Military Spur via IAF Mi-17 V5 airlift corridors.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>CAMP NETWORK LOAD</span>
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono ${
              stats.globalOccupancyPct >= 90 ? 'text-red-600' :
              stats.globalOccupancyPct >= 65 ? 'text-amber-600' :
              'text-emerald-700'
            }`}>
              {stats.globalOccupancyPct}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.totalAssigned.toLocaleString()} / 14,550 Beds)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-300 ${
                stats.globalOccupancyPct >= 90 ? 'bg-red-600' :
                stats.globalOccupancyPct >= 65 ? 'bg-amber-500' :
                'bg-emerald-600'
              }`}
              style={{ width: `${stats.globalOccupancyPct}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>SPHERE WATER DEMAND</span>
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-blue-900">
              {(stats.totalWaterNeed / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-600">Liters / Day</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>75 L/Person/Day Standard</span>
            <span className="font-semibold text-blue-700">1.1M L Buffer</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>DAILY RATIONS NEED</span>
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {stats.totalRationsNeed.toLocaleString()}
            </span>
            <span className="text-xs text-slate-600">Meals / Day</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>3 MRE Meals/Person/Day</span>
            <span className="font-semibold text-emerald-700">58.3k Stockpile</span>
          </div>
        </div>

        <div className={`border p-3 rounded-lg shadow-2xs ${
          stats.bottleneckLeft > 0 ? 'bg-red-50/70 border-red-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>LOGISTICS BOTTLENECK</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${stats.bottleneckLeft > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono ${
              stats.bottleneckLeft > 0 ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {stats.bottleneckLeft === 0 ? 'ZERO' : `+${stats.bottleneckLeft.toLocaleString()}`}
            </span>
            <span className="text-xs text-slate-600">
              {stats.bottleneckLeft === 0 ? 'Nominal Capacity' : 'Overflow Souls'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {stats.bottleneckLeft === 0 ? '100% Shelter Clearance' : 'Pre-fab Expansion Activated'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-900" />
            Verified Chamoli Regional Relief Hubs (14,550 Total Beds Grid)
          </span>
          <span className="text-[11px] font-normal text-slate-500 font-mono">
            Precipitation: {rainfall} mm/24h &middot; Sphere Standard: 75L/p/d
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.camps.map((camp) => {
            const currentTab = activeSubTab[camp.id] || 'medical';

            return (
              <div 
                key={camp.id} 
                className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  camp.id === 'camp-pipalkoti' && isRoadBlocked
                    ? 'border-rose-300 bg-rose-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{camp.name}</h3>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${camp.statusBadgeClass}`}>
                          {camp.status} ({camp.occupancyPct}%)
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{camp.role} &middot; {camp.location}</div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        camp.suitabilityScore < 50
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        ★ {camp.suitabilityScore}/100
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5 max-w-[130px] truncate text-right" title={camp.suitabilityDesc}>
                        {camp.suitabilityDesc}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono inline-block max-w-full truncate ${camp.accessBadgeClass}`}>
                      {camp.accessBadge}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 my-2.5">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                      <span className="font-semibold text-slate-700">
                        Shelter Capacity: <strong className="text-slate-900">{camp.assigned.toLocaleString()}</strong> / {camp.totalBeds.toLocaleString()} Beds ({camp.occupancyPct}%)
                      </span>
                      <span className="font-bold text-slate-600">
                        {camp.freeBeds.toLocaleString()} Vacant
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${camp.progressBarClass}`}
                        style={{ width: `${camp.occupancyPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center border-b border-slate-200 mb-3 font-sans">
                    <button
                      onClick={() => toggleSubTab(camp.id, 'medical')}
                      className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                        currentTab === 'medical'
                          ? 'border-blue-900 text-blue-900'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <HeartPulse className="w-3.5 h-3.5 text-red-600" />
                      <span>Medical &amp; Triage</span>
                    </button>

                    <button
                      onClick={() => toggleSubTab(camp.id, 'supplies')}
                      className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                        currentTab === 'supplies'
                          ? 'border-blue-900 text-blue-900'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5 text-blue-700" />
                      <span>Relief Supplies</span>
                    </button>
                  </div>

                  {currentTab === 'medical' && (
                    <div className="space-y-2.5 text-xs bg-red-50/30 p-3 rounded-lg border border-red-100">
                      <div className="flex items-start justify-between gap-2 border-b border-red-100 pb-2">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 text-red-700" />
                            {camp.medicalUnitName}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{camp.staffingDesc}</div>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-red-100 text-red-800 rounded border border-red-200 whitespace-nowrap">
                          {camp.triageOccupancyPct}% Triage
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                        <div className="bg-white p-2 rounded border border-red-100">
                          <span className="text-slate-500 block text-[10px]">ICU BEDS</span>
                          <span className="font-bold text-red-700 text-sm">
                            {camp.activeIcuBeds} <span className="text-xs font-normal text-slate-500">/ {camp.icuBedsTotal}</span>
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded border border-red-100">
                          <span className="text-slate-500 block text-[10px]">OBSERVATION</span>
                          <span className="font-bold text-amber-700 text-sm">
                            {camp.activeObservationBeds} <span className="text-xs font-normal text-slate-500">/ {camp.observationBedsTotal}</span>
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded border border-red-100">
                          <span className="text-slate-500 block text-[10px]">OXYGEN MANIFOLD</span>
                          <span className="font-bold text-blue-800 text-sm">
                            {camp.oxygenCylinders} <span className="text-[10px] font-normal text-slate-500">Cyl</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-700 pt-1 border-t border-red-100/80">
                        <span>Surgical Packs: <strong className="text-slate-900">{camp.surgicalKits} Kits</strong></span>
                        <span>Anti-Venom: <strong className="text-slate-900">{camp.antivenomVials} Vials</strong></span>
                        <span>Sanitation: <strong className="text-slate-900">{camp.sanitationUnits} Latrines</strong></span>
                      </div>
                    </div>
                  )}

                  {currentTab === 'supplies' && (
                    <div className="space-y-2.5 text-xs bg-blue-50/30 p-3 rounded-lg border border-blue-100">
                      <div className="bg-white p-2.5 rounded border border-blue-100">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5 text-blue-600" />
                            Water Demand (75L/p/d)
                          </span>
                          <span className="font-mono font-bold text-blue-900">
                            {(camp.dailyWaterReqL / 1000).toFixed(1)}k / {(camp.waterCapLPD / 1000).toFixed(0)}k L/d
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${camp.waterReservePct}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                          <span>Sphere 75L Standard Compliant</span>
                          <span className="font-semibold text-emerald-700">{100 - camp.waterReservePct}% Reserve Margin</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="bg-white p-2 rounded border border-blue-100">
                          <span className="text-slate-500 block text-[10px]">MRE RATION STOCK</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {camp.foodPackets.toLocaleString()} <span className="text-xs font-normal text-slate-500">Packets</span>
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded border border-blue-100">
                          <span className="text-slate-500 block text-[10px]">SUSTAINABILITY BUFFER</span>
                          <span className="font-bold text-emerald-700 text-sm">
                            {camp.rationDaysRemaining} <span className="text-xs font-normal text-slate-500">Days</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-blue-100/80">
                        <span>Authority: <strong className="text-slate-800">{camp.authority}</strong></span>
                        {camp.id === 'camp-pipalkoti' && isRoadBlocked ? (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Severed Axis (Helang KM-48)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Clear Corridor
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
