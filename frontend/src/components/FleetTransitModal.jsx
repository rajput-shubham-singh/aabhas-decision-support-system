import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
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
  Square, 
  ArrowRight 
} from 'lucide-react';
import { supabase, fetchLiveTransitFleet, updateFleetStatus } from '../lib/supabaseClient.js';
import { FLEET_DATA } from '../data/fleetData.js';

export default function FleetTransitModal({ 
  isOpen, 
  onClose, 
  rainfall = 65, 
  isRoadBlocked = false 
}) {
  const [convoys, setConvoys] = useState(FLEET_DATA);
  const [toastMsg, setToastMsg] = useState(null);
  const [isBalancing, setIsBalancing] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    async function hydrateFleet() {
      try {
        const liveFleet = await fetchLiveTransitFleet();
        if (liveFleet && liveFleet.length > 0 && isMounted) {
          setConvoys(prev => prev.map(c => {
            const match = liveFleet.find(f => f.registration_no === c.reg || f.registration_no === c.id || f.id === c.id || f.id === c.reg);
            if (match) {
              let normStatus = match.status;
              if (match.status === 'EN_ROUTE' || match.status === 'EN ROUTE') normStatus = 'EN ROUTE';
              return {
                ...c,
                passengers: match.current_load !== undefined ? Number(match.current_load) : (match.manifest_load !== undefined ? Number(match.manifest_load) : c.passengers),
                capacity: match.max_capacity ? Number(match.max_capacity) : c.capacity,
                status: normStatus || c.status,
                operator: match.operator_name || match.driver_name || c.operator,
                pickup: match.origin_axis || c.pickup,
                destination: match.destination_camp_name || c.destination,
                type: match.vehicle_type || c.type
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.warn('Supabase fleet hydration error:', err);
      }
    }
    if (isOpen) {
      hydrateFleet();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { activeTransitCount, standbyCount, totalPaxInTransit, totalCapacity, standbyCapacity, passabilityStatus, passabilityBadgeClass } = useMemo(() => {
    const enRoute = convoys.filter(c => c.status === 'EN ROUTE' || c.status === 'EN_ROUTE' || c.status === 'BOARDING').length;
    const standbyList = convoys.filter(c => c.status === 'STANDBY' || c.status === 'READY' || c.status === 'STAGED' || c.status === 'HALTED');
    const standby = standbyList.length;
    const totalPax = convoys.reduce((sum, c) => sum + Number(c.passengers || 0), 0);
    const totalCap = convoys.reduce((sum, c) => sum + Number(c.capacity || 0), 0);
    const standCap = standbyList.reduce((sum, c) => sum + Number(c.capacity || 0), 0);

    let passability = 'NH-07 CLEAR';
    let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';

    if (isRoadBlocked) {
      passability = 'NH-07 BLOCKED AT HELANG (DIVERTING AIRHEAD)';
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-400 font-bold animate-pulse';
    }

    return {
      activeTransitCount: enRoute,
      standbyCount: standby,
      totalPaxInTransit: totalPax,
      totalCapacity: totalCap,
      standbyCapacity: standCap,
      passabilityStatus: passability,
      passabilityBadgeClass: badgeClass
    };
  }, [rainfall, isRoadBlocked, convoys]);

  if (!isOpen) return null;

  const filteredConvoys = filterMode === 'EN_ROUTE' 
    ? convoys.filter(c => c.status === 'EN ROUTE' || c.status === 'EN_ROUTE' || c.status === 'BOARDING')
    : (filterMode === 'STANDBY' ? convoys.filter(c => c.status === 'STANDBY' || c.status === 'READY' || c.status === 'STAGED' || c.status === 'HALTED') : convoys);

  const handleConvoyStateUpdate = async (convoyId, newStatus, newPax) => {
    setConvoys(prev => prev.map(c => {
      if (c.id === convoyId || c.reg === convoyId) {
        const nextPax = newPax !== undefined ? newPax : c.passengers;
        const nextStatus = newStatus !== undefined ? newStatus : c.status;
        return { ...c, passengers: nextPax, status: nextStatus };
      }
      return c;
    }));

    const target = convoys.find(c => c.id === convoyId || c.reg === convoyId);
    if (target) {
      const dbId = target.reg || target.id;
      const statusToPersist = newStatus !== undefined ? (newStatus === 'EN ROUTE' ? 'EN ROUTE' : newStatus) : target.status;
      const paxToPersist = newPax !== undefined ? newPax : target.passengers;
      await updateFleetStatus(dbId, statusToPersist, paxToPersist, {
        reg: target.reg,
        pickup: target.pickup,
        destination: target.destination,
        capacity: target.capacity
      });
    }
  };

  const handleAutoBalance = async () => {
    setIsBalancing(true);
    const updatedConvoys = convoys.map(c => {
      if (c.axis.includes('Ridge') || c.pickup.includes('Sunil') || c.pickup.includes('Singhdhar') || c.pickup.includes('Manohar') || c.type.includes('Helicopter')) {
        const balancedPax = Math.min(c.capacity, Math.max(c.passengers, Math.round(c.capacity * 0.95)));
        return { ...c, passengers: balancedPax, status: 'EN ROUTE' };
      }
      return c;
    });

    setConvoys(updatedConvoys);

    try {
      const persistPromises = updatedConvoys
        .filter(c => c.axis.includes('Ridge') || c.pickup.includes('Sunil') || c.pickup.includes('Singhdhar') || c.pickup.includes('Manohar'))
        .map(c => {
          const dbId = c.reg || c.id;
          return updateFleetStatus(dbId, 'EN ROUTE', c.passengers, {
            reg: c.reg,
            pickup: c.pickup,
            destination: c.destination,
            capacity: c.capacity
          });
        });
      await Promise.all(persistPromises);
    } catch (err) {
      console.warn('Auto balance persistence error:', err);
    }

    setIsBalancing(false);
    setToastMsg("🔀 FLEET AUTO-BALANCED: Critical ward transport units dispatched & synced.");
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col font-sans text-slate-800 my-auto"
        onClick={(e) => e.stopPropagation()}
        id="modal-fleet-transit"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <Truck className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight text-white uppercase font-sans">
                  CHAMOLI EMERGENCY TRANSIT FLEET &amp; CONVOY TELEMETRY
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  8 TACTICAL UNITS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Uttarakhand Transport Corporation (UTC) &bull; ITBP 1st Bn &bull; IAF Mi-17 Air Wing &bull; NDRF Medical
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            id="btn-close-fleet-modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {toastMsg && (
          <div className="mx-6 mt-4 bg-slate-900 text-white border-l-4 border-blue-500 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>TOTAL ROLLING FLEET</span>
                <Truck className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">
                {convoys.length} <span className="text-xs font-normal text-slate-500">Transports</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium mt-1">
                4 Buses &bull; 2 Bolero 4x4 &bull; 1 Heli &bull; 1 Ambulance
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>TOTAL SEATING LIFT</span>
                <Users className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">
                {totalCapacity} <span className="text-xs font-normal text-slate-500">Seats/Wave</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium mt-1">
                Standby / Staged: {standbyCount} Units ({standbyCapacity} Seats Buffer)
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
                Helang Scree &amp; Air Corridor Monitored
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-900" />
                <h3 className="text-xs font-bold text-slate-900">
                  Evacuation Fleet &amp; Transit Allocation ({filteredConvoys.length} Units)
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Fleets ({convoys.length})
                </button>
                <button
                  onClick={() => setFilterMode('EN_ROUTE')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'EN_ROUTE'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  En Route ({activeTransitCount})
                </button>
                <button
                  onClick={() => setFilterMode('STANDBY')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'STANDBY'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Standby ({standbyCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-y border-slate-200 font-mono-data">
                    <th className="py-2.5 px-3">Vehicle &amp; Operator</th>
                    <th className="py-2.5 px-3">Evacuation Transit Axis</th>
                    <th className="py-2.5 px-3">Load Manifest</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Dispatch Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredConvoys.map((c) => {
                    const loadPct = Math.round((Number(c.passengers || 0) / Number(c.capacity || 1)) * 100);
                    const isNH07Vehicle = (c.axis.includes('NH-07') || c.axis.includes('Alaknanda')) && !c.type.includes('Helicopter');
                    const isRerouted = isRoadBlocked && isNH07Vehicle;
                    
                    const effectiveDestination = isRerouted
                      ? 'Gauchar Airhead Hub (Airlift)'
                      : c.destination;

                    const isEnRoute = c.status === 'EN ROUTE' || c.status === 'EN_ROUTE';
                    let statusClass = isEnRoute
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : (c.status === 'BOARDING'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : (c.status === 'HALTED'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200'));

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className={`w-2 h-2 rounded-full ${isRerouted ? 'bg-amber-500 animate-pulse' : (isEnRoute ? 'bg-emerald-500' : 'bg-slate-400')}`} />
                            <span className="tracking-tight font-bold font-mono">{c.reg}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5 pl-3.5">
                            <span className="text-slate-700 font-medium">{c.type}</span> &bull; <span>{c.operator}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs flex-wrap">
                            <span className="flex items-center gap-1 text-slate-800">
                              <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                              {c.pickup}
                            </span>
                            <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="text-blue-900 font-bold flex items-center gap-1">
                              {effectiveDestination}
                            </span>
                            {isRerouted && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                REROUTED VIA RIDGE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 pl-4">
                            <span>{c.axis}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 min-w-[130px]">
                          <div className="font-mono text-xs text-slate-900 font-semibold flex items-center justify-between">
                            <span>{c.passengers}/{c.capacity}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({loadPct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-200">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                loadPct >= 95 ? 'bg-amber-500' : (loadPct > 0 ? 'bg-blue-600' : 'bg-slate-300')
                              }`}
                              style={{ width: `${Math.min(loadPct, 100)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${statusClass}`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {isEnRoute ? (
                            <button
                              onClick={() => handleConvoyStateUpdate(c.id, 'HALTED', c.passengers)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              title="Halt convoy"
                            >
                              <Square className="w-2.5 h-2.5" /> Halt
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConvoyStateUpdate(c.id, 'EN ROUTE', Math.max(c.passengers, c.capacity))}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              title="Dispatch convoy"
                            >
                              <Play className="w-2.5 h-2.5" /> Dispatch
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">AIS-140 Vehicle Tracking Active</span>
            <span className="text-slate-400">•</span>
            <span>Control Cell: Chamoli District Transport Office (ARTO)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-medium shadow-xs cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Export Driver Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
