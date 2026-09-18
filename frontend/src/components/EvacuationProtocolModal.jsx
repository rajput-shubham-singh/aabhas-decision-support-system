import React, { useEffect, useMemo } from 'react';
import { 
  X, 
  Siren, 
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
  Check
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
    let title = "MODERATE INFILTRATION";
    let colorClass = "text-amber-600";
    let badgeClass = "bg-amber-100 text-amber-900 border-amber-300";

    if (rf > 140) {
      stage = "STAGE-IV";
      title = "CRITICAL CLOUDBURST SATURATION";
      colorClass = "text-red-700";
      badgeClass = "bg-red-100 text-red-900 border-red-300";
    } else if (rf >= 70) {
      stage = "STAGE-III";
      title = "CRITICAL SATURATION TRIGGER";
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
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      id="evacuation-protocol-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shadow-xs">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-white font-mono-data">
                  NATIONAL DISASTER MANAGEMENT FRAMEWORK • OPERATIONAL DISPATCH ORDER
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-red-950/90 text-red-300 border border-red-700/80 px-2 py-0.5 rounded font-mono-data font-bold tracking-wide">
                  STATUTORY INVOCATION: SEC 34 DISASTER MANAGEMENT ACT 2005
                </span>
                <span className="text-[10px] text-slate-400 font-mono-data hidden sm:inline">
                  DISTRICT DISASTER MANAGEMENT AUTHORITY (DDMA) CHAMOLI
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            id="modal-evac-close-x"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trigger Severity</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityBadgeClass}`}>
                    {severityStage}
                  </span>
                </div>
                <div className={`text-base font-black mt-1 ${severityColorClass}`}>
                  {severityTitle}
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Precipitation: <span className="font-bold text-slate-900">{rainfall} mm/24h</span> • Limit Equilibrium Shear
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono-data">
                <span>Bishop FoS: &lt; 0.88</span>
                <span>Pore Pressure: {(14.5 + (rainfall / 180.0) * 36.2).toFixed(1)} kPa</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-red-200 shadow-xs flex flex-col justify-between bg-red-50/20">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Mandatory Displacement Quota</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-mono-data">
                    {redSectorsCount} RED SECTORS
                  </span>
                </div>
                <div className="text-2xl font-black text-red-600 font-mono-data mt-1">
                  {mandatoryQuota.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-600">Souls</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5 truncate" title={redSectorNames}>
                  Active Zones: <span className="font-bold text-slate-800">{redSectorNames}</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center justify-between text-[10px] text-red-700 font-semibold font-mono-data">
                <span>IMMEDIATE CORRIDOR CLEARANCE MANDATED</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tactical Convoy Deployment</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 font-mono-data">
                    30 UNITS READY
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 mt-1 leading-snug">
                  18 Multi-Axle State Transport Buses + 12 ITBP 4x4 Troop Carriers
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Tri-Axis Lift • Total Wave Capacity: <span className="font-bold text-slate-900">1,620 Seats</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono-data">
                <span>Staging: Marwari / Cantt / Gauchar</span>
                <span className="text-emerald-700 font-bold">100% FUEL RESERVE</span>
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
                      SECTION A: STRATEGIC EVACUATION VECTORS &amp; ROUTE STATUS
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-data">NH-07 / NH-109 ARTERIES</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-y border-slate-200">
                        <th className="py-2 px-2.5">Evacuation Vector / Axis</th>
                        <th className="py-2 px-2.5">Clearance Status</th>
                        <th className="py-2 px-2.5">Assigned Convoys &amp; Destination</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Joshimath ➔ Gopeshwar HQ</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">NH-07 Upper Corridor (14.5 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-data">
                            <CheckCircle2 className="w-3 h-3" /> OPEN / MONITORED
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          <div className="font-semibold text-slate-900">Convoys Alpha &amp; Bravo (14 Buses)</div>
                          <div className="text-[10px] text-slate-500">Target: Gopeshwar Sports Complex (3,500 Beds)</div>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isRoadBlocked ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`}></span>
                            <span>Helang Scree ➔ Pipalkoti</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">NH-07 Lower Axis (8.2 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          {isRoadBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 font-mono-data">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> BLOCKED / DIVERSION ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono-data">
                              RESTRICTED / SINGLE-LANE
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          {isRoadBlocked ? (
                            <div>
                              <div className="font-bold text-red-700">Reroute via Gopeshwar Mega-Hub</div>
                              <div className="text-[10px] text-slate-500">BRO Dozers &amp; Army Sappers clearing scree</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-slate-900">Convoy Charlie (4 Buses + 6 ITBP 4x4s)</div>
                              <div className="text-[10px] text-slate-500">Target: Pipalkoti Center (1,200 Beds)</div>
                            </div>
                          )}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Karnaprayag ➔ Gauchar Airhead</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">NH-07 South Arterial (22.0 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-data">
                            <CheckCircle2 className="w-3 h-3" /> CLEAR ALL-WEATHER
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          <div className="font-semibold text-slate-900">Convoy Delta &amp; IAF Mi-17 V5 Staging</div>
                          <div className="text-[10px] text-slate-500">Target: Gauchar Civil Airstrip (5,000 Beds)</div>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Tharali ➔ Gairsain Hub</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal pl-3.5">NH-109 Pindar Valley Route (28.4 km)</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-data">
                            <CheckCircle2 className="w-3 h-3" /> OPEN VIA NH-109
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-700">
                          <div className="font-semibold text-slate-900">SDRF Shuttles &amp; State Mini-Buses</div>
                          <div className="text-[10px] text-slate-500">Target: Gairsain Bhararisain (4,000 Beds)</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                <span className="font-semibold text-slate-800">GREEN CORRIDOR PROTOCOL:</span>
                <span>Uttarakhand State Police Traffic Control: Zero civilian private ingress permitted on NH-07</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      SECTION B: ARMED FORCES TACTICAL TASKING
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-data">JOINT OPS CELL</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg border border-red-100 bg-red-50/40">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        NDRF 8th Battalion (Team Bravo)
                      </div>
                      <span className="text-[9px] font-mono-data bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold">
                        VHF CH-04
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      Rapid extraction at <span className="font-semibold text-slate-900">Upper Sunil &amp; Singhdhar scarps</span>. 4 platoons equipped with hydraulic cutters, stretcher teams &amp; canine search units.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-blue-100 bg-blue-50/40">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Indian Army 9th Mountain Brigade
                      </div>
                      <span className="text-[9px] font-mono-data bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                        TRIDENT-NET
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      High-altitude engineering clearance, pontoon bridging &amp; JCB crawler escorts along Alaknanda gorge.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        ITBP 1st Bn Base &amp; Medical Triage
                      </div>
                      <span className="text-[9px] font-mono-data bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        HIMVEER-01
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      Medical triage &amp; immediate transit intake at Cantonment Spur &amp; Ravigram staging center. 35 ICU cots, 80 trauma beds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono-data">
                <span>Direct Tactical Command: DIG NDRF</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> SAT-PHONE LINK VERIFIED
                </span>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION C: CITIZEN EARLY-WARNING &amp; CELL BROADCAST DISPATCH
                </h3>
              </div>
              <span className="text-[10px] font-mono-data bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                12,480 REGISTERED SIMs IN GEOFENCE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 bg-slate-900 text-white rounded-lg p-3.5 border border-slate-800 font-mono-data text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Radio className="w-3 h-3 animate-pulse" /> COMMON ALERTING PROTOCOL (CAP-INDIA)
                    </span>
                    <span>SMS FLASH / CELL BROADCAST PUSH</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded border border-slate-700 text-amber-200 text-xs leading-relaxed">
                    "CHAMOLI DISTRICT DISASTER AUTHORITY ALERT: Immediate evacuation mandated for Ward 3 &amp; 4 ({redSectorNames.slice(0, 45)}...). Board designated state convoys at Helipad ground. Follow police escort to Gopeshwar &amp; Pipalkoti shelters. Emergency Helpline: 1070 / 1077."
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Language: Multi-Lingual (Hindi / Garhwali / English)</span>
                  <span className="text-emerald-400 font-bold">BTS Broadcast Ready</span>
                </div>
              </div>

              <div className="md:col-span-4 bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 uppercase">Alert Channels Armed:</div>
                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Mechanical Sirens:</span>
                      <span className="font-bold font-mono-data text-red-600">14 Active (520 Hz)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Geofence Reach:</span>
                      <span className="font-bold font-mono-data text-emerald-700">99.4% BTS Coverage</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Ham Radio Net:</span>
                      <span className="font-bold font-mono-data text-slate-900">145.500 MHz FM</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono-data">
                  Authorized by District Magistrate Chamoli
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-slate-900 px-5 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">

          <div className="text-left">
            <div className="text-[11px] text-slate-300 font-mono-data font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Authentication Hash: <span className="text-amber-400">MHA-NDRF-CHM-2026-ALPHA</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-data mt-0.5">
              Digital Clearance Logged • Immediate Legal Effect under DM Act 2005
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              id="btn-modal-export-plan"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Official Action Plan</span>
            </button>

            <button
              onClick={onAuthorizeDispatch}
              disabled={isDispatching}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg border border-red-500 flex items-center gap-2 cursor-pointer transition-all hover:shadow-red-900/30"
              id="btn-modal-authorize-dispatch"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>AUTHORIZING DISPATCH...</span>
                </>
              ) : (
                <>
                  <Siren className="w-4 h-4 text-white animate-bounce" />
                  <span>AUTHORIZE IMMEDIATE CORRIDOR DISPATCH</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
