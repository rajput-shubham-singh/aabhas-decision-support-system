import React, { useState } from 'react';
import { 
  X, 
  Tent, 
  Bed, 
  Droplets, 
  HeartPulse, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Layers, 
  Printer, 
  Share2, 
  Activity,
  Award
} from 'lucide-react';

export default function ReliefLogisticsModal({ 
  isOpen, 
  onClose, 
  camps = [], 
  relocationPlan = [], 
  rainfall = 65 
}) {
  const [activeViewMode, setActiveViewMode] = useState('ALL');

  if (!isOpen) return null;

  const totalCapacity = camps.reduce((acc, c) => acc + (c.total_bed_capacity || c.capacity || 0), 0);
  const totalLiveOcc = camps.reduce((acc, c) => acc + (c.live_occupancy || c.occupancy || 0), 0);
  const totalFreeBeds = Math.max(0, totalCapacity - totalLiveOcc);
  const totalDisplaced = relocationPlan.reduce((acc, p) => acc + (p.displaced_pop || 0), 0);
  const overflowCount = relocationPlan.filter(p => p.is_overflow_split).length;

  const filteredPlan = activeViewMode === 'OVERFLOW' 
    ? relocationPlan.filter(p => p.is_overflow_split)
    : relocationPlan;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150" id="relief-logistics-modal">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">

        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-800 text-amber-400">
              <Tent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wide uppercase">
                  MULTI-VECTOR CARRYING CAPACITY &amp; RELOCATION MANIFEST
                </h3>
                <span className="text-[10px] bg-emerald-900/90 text-emerald-300 border border-emerald-600 px-2 py-0.5 rounded font-mono-data font-bold">
                  AUTONOMOUS CONSTRAINED MATCHING ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-data">
                Sovereign MHA Logistics Framework | Real-Time Optimization Engine (Rainfall: {rainfall} mm/24h)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            id="btn-close-logistics-modal"
            title="Close Manifest"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Shelter Grid</div>
            <div className="text-base font-black text-slate-900 font-mono-data mt-0.5">{totalCapacity.toLocaleString()} Beds</div>
            <div className="text-[10px] text-slate-500 font-medium">{camps.length} Strategic Regional Bedrock Hubs</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-blue-900">Total Live Occupancy</div>
            <div className="text-base font-black text-blue-900 font-mono-data mt-0.5">
              {totalLiveOcc.toLocaleString()} <span className="text-xs font-normal text-slate-500">({Math.round((totalLiveOcc / Math.max(1, totalCapacity)) * 100)}%)</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{totalDisplaced} routed from red/amber</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Remaining Bed Vacancies</div>
            <div className="text-base font-black text-emerald-700 font-mono-data mt-0.5">
              {totalFreeBeds.toLocaleString()} Free
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Un-saturated safe capacity</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-amber-700">Overflow Partitions</div>
            <div className="text-base font-black text-amber-700 font-mono-data mt-0.5">
              {overflowCount} Cohorts Split
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Auto-distributed by RPI rank</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-900" />
                1. Safe Bedrock Reception Camps Multi-Vector Infrastructure
              </h4>
              <span className="text-[11px] font-mono-data text-slate-500">
                Formula: (Beds×0.4) + (Water×0.3) + (Medical×0.2) + (Access×0.1)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {camps.map((camp) => {
                const totalBeds = camp.total_bed_capacity || camp.capacity || 100;
                const occ = camp.live_occupancy !== undefined ? camp.live_occupancy : (camp.occupancy || 0);
                const occPct = camp.occupancy_pct !== undefined ? camp.occupancy_pct : Math.round((occ / totalBeds) * 100);
                const score = camp.suitability_score !== undefined ? camp.suitability_score : 85;
                const isFull = occPct >= 100;

                return (
                  <div key={camp.id} className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between space-y-3">

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{camp.name}</span>
                          {isFull && (
                            <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-red-200">
                              CAPACITY 100%
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono-data">{camp.safe_corridor} • {camp.authority}</div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Suitability</div>
                        <div className={`text-sm font-black font-mono-data px-2 py-0.5 rounded border inline-block ${
                          score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          score >= 60 ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>
                          {score}/100
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                        <span>Bed Capacity Allocation</span>
                        <span className="font-mono-data font-bold">{occ} / {totalBeds} ({occPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            occPct >= 100 ? 'bg-red-600' : (occPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500')
                          }`}
                          style={{ width: `${Math.min(100, occPct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[10px]">

                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-600" /> Water LPCD
                        </div>
                        <div className="font-mono-data font-bold text-slate-900 mt-0.5">
                          {camp.lpcd_live ? `${camp.lpcd_live} L/cap` : `${(camp.water_available_liters_day || 50000).toLocaleString()} L`}
                        </div>
                        <div className="text-[9px] text-blue-800 font-semibold">{camp.water_status || "OPTIMAL"}</div>
                      </div>

                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-600" /> Sanitation
                        </div>
                        <div className="font-mono-data font-bold text-slate-900 mt-0.5">
                          {camp.sanitation_units || 30} Units
                        </div>
                        <div className="text-[9px] text-emerald-800 font-semibold">
                          {camp.persons_per_toilet ? `${camp.persons_per_toilet}:1 Ratio` : "Norm <25:1"}
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium flex items-center gap-1">
                          <HeartPulse className="w-3 h-3 text-red-600" /> Medical
                        </div>
                        <div className="font-mono-data font-bold text-slate-900 mt-0.5">
                          {camp.medical_personnel || 8} Doctors
                        </div>
                        <div className="text-[9px] text-red-800 font-semibold truncate">{camp.medical_status || "TRAUMA"}</div>
                      </div>

                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-600" /> Access
                        </div>
                        <div className="font-mono-data font-bold text-slate-800 mt-0.5 truncate">
                          {camp.road_accessibility || "PAVED"}
                        </div>
                        <div className="text-[9px] text-slate-600 font-semibold">Road Corridor</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-900" />
                  2. Live Habitation Relocation Manifest (Constrained Optimization Output)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Automated greedy capacity-constrained matching with automatic overflow cohort splitting
                </p>
              </div>

              <div className="flex items-center space-x-1.5 text-xs">
                <button
                  onClick={() => setActiveViewMode('ALL')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                    activeViewMode === 'ALL' ? 'bg-blue-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Routes ({relocationPlan.length})
                </button>
                <button
                  onClick={() => setActiveViewMode('OVERFLOW')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeViewMode === 'OVERFLOW' ? 'bg-amber-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-300" />
                  <span>Overflow Splits ({overflowCount})</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Origin Ward (Distressed Source)</th>
                      <th className="p-2.5">Hazard Tier</th>
                      <th className="p-2.5">Destination Safe Camp</th>
                      <th className="p-2.5">Transit Safe Corridor</th>
                      <th className="p-2.5 text-right">Allotted Citizens</th>
                      <th className="p-2.5 text-right">Camp Post-Occ %</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPlan.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                          No distressed sectors require active relocation under current baseline conditions.
                        </td>
                      </tr>
                    ) : (
                      filteredPlan.map((row, idx) => {
                        const isRed = row.hazard_tier === 'CRITICAL_RED' || row.priority === 'URGENT';
                        const isSplit = row.is_overflow_split;

                        return (
                          <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${isSplit ? 'bg-amber-50/20' : ''}`}>
                            <td className="p-2.5 font-mono-data font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{row.from_ward}</span>
                                {isSplit && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-mono-data font-bold">
                                    SPLIT OVERFLOW
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isRed ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {row.hazard_tier || (isRed ? 'CRITICAL_RED' : 'WARNING_AMBER')}
                              </span>
                            </td>
                            <td className="p-2.5 font-semibold text-blue-950">
                              {row.to_camp}
                            </td>
                            <td className="p-2.5 text-slate-600 font-mono-data text-[11px]">
                              {row.safe_corridor}
                            </td>
                            <td className="p-2.5 text-right font-mono-data font-black text-slate-900">
                              {row.displaced_pop?.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right font-mono-data">
                              <span className={`font-bold ${row.camp_post_occupancy_pct >= 100 ? 'text-red-600' : 'text-slate-700'}`}>
                                {row.camp_post_occupancy_pct}%
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                                row.priority === 'URGENT' ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800'
                              }`}>
                                <CheckCircle2 className="w-3 h-3" />
                                {row.priority === 'URGENT' ? 'DISPATCHED' : 'ALLOCATED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Telemetry synchronizing with Chamoli Emergency Operations Center (EOC).</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
