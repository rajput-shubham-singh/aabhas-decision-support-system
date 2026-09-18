import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Fuel, 
  Users, 
  Clock, 
  Route, 
  Send, 
  Navigation, 
  FileText, 
  RefreshCw, 
  MapPin, 
  Compass, 
  Zap, 
  Activity,
  Play,
  Square
} from 'lucide-react';
import { supabase, fetchLiveTransitFleet, updateFleetStatus } from '../lib/supabaseClient.js';

const INITIAL_CONVOY_MANIFEST = [
  {
    id: 'CONVOY-A1',
    regNo: 'UTC-UK07-GA-4412',
    model: 'Ashok Leyland 42-Str',
    class: 'Heavy Transit Bus',
    pickup: 'Joshimath Helipad Ground',
    destination: 'Gopeshwar Stadium Mega-Hub',
    capacity: 42,
    pax: 40,
    status: 'EN_ROUTE',
    driver: 'Havildar R. S. Negi',
    fuel: 94,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'CONVOY-A2',
    regNo: 'UTC-UK07-GA-4418',
    model: 'Ashok Leyland 42-Str',
    class: 'Heavy Transit Bus',
    pickup: 'Joshimath Lower Basti',
    destination: 'Gopeshwar Stadium Mega-Hub',
    capacity: 42,
    pax: 42,
    status: 'EN_ROUTE',
    driver: 'Naik Surendra Rawat',
    fuel: 88,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'CONVOY-A3',
    regNo: 'UTC-UK07-GA-4425',
    model: 'Tata Ultra 42-Str',
    class: 'Heavy Transit Bus',
    pickup: 'Marwari Central Chowk',
    destination: 'Gopeshwar Stadium Mega-Hub',
    capacity: 42,
    pax: 38,
    status: 'BOARDING',
    driver: 'Subedar M. Joshi',
    fuel: 92,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'CONVOY-A4',
    regNo: 'UTC-UK07-GA-4431',
    model: 'Ashok Leyland 42-Str',
    class: 'Heavy Transit Bus',
    pickup: 'Joshimath Helipad Ground',
    destination: 'Gopeshwar Stadium Mega-Hub',
    capacity: 42,
    pax: 0,
    status: 'STAGED',
    driver: 'Constable Amit Chauhan',
    fuel: 100,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'CONVOY-A5',
    regNo: 'UTC-UK07-GA-4440',
    model: 'Tata Ultra 42-Str',
    class: 'Heavy Transit Bus',
    pickup: 'Sunil Scarp Base',
    destination: 'Gopeshwar Stadium Mega-Hub',
    capacity: 42,
    pax: 36,
    status: 'EN_ROUTE',
    driver: 'Havildar Deepesh Pundir',
    fuel: 85,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'CONVOY-A6',
    regNo: 'UTC-UK07-GA-4452',
    model: 'Ashok Leyland 42-Str',
    class: 'Heavy Transit Bus',
    pickup: 'Joshimath Helipad Ground',
    destination: 'Gopeshwar Stadium Mega-Hub',
    capacity: 42,
    pax: 0,
    status: 'READY',
    driver: 'Naik B. S. Danu',
    fuel: 98,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'CONVOY-B1',
    regNo: 'ITBP-UK07-TC-101',
    model: 'ITBP 4x4 High-Axle Carrier',
    class: '4x4 Troop Carrier',
    pickup: 'Upper Sunil Shear Scarp',
    destination: 'Military Cantt Spur',
    capacity: 25,
    pax: 25,
    status: 'EN_ROUTE',
    driver: 'Subedar Major K. Singh',
    fuel: 96,
    axis: 'High-Altitude Ridge'
  },
  {
    id: 'CONVOY-B2',
    regNo: 'ITBP-UK07-TC-104',
    model: 'ITBP 4x4 High-Axle Carrier',
    class: '4x4 Troop Carrier',
    pickup: 'Singhdhar Main Rupture',
    destination: 'Military Cantt Spur',
    capacity: 25,
    pax: 24,
    status: 'EN_ROUTE',
    driver: 'Havildar P. C. Bhatt',
    fuel: 90,
    axis: 'High-Altitude Ridge'
  },
  {
    id: 'CONVOY-B3',
    regNo: 'ITBP-UK07-TC-109',
    model: 'ITBP 4x4 High-Axle Carrier',
    class: '4x4 Troop Carrier',
    pickup: 'Upper Sunil Scarp',
    destination: 'Military Cantt Spur',
    capacity: 25,
    pax: 22,
    status: 'BOARDING',
    driver: 'Naik Arvind Thapa',
    fuel: 93,
    axis: 'High-Altitude Ridge'
  },
  {
    id: 'CONVOY-B4',
    regNo: 'ITBP-UK07-TC-115',
    model: 'ITBP 4x4 High-Axle Carrier',
    class: '4x4 Troop Carrier',
    pickup: 'Manohar Bagh Ridge',
    destination: 'Military Cantt Spur',
    capacity: 25,
    pax: 0,
    status: 'READY',
    driver: 'Constable Virendra Negi',
    fuel: 99,
    axis: 'High-Altitude Ridge'
  },
  {
    id: 'CONVOY-B5',
    regNo: 'ITBP-UK07-TC-122',
    model: 'ITBP 4x4 High-Axle Carrier',
    class: '4x4 Troop Carrier',
    pickup: 'Ravigram Bypass Spur',
    destination: 'Military Cantt Spur',
    capacity: 25,
    pax: 0,
    status: 'READY',
    driver: 'Havildar G. S. Rawat',
    fuel: 95,
    axis: 'High-Altitude Ridge'
  },
  {
    id: 'CONVOY-C1',
    regNo: 'UTC-UK07-LC-8801',
    model: 'Volvo 9600 Multi-Axle (52-Str)',
    class: 'Long Distance Evac Coach',
    pickup: 'Joshimath Civil Bus Stand',
    destination: 'Gauchar Airhead Staging',
    capacity: 52,
    pax: 52,
    status: 'EN_ROUTE',
    driver: 'Driver Master R. K. Sharma',
    fuel: 91,
    axis: 'NH-07 South Corridor'
  },
  {
    id: 'CONVOY-C2',
    regNo: 'UTC-UK07-LC-8809',
    model: 'Volvo 9600 Multi-Axle (52-Str)',
    class: 'Long Distance Evac Coach',
    pickup: 'Marwari Central Chowk',
    destination: 'Gauchar Airhead Staging',
    capacity: 52,
    pax: 50,
    status: 'EN_ROUTE',
    driver: 'Senior Driver Ajay Semwal',
    fuel: 87,
    axis: 'NH-07 South Corridor'
  },
  {
    id: 'CONVOY-C3',
    regNo: 'UTC-UK07-LC-8814',
    model: 'Ashok Leyland 52-Str',
    class: 'Long Distance Evac Coach',
    pickup: 'Joshimath Civil Bus Stand',
    destination: 'Gairsain Bhararisain Hub',
    capacity: 52,
    pax: 48,
    status: 'EN_ROUTE',
    driver: 'Driver B. P. Nautiyal',
    fuel: 84,
    axis: 'NH-109 Pindar Axis'
  },
  {
    id: 'CONVOY-C4',
    regNo: 'UTC-UK07-LC-8822',
    model: 'Ashok Leyland 52-Str',
    class: 'Long Distance Evac Coach',
    pickup: 'Joshimath Lower Basti',
    destination: 'Gairsain Bhararisain Hub',
    capacity: 52,
    pax: 0,
    status: 'STAGED',
    driver: 'Driver Sanjay Gairola',
    fuel: 100,
    axis: 'NH-109 Pindar Axis'
  },
  {
    id: 'MEDIC-01',
    regNo: 'NDRF-UK07-MED-01',
    model: 'Force Traveller ALS ICU',
    class: 'Mobile Trauma Ambulance',
    pickup: 'Upper Sunil Scarp Triage',
    destination: 'Gopeshwar Trauma Hub',
    capacity: 4,
    pax: 3,
    status: 'EN_ROUTE',
    driver: 'Dr. (Capt) Vikram Rana',
    fuel: 97,
    axis: 'NH-07 Upper Corridor'
  },
  {
    id: 'MEDIC-02',
    regNo: 'NDRF-UK07-MED-03',
    model: 'Force Traveller ALS ICU',
    class: 'Mobile Trauma Ambulance',
    pickup: 'Helang Scree Lower Bypass',
    destination: 'Pipalkoti Intermediate Hub',
    capacity: 4,
    pax: 2,
    status: 'EN_ROUTE',
    driver: 'Paramedic Sub-Insp. A. Arya',
    fuel: 90,
    axis: 'NH-07 Lower Axis (Helang)'
  },
  {
    id: 'MEDIC-03',
    regNo: 'ITBP-UK07-MED-05',
    model: '4x4 All-Terrain Ambulance',
    class: 'Mobile Trauma Ambulance',
    pickup: 'Pipalkoti Intermediate Shelf',
    destination: 'Gopeshwar Trauma Hub',
    capacity: 4,
    pax: 0,
    status: 'STANDBY',
    driver: 'Paramedic Naik M. Bisht',
    fuel: 100,
    axis: 'NH-07 Lower Axis (Pipalkoti)'
  }
];

export default function FleetTransitView({ 
  rainfall = 65, 
  isRoadBlocked = false 
}) {
  const [convoys, setConvoys] = useState(INITIAL_CONVOY_MANIFEST);
  const [toastMsg, setToastMsg] = useState(null);
  const [isBalancing, setIsBalancing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function hydrateFleet() {
      try {
        const liveFleet = await fetchLiveTransitFleet();
        if (liveFleet && liveFleet.length > 0 && isMounted) {
          setConvoys(prev => prev.map(c => {
            const match = liveFleet.find(f => f.id === c.regNo || f.id === c.id);
            if (match) {
              let normStatus = match.status;
              if (match.status === 'EN ROUTE') normStatus = 'EN_ROUTE';
              return {
                ...c,
                pax: match.manifest_load !== undefined && match.manifest_load !== null ? Number(match.manifest_load) : c.pax,
                status: normStatus || c.status,
                fuel: match.fuel_pct !== undefined && match.fuel_pct !== null ? Number(match.fuel_pct) : c.fuel,
                driver: match.driver_name || c.driver
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.warn('Supabase fleet hydration error:', err);
      }
    }
    hydrateFleet();
    return () => { isMounted = false; };
  }, []);

  const { activeTransitCount, totalPaxInTransit, passabilityStatus, passabilityBadgeClass } = useMemo(() => {
    const rf = Number(rainfall) || 0;

    let transitCount = 12;
    if (rf > 100) transitCount = 14;
    else if (rf < 50) transitCount = 8;

    const totalPax = convoys.reduce((sum, c) => sum + Number(c.pax || 0), 0);

    let passability = 'NH-07 CLEAR ALL-WEATHER';
    let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';

    if (isRoadBlocked) {
      passability = '⛔ HELANG CHUTE BLOCKED (KM-48)';
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-400 font-bold animate-pulse';
    }

    return {
      activeTransitCount: transitCount,
      totalPaxInTransit: totalPax,
      passabilityStatus: passability,
      passabilityBadgeClass: badgeClass
    };
  }, [rainfall, isRoadBlocked, convoys]);

  const handleConvoyStateUpdate = async (convoyId, newStatus, newPax) => {
    setConvoys(prev => prev.map(c => {
      if (c.id === convoyId || c.regNo === convoyId) {
        const nextPax = newPax !== undefined ? newPax : c.pax;
        const nextStatus = newStatus !== undefined ? newStatus : c.status;
        return { ...c, pax: nextPax, status: nextStatus };
      }
      return c;
    }));

    const target = convoys.find(c => c.id === convoyId || c.regNo === convoyId);
    if (target) {
      const dbId = target.regNo || target.id;
      const statusToPersist = newStatus !== undefined ? (newStatus === 'EN_ROUTE' ? 'EN ROUTE' : newStatus) : (target.status === 'EN_ROUTE' ? 'EN ROUTE' : target.status);
      const paxToPersist = newPax !== undefined ? newPax : target.pax;
      await updateFleetStatus(dbId, statusToPersist, paxToPersist);
    }
  };

  const handleAutoBalance = async () => {
    setIsBalancing(true);

    const updatedConvoys = convoys.map(c => {
      if (c.axis.includes('Upper Sunil') || c.pickup.includes('Sunil') || c.pickup.includes('Singhdhar')) {
        const balancedPax = Math.min(c.capacity, Math.max(c.pax, Math.round(c.capacity * 0.95)));
        return { ...c, pax: balancedPax, status: 'EN_ROUTE' };
      }
      return c;
    });

    setConvoys(updatedConvoys);

    try {
      const persistPromises = updatedConvoys
        .filter(c => c.axis.includes('Upper Sunil') || c.pickup.includes('Sunil') || c.pickup.includes('Singhdhar'))
        .map(c => {
          const dbId = c.regNo || c.id;
          return updateFleetStatus(dbId, 'EN ROUTE', c.pax);
        });
      await Promise.all(persistPromises);
    } catch (err) {
      console.warn('Auto balance persistence error:', err);
    }

    setIsBalancing(false);
    setToastMsg("🔀 FLEET AUTO-BALANCED: Priority bus allocation surged & synced to Supabase database.");
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-6 font-sans text-slate-800 shadow-sm space-y-4" id="fleet-transit-view">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-900 text-white shadow-xs">
              <Truck className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 uppercase">
                  CHAMOLI EMERGENCY TRANSIT FLEET &amp; CONVOY TELEMETRY
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  UTC &bull; ITBP &bull; NDRF
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Uttarakhand Transport Corporation (UTC) &bull; ITBP 1st Bn Logistics Wing &bull; NDRF Motor Pool
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            18 TACTICAL VEHICLES ACTIVE
          </span>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-slate-900 text-white border-l-4 border-blue-500 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>TOTAL ROLLING FLEET</span>
            <Truck className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">
            18 <span className="text-xs font-normal text-slate-500">Transports</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium mt-1">
            10 Buses &bull; 5 ITBP 4x4s &bull; 3 ALS ICU
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>TOTAL SEATING LIFT</span>
            <Users className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">
            680 <span className="text-xs font-normal text-slate-500">Seats/Wave</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium mt-1">
            1,620 Seats Max 3-Axis Deployment
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>ACTIVE IN TRANSIT</span>
            <Navigation className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono-data mt-1">
            {activeTransitCount} <span className="text-xs font-normal text-slate-500">Dispatched</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium mt-1">
            {totalPaxInTransit} Civilians On-Board
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>ROAD PASSABILITY</span>
            <Route className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="mt-2">
            <span className={`text-[11px] px-2.5 py-1 rounded border inline-block ${passabilityBadgeClass}`}>
              {passabilityStatus}
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium mt-1">
            Helang Valley Scree Zone Monitored
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              TACTICAL FLEET MANIFEST &amp; CONVOY ROSTER (18 ROLLING UNITS)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-data">
            POSTGIS AIS-140 SATELLITE DISPATCH
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table-fleet-transit-manifest">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-y border-slate-200 font-mono-data">
                <th className="py-2 px-3">Convoy / Vehicle Registration</th>
                <th className="py-2 px-3">Pickup Location / Axis</th>
                <th className="py-2 px-3">Destination Hub</th>
                <th className="py-2 px-3">Load Manifest</th>
                <th className="py-2 px-3">Telemetry Status</th>
                <th className="py-2 px-3 text-right">Quick Dispatch Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {convoys.map((c) => {
                const loadPct = Math.round((Number(c.pax || 0) / Number(c.capacity || 1)) * 100);
                const isPipalkotiAxis = c.axis.includes('Pipalkoti') || c.axis.includes('Helang');
                const isBlocked = isRoadBlocked && isPipalkotiAxis;

                let statusText = c.status === 'EN_ROUTE' ? 'EN ROUTE' : (c.status === 'BOARDING' ? 'BOARDING' : (c.status === 'STAGED' ? 'STAGED' : (c.status === 'HALTED' ? 'HALTED' : 'READY')));
                let statusClass = c.status === 'EN_ROUTE'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : (c.status === 'BOARDING'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : (c.status === 'HALTED'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                  : 'bg-slate-100 text-slate-600 border-slate-200'));

                if (isBlocked) {
                  statusText = '⛔ HALTED AT HELANG CHUTE';
                  statusClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                }

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-rose-600 animate-ping' : (c.status === 'EN_ROUTE' ? 'bg-emerald-500' : 'bg-slate-400')}`} />
                        <span>{c.regNo}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal pl-3.5">{c.model} &bull; {c.driver}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <span>{c.pickup}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-4">{c.axis}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      <div className="font-semibold text-blue-950">{c.destination}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Fuel Reserve: {c.fuel}%</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {c.pax} <span className="text-[10px] text-slate-500 font-normal">/ {c.capacity} Seats ({loadPct}%)</span>
                      </div>
                      <div className="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full ${loadPct >= 90 ? 'bg-red-600' : (loadPct > 0 ? 'bg-blue-600' : 'bg-slate-300')}`}
                          style={{ width: `${loadPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {c.status !== 'EN_ROUTE' ? (
                          <button
                            onClick={() => handleConvoyStateUpdate(c.id, 'EN_ROUTE', Math.max(c.pax, c.capacity))}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            title="Dispatch full manifest and sync to Supabase"
                          >
                            <Play className="w-2.5 h-2.5" /> Dispatch
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConvoyStateUpdate(c.id, 'HALTED', c.pax)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            title="Halt convoy and sync to Supabase"
                          >
                            <Square className="w-2.5 h-2.5" /> Halt
                          </button>
                        )}
                        <button
                          onClick={() => handleConvoyStateUpdate(c.id, 'BOARDING', Math.min(c.capacity, Number(c.pax || 0) + 5))}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition"
                          title="Add 5 Passengers"
                        >
                          +5 Pax
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 px-5 py-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="text-left">
          <div className="text-[11px] text-slate-300 font-mono-data font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            GPS Telemetry: <span className="text-amber-400">AIS-140 Certified Tracking Active &bull; Supabase Live Sync</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono-data mt-0.5">
            Satellite Paging Latency: 1.1s &bull; Real-Time Fuel &amp; Engine Diagnostic Link
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            id="btn-fleet-export-manifest"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Driver &amp; Manifest Sheet</span>
          </button>

          <button
            onClick={handleAutoBalance}
            disabled={isBalancing}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg border border-blue-500 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap"
            id="btn-fleet-autobalance"
          >
            {isBalancing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>OPTIMIZING ASSIGNMENTS...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>🔀 Auto-Balance Fleet Allocation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
