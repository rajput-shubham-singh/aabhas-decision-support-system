import React, { useEffect, useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Truck, 
  Users, 
  Radio, 
  Printer, 
  Send, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  FileText, 
  Compass,
  AlertOctagon,
  RefreshCw,
  Clock,
  Check,
  Building2,
  Lock
} from 'lucide-react';

export default function EvacuationProtocolModal({ 
  isOpen, 
  onClose, 
  rainfall = 65, 
  habitations = [], 
  kpiData = {}, 
  isRoadBlocked = false,
  onAuthorizeDispatch,
  isDispatching = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { 
    severityTitle, 
    severityStage, 
    severityColorClass, 
    severityBadgeClass,
    mandatoryQuota, 
    redSectorsCount, 
    redSectorNames 
  } = useMemo(() => {
    const rf = Number(rainfall) || 0;

    let stage = "STAGE-II";
    let title = "MODERATE WATCH ADVISORY";
    let colorClass = "text-amber-700";
    let badgeClass = "bg-amber-100 text-amber-900 border-amber-300";

    if (rf > 140) {
      stage = "STAGE-IV";
      title = "CRITICAL CLOUDBURST SATURATION";
      colorClass = "text-red-700";
      badgeClass = "bg-red-100 text-red-900 border-red-300";
    } else if (rf >= 70) {
      stage = "STAGE-III";
      title = "CRITICAL EVACUATION DIRECTIVE";
      colorClass = "text-red-600";
      badgeClass = "bg-red-50 text-red-800 border-red-300";
    } else if (rf < 30) {
      stage = "STAGE-I";
      title = "BASELINE ADVISORY MONITORING";
      colorClass = "text-emerald-700";
      badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    }

    const redWards = (habitations || []).filter(w => 
      w.status === 'RED' || w.zone === 'RED' || w.status === 'CRITICAL' || w.hazard_tier === 'CRITICAL_RED'
    );

    const quota = redWards.length > 0
      ? redWards.reduce((sum, w) => sum + (w.population || w.civilians || 880), 0)
      : Math.round(1800 + (rf * 32));

    const sectorNames = redWards.length > 0 
      ? redWards.map(w => w.name || w.ward_no).join(', ')
      : "Upper Sunil, Singhdhar Scarp, Helang Axis";

    return {
      severityTitle: title,
      severityStage: stage,
      severityColorClass: colorClass,
      severityBadgeClass: badgeClass,
      mandatoryQuota: quota,
      redSectorsCount: redWards.length || (rf >= 70 ? 3 : 2),
      redSectorNames: sectorNames
    };
  }, [rainfall, habitations]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      id="evacuation-protocol-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                  DDMA EVACUATION DIRECTIVE
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Order Ref: DDMA/CHM/2026-EVAC
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Operational Evacuation &amp; Transit Dispatch Order
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Issued under Section 34, Disaster Management Act 2005 &bull; Joshimath Sector
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer transition-colors"
              title="Close Dialog"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 flex-1">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trigger Severity</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityBadgeClass}`}>
                    {severityStage}
                  </span>
                </div>
                <div className={`text-base font-bold mt-1 ${severityColorClass}`}>
                  {severityTitle}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Precipitation: <span className="font-bold text-slate-900">{rainfall} mm/24h</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Slope Saturation Threshold</span>
                <span className="text-slate-700 font-semibold">Active Monitoring</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-red-200 shadow-xs flex flex-col justify-between bg-red-50/20">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Displacement Priority</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-mono">
                    {redSectorsCount} RED SECTORS
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-600 font-mono mt-1">
                  {mandatoryQuota.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-600">Citizens</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 truncate" title={redSectorNames}>
                  Target Wards: <span className="font-semibold text-slate-800">{redSectorNames}</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center justify-between text-[10px] text-red-700 font-semibold">
                <span>Immediate Corridor Staging Initiated</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evacuation Fleet Deployment</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    8 UNITS READY
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                  5 En Route Convoys &bull; 3 Standby Units
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  UTC Buses, Bolero 4x4s, Ambulances &amp; Airhead
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Staging: Helipad / Bus Stand / Cantt</span>
                <span className="text-emerald-700 font-semibold">Operational</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-900" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      SECTION A: EVACUATION AXES &amp; RELIEF CORRIDORS
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">NH-07 Arterial Grid</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-y border-slate-200">
                        <th className="py-2 px-2.5">Corridor Axis</th>
                        <th className="py-2 px-2.5">Route Status</th>
                        <th className="py-2 px-2.5">Target Relief Camp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Joshimath ➔ Gopeshwar</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">Alaknanda Highway (32 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> OPEN / ESCORTED
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          <div className="font-semibold text-slate-900">Gopeshwar Stadium Hub</div>
                          <div className="text-[10px] text-slate-500">District Mega-Hub (3,500 Beds)</div>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isRoadBlocked ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <span>Helang ➔ Pipalkoti</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">NH-07 Lower Axis (18 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          {isRoadBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> BLOCKED AT KM-48
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> CLEAR ALL-WEATHER
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          {isRoadBlocked ? (
                            <div>
                              <div className="font-bold text-red-700">Diverted to Gopeshwar &amp; Gauchar</div>
                              <div className="text-[10px] text-slate-500">Debris clearance ongoing at Helang Chute</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-slate-900">Pipalkoti Staging Center</div>
                              <div className="text-[10px] text-slate-500">Mid-Valley Hub (1,200 Beds)</div>
                            </div>
                          )}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Joshimath ➔ Gauchar Airhead</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">Airhead / Helipad Link</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <CheckCircle2 className="w-3 h-3 text-cyan-600" /> AIRLIFT READY
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          <div className="font-semibold text-slate-900">Gauchar Airstrip Center</div>
                          <div className="text-[10px] text-slate-500">Critical Triage (2,000 Beds)</div>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Upper Wards ➔ Cantt Spur</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">Upper Ridge Road (1.2 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> IMMEDIATE REFUGE
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          <div className="font-semibold text-slate-900">Military Cantt Spur</div>
                          <div className="text-[10px] text-slate-500">Immediate Shelter (850 Beds)</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                <span className="font-semibold text-slate-800">GREEN CORRIDOR PROTOCOL:</span>
                <span>District Police priority escort for state buses &amp; ambulances on NH-07</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-900" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      SECTION B: JOINT AGENCY TASK ALLOCATION
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">Chamoli DDMA</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg border border-red-100 bg-red-50/30">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        NDRF 8th Battalion
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-semibold">
                        Search &amp; Rescue
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      Rapid evacuation teams deployed in <span className="font-semibold text-slate-900">Sunil &amp; Singhdhar scarps</span> with stretcher teams and equipment.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-blue-100 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Indian Army &amp; ITBP Units
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                        Ridge &amp; Transit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      Medical dressing stations active at Military Cantt Spur and 4x4 troop carriers assisting uphill transfers.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/30">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        SDRF &amp; State Transport (UTC)
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        Highway Convoys
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      Passenger buses staged at Joshimath Helipad and Lower Basti for organized downhill transport.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Command Coordination: EOC Gopeshwar</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Communication Channels Active
                </span>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION C: CITIZEN WARNING &amp; PUBLIC ADVISORY DISPATCH
                </h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                ~12,480 Citizens in Sector
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 border-b border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                      <Radio className="w-3 h-3" /> Common Alerting Protocol (C-DOT CAP)
                    </span>
                    <span>SMS &amp; Cell Broadcast Advisory</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200 text-slate-800 text-xs leading-relaxed">
                    "CHAMOLI DISTRICT DISASTER AUTHORITY ALERT: Evacuation directive in effect for monitored zones ({redSectorNames.slice(0, 45)}...). Please board designated buses at Helipad or proceed to Military Cantt / Gopeshwar relief shelters. Emergency Helpline: 1070 / 1077."
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Languages: Hindi &bull; Garhwali &bull; English</span>
                  <span className="text-emerald-700 font-semibold">Ready for Transmission</span>
                </div>
              </div>

              <div className="md:col-span-4 bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 uppercase">Warning Systems Linked:</div>
                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Municipal Sirens:</span>
                      <span className="font-semibold text-slate-900">6 Linked Poles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Mobile BTS Towers:</span>
                      <span className="font-semibold text-slate-900">4 Stations (BSNL/Jio/Airtel)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Public PA Systems:</span>
                      <span className="font-semibold text-slate-900">Mobile Vans Active</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  Authorized under DDMA Chamoli
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">

          <div className="text-left">
            <div className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Authorized by District Magistrate / DDMA Chamoli</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Statutory Evacuation Order &bull; Section 34 Disaster Management Act 2005
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              id="btn-modal-export-plan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 inline mr-1" />
              <span>Export Order (PDF)</span>
            </button>

            <button
              onClick={onAuthorizeDispatch}
              disabled={isDispatching}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
              id="btn-modal-authorize-dispatch"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Convoys...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Authorize &amp; Dispatch Evacuation</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
