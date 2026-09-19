import React, { useState } from 'react';
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
  Navigation,
  Tent,
  MapPin,
  Clock,
  Phone,
  Zap,
  X,
  Info
} from 'lucide-react';
import { RELIEF_CAMPS } from '../data/campsData.js';

export default function EvacuationEngine({ campsData = [], rainfall = 35, isRoadBlocked = false, onOpenLogisticsModal }) {
  const [selectedCampId, setSelectedCampId] = useState(null);

  const activeCamps = (campsData && campsData.length > 0) ? campsData.map((liveCamp, idx) => {
    const fallback = RELIEF_CAMPS.find(c => c.id === liveCamp.camp_code || c.id === liveCamp.id || c.name === liveCamp.name) || RELIEF_CAMPS[idx] || {};
    return {
      ...fallback,
      id: liveCamp.camp_code || fallback.id || `CAMP-0${idx + 1}`,
      name: liveCamp.name || fallback.name,
      tag: liveCamp.tag || fallback.tag,
      route: liveCamp.route_axis || fallback.route,
      capacity: Number(liveCamp.bed_capacity || liveCamp.capacity || fallback.capacity || 1000),
      occupied: Number(liveCamp.occupied_beds !== undefined ? liveCamp.occupied_beds : (liveCamp.occupied !== undefined ? liveCamp.occupied : fallback.occupied || 0)),
      status: liveCamp.status || fallback.status,
      medicalTeam: liveCamp.medical_team || fallback.medicalTeam,
      details: fallback.details || {}
    };
  }) : RELIEF_CAMPS;

  const totalCapacity = activeCamps.reduce((sum, c) => sum + Number(c.capacity || 0), 0);
  const totalOccupied = activeCamps.reduce((sum, c) => sum + Number(c.occupied || 0), 0);
  const totalVacant = Math.max(0, totalCapacity - totalOccupied);
  const globalOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const selectedCamp = activeCamps.find(c => c.id === selectedCampId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 font-sans text-slate-800 shadow-xs">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-200 pb-4 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse"></span>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 uppercase">
              CHAMOLI DISTRICT RELIEF CAMP LOGISTICS &amp; CARRYING CAPACITY
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              DDMA Chamoli Grid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional Relief Shelters &amp; Buffer Capacity — Joshimath-Chamoli Corridor
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-500 font-semibold">TOTAL CAPACITY:</span>
            <span className="font-bold text-slate-900 text-sm">7,550 Beds</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-semibold">CURRENT EVACUATED:</span>
            <span className="font-bold text-red-600 text-sm">2,530 Displaced</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-semibold">VACANT SURGE BUFFER:</span>
            <span className="font-bold text-emerald-700 text-sm">5,020 Beds</span>
          </div>

          {onOpenLogisticsModal && (
            <button
              onClick={onOpenLogisticsModal}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 shadow-xs border border-blue-900 cursor-pointer transition-all whitespace-nowrap"
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
          className="bg-rose-50 border-2 border-rose-400 text-rose-900 px-4 py-3 rounded-lg shadow-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 mb-4"
          id="banner-road-blockage-warning"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <div className="text-xs font-black uppercase tracking-wide text-rose-900 flex flex-wrap items-center gap-2">
              <span>🚨 NH-07 HIGHWAY CORRIDOR SEVERED: KM-48 HELANG ROCKFALL BLOCKAGE</span>
              <span className="text-[10px] bg-rose-200 text-rose-900 border border-rose-400 px-1.5 py-0.2 rounded font-mono font-bold">
                GROUND TRANSIT TO PIPALKOTI INTERRUPTED
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Direct highway convoys to Pipalkoti halted. Rerouting urgent evacuations to Upper Cantt Ridge Shelter and Gauchar Airstrip Hub for tactical airlift triage.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>TOTAL GRID CAPACITY</span>
            <Tent className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-slate-900">
              {totalCapacity.toLocaleString()}
            </span>
            <span className="text-xs text-slate-600 font-semibold">Total Beds</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>4 Tactical Relief Hubs</span>
            <span className="font-semibold text-blue-700">Chamoli Sector</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>CURRENT EVACUATED</span>
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-red-600">
              {totalOccupied.toLocaleString()}
            </span>
            <span className="text-xs text-slate-600 font-semibold">Displaced Citizens</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-300 ${
                globalOccupancyPct >= 80 ? 'bg-red-600' :
                globalOccupancyPct >= 50 ? 'bg-amber-500' :
                'bg-blue-600'
              }`}
              style={{ width: `${globalOccupancyPct}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>VACANT SURGE BUFFER</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-emerald-700">
              {totalVacant.toLocaleString()}
            </span>
            <span className="text-xs text-slate-600 font-semibold">Available Beds</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{100 - globalOccupancyPct}% Surge Headroom</span>
            <span className="font-semibold text-emerald-700">Uncompromised</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>NETWORK LOAD</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-indigo-800">
              {globalOccupancyPct}%
            </span>
            <span className="text-xs text-slate-600 font-semibold">Occupancy Rate</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Sphere Standard Ready</span>
            <span className="font-semibold text-indigo-700">All 4 Camps Active</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-900" />
            4 Core Functional Evacuation Hubs (7,550 Beds Grid)
          </span>
          <span className="text-[11px] font-normal text-slate-500 font-mono">
            Click any camp to view on-ground logistics &amp; administration details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeCamps.map((camp) => {
            const occPct = Math.round((camp.occupied / camp.capacity) * 100);
            const vacantBeds = camp.capacity - camp.occupied;
            const isSelected = selectedCampId === camp.id;
            const isPipalkotiBlocked = camp.id === 'CAMP-02' && isRoadBlocked;

            let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
            let progressBarClass = 'bg-emerald-500';

            if (camp.status === 'HIGH OCCUPANCY' || occPct >= 70) {
              statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
              progressBarClass = 'bg-amber-500';
            } else if (camp.status === 'STANDBY BUFFER') {
              statusBadgeClass = 'bg-cyan-50 text-cyan-800 border-cyan-300';
              progressBarClass = 'bg-cyan-500';
            }

            if (isPipalkotiBlocked) {
              statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
              progressBarClass = 'bg-rose-600';
            }

            return (
              <div 
                key={camp.id}
                onClick={() => setSelectedCampId(camp.id)}
                className={`bg-white border rounded-xl p-4 pb-4 h-auto shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
                  isPipalkotiBlocked
                    ? 'border-rose-300 bg-rose-50/10'
                    : isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0 shadow-xs">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 21 9-18 9 18H3z" />
                        <path d="M12 3v18" />
                        <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{camp.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isPipalkotiBlocked
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : camp.status === 'HIGH OCCUPANCY' || occPct >= 70
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isPipalkotiBlocked ? 'GROUND BLOCKED' : camp.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5 group-hover:text-blue-700 transition-colors">{camp.name}</h4>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">
                      {camp.tag}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <Navigation className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate" title={camp.route}>{camp.route}</span>
                    </div>
                  </div>

                  <div className="inline-block">
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 w-fit">
                      <Tent className="w-3 h-3 text-slate-500" />
                      {camp.bedType}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-semibold text-slate-700">
                        Occupied: <strong className="text-slate-900">{camp.occupied.toLocaleString()}</strong>
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        / {camp.capacity.toLocaleString()} ({occPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${progressBarClass}`}
                        style={{ width: `${Math.min(100, occPct)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono pt-0.5">
                      <span className="text-emerald-700 font-bold">
                        {vacantBeds.toLocaleString()} Vacant Beds
                      </span>
                      <span className="text-slate-400">
                        Surge Ready
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="bg-red-50/40 p-2.5 rounded-lg border border-red-100/80">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Stethoscope className="w-3.5 h-3.5 text-red-600" />
                        Medical Support
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {camp.medicalTeam}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Doctors &amp; Paramedics On Duty
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Essential Supplies
                      </span>
                      <div className="flex items-center justify-between text-slate-700 text-[11px]">
                        <span>💧 {camp.waterStock}</span>
                        <span>🍱 {camp.rationStock}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-semibold group-hover:text-blue-900">
                  <span>View Ground Logistics</span>
                  <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform font-bold">→</span>
                </div>

                {isPipalkotiBlocked && (
                  <div className="mt-2 pt-1.5 border-t border-rose-200 text-[10px] text-rose-700 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>Convoys Rerouted to Cantt &amp; Gauchar</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedCamp && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          id="camp-detail-modal"
          onClick={() => setSelectedCampId(null)}
        >
          <div 
            className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
                      {selectedCamp.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedCamp.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedCamp.tag} • {selectedCamp.route}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCampId(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 text-base font-bold cursor-pointer transition-colors"
                  title="Close Dialog"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-800 flex-1">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-semibold text-slate-700">
                    Live Occupancy Status:
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedCamp.occupied.toLocaleString()} / {selectedCamp.capacity.toLocaleString()} Beds ({Math.round((selectedCamp.occupied / selectedCamp.capacity) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      selectedCamp.occupied / selectedCamp.capacity >= 0.7 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.round((selectedCamp.occupied / selectedCamp.capacity) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-600 font-mono">
                  <span className="text-emerald-700 font-semibold">
                    {selectedCamp.capacity - selectedCamp.occupied} Beds Available For Intake
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                    Bedding: {selectedCamp.bedType}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Camp In-Charge Officer
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {selectedCamp.details?.incharge}
                  </div>
                  <div className="text-[11px] text-blue-700 font-mono mt-1 font-semibold">
                    Phone: {selectedCamp.details?.contact}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Medical &amp; Trauma Staffing
                  </div>
                  <div className="text-slate-800 text-[11px] leading-relaxed">
                    {selectedCamp.details?.medicalTeam}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Potable Water &amp; Reserves
                  </div>
                  <div className="text-slate-800 text-[11px] leading-relaxed">
                    {selectedCamp.details?.waterStock}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Food Supply &amp; Kitchen
                  </div>
                  <div className="text-slate-800 text-[11px] leading-relaxed">
                    {selectedCamp.details?.foodSupply}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider mb-1">
                    Power &amp; Energy Backup
                  </div>
                  <div className="text-slate-800 text-[11px] leading-relaxed">
                    {selectedCamp.details?.powerBackup}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider mb-1">
                    Sanitation &amp; Hygiene Units
                  </div>
                  <div className="text-slate-800 text-[11px] leading-relaxed">
                    {selectedCamp.details?.sanitation}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">Tactical Deployment Notes: </span>
                <span>{selectedCamp.details?.notes}</span>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                Chamoli DDMA Ground Logistics Matrix
              </span>
              <button
                onClick={() => setSelectedCampId(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
