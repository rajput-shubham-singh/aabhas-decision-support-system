import React, { useEffect, useMemo } from 'react';
import { 
  X, 
  Activity, 
  Gauge, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Radio, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Droplets, 
  MapPin, 
  Compass,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';

export default function GeotechnicalModal({ sector, rainfall = 35, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const geotech = useMemo(() => {
    if (!sector) return null;
    const rf = Number(rainfall) || 0;
    const rpi = sector.calculatedRpi ?? (sector.rpi ? Math.round(sector.rpi * 100) : sector.baseRpi || 65);

    let baseFoS = 0.92;
    if (sector.id === 'sec-ravigram') baseFoS = 1.48;
    else if (sector.id === 'sec-tharali') baseFoS = 1.25;
    else if (sector.id === 'sec-karnaprayag') baseFoS = 1.15;
    else if (sector.id === 'sec-helang') baseFoS = 0.88;
    else if (sector.id === 'sec-joshimath' || sector.id === 'sec-singhdhar' || sector.id === 'sec-sunil') baseFoS = 0.82;

    const dynamicFoS = Number((baseFoS - (rf / 180) * 0.28).toFixed(2));
    const isCriticalFoS = dynamicFoS < 1.0;
    const isWarningFoS = dynamicFoS >= 1.0 && dynamicFoS <= 1.25;

    const basePoreKpa = sector.id === 'sec-ravigram' ? 12.0 : 32.5;
    const dynamicPoreKpa = Number((basePoreKpa + (rf / 180) * 36.8).toFixed(1));
    const poreSaturationPct = Math.min(99, Math.round(32 + (rf / 180) * 65));

    const baseInSar = sector.id === 'sec-ravigram' ? -4.2 : sector.id === 'sec-tharali' ? -22.0 : sector.id === 'sec-karnaprayag' ? -34.5 : -56.0;
    const dynamicInSar = Number((baseInSar - (rf / 180) * 42.0).toFixed(1));

    let emsGrade = "Grade G4 - Very Severe Damage";
    let emsBadgeClass = "bg-red-100 text-red-800 border-red-300";
    let emsDesc = "Shear cracks > 50mm, structural foundation detachment, unreinforced masonry failure";

    if (sector.id === 'sec-ravigram' || dynamicFoS > 1.3) {
      emsGrade = "Grade G1 - Negligible Damage";
      emsBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
      emsDesc = "Hairline plaster micro-cracks (< 1mm), no structural bedrock compromise";
    } else if (isWarningFoS || dynamicFoS >= 1.0) {
      emsGrade = "Grade G3 - Substantial Damage";
      emsBadgeClass = "bg-amber-100 text-amber-800 border-amber-300";
      emsDesc = "Fractures 15-30mm across load-bearing lintels, continuous ground heave displacement";
    }

    let lithology = "Main Central Thrust (MCT-II) Shear Zone • Gneissic Colluvium Debris over Fractured Quartzite Bedrock";
    let hydrogeology = "Marwari Aquifer Subsurface Flow Fault Axis • Seepage Velocity: 16.4 L/sec";

    if (sector.id === 'sec-helang') {
      lithology = "Alaknanda Deep Gorge Scree Chute • Highly Fractured Biotite Schist with Active Debris Flow Layer";
      hydrogeology = "Alaknanda Upper Hydrological Basin • Direct Riverine Toe Erosion & Groundwater Infiltration";
    } else if (sector.id === 'sec-karnaprayag') {
      lithology = "Alaknanda-Pindar Confluence Scarp • Fluvial Terrace Gravels & Silt Overburden on Sinking Bank";
      hydrogeology = "High Toe Shear Aquifer Infiltration • Continuous Groundwater Table Recharge";
    } else if (sector.id === 'sec-tharali') {
      lithology = "Pindar River Basin Terrace • Glacio-fluvial Sediment Layer over Moderately Weathered Bedrock";
      hydrogeology = "Ephemeral Cloudburst Drainage Gullies • Water Runoff Accumulation Zone";
    } else if (sector.id === 'sec-ravigram') {
      lithology = "Ravigram Bedrock Ridge • Intact Granite Gneiss Hard Spur (Minimal Subsurface Shear Drift)";
      hydrogeology = "Low Permeability Intact Rock Formation • Natural Controlled Drainage Slope";
    }

    const waterTableDepthM = Number((-7.8 + (rf / 180) * 4.6).toFixed(1));

    return {
      rpi,
      dynamicFoS,
      isCriticalFoS,
      isWarningFoS,
      dynamicPoreKpa,
      poreSaturationPct,
      dynamicInSar,
      emsGrade,
      emsBadgeClass,
      emsDesc,
      lithology,
      hydrogeology,
      waterTableDepthM
    };
  }, [sector, rainfall]);

  if (!sector || !geotech) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">

      <div 
        className="bg-white border border-slate-300 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden font-sans text-slate-800 my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  GEOTECHNICAL REPORT
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {sector.name} • Tehsil: {sector.tehsil || "Joshimath"} • RPI: {geotech.rpi}/100
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Subsurface Diagnostics &amp; Slope Stability Profile
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer transition-colors"
            title="Close Dialog"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

            <div className={`p-3.5 rounded-xl border ${
              geotech.isCriticalFoS 
                ? 'bg-red-50/70 border-red-200' 
                : geotech.isWarningFoS 
                ? 'bg-amber-50/70 border-amber-200' 
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>FACTOR OF SAFETY (FOS)</span>
                <Gauge className={`w-4 h-4 ${
                  geotech.isCriticalFoS ? 'text-red-600' : geotech.isWarningFoS ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className={`text-2xl font-bold font-mono ${
                  geotech.isCriticalFoS ? 'text-red-700' : geotech.isWarningFoS ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {geotech.dynamicFoS}
                </span>
                <span className="text-xs font-semibold text-slate-600">FoS</span>
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                Slope Saturation Risk Assessment
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-200/80">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  geotech.isCriticalFoS 
                    ? 'bg-red-100 text-red-800' 
                    : geotech.isWarningFoS 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {geotech.isCriticalFoS ? '< 1.0 Active Shear Rupture' : geotech.isWarningFoS ? '1.0 - 1.25 Heightened Vigil' : '> 1.3 Stable Baseline'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>PORE WATER PRESSURE</span>
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-bold font-mono text-blue-900">
                  {geotech.dynamicPoreKpa}
                </span>
                <span className="text-xs font-semibold text-slate-600">kPa</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 leading-tight">
                Vibrating Wire Piezometer (PZ-04 @ 18m)
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">Hydro-Saturation:</span>
                <span className="font-bold text-blue-800">{geotech.poreSaturationPct}%</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>INSAR LOS VELOCITY</span>
                <TrendingDown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-bold font-mono text-purple-900">
                  {geotech.dynamicInSar}
                </span>
                <span className="text-xs font-semibold text-slate-600">mm/yr</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 leading-tight">
                Sentinel-1D / NISAR L-Band Phase
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">PSI Interferometry:</span>
                <span className="font-bold text-purple-800">12-Day Stack</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>STRUCTURAL DAMAGE</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="my-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border font-mono ${geotech.emsBadgeClass}`}>
                  {geotech.emsGrade}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 leading-snug mt-1.5">
                {geotech.emsDesc}
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">Crack Velocity:</span>
                <span className="font-bold text-slate-800">+2.4 mm/week</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-blue-900" />
              <span>Subsurface Lithology, Stratigraphy &amp; Hydrogeology Profile</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Lithological Composition &amp; Thrust Line</div>
                <div className="font-semibold text-slate-900 mt-1">{geotech.lithology}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Slope Gradient: <strong>{sector.slope || "39.5°"}</strong> &middot; Overburden Ratio: <strong>{sector.overburden || "2.85x"}</strong>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Hydrogeological Dynamics &amp; Seepage</div>
                <div className="font-semibold text-slate-900 mt-1">{geotech.hydrogeology}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Water Table Depth: <strong className="font-mono text-blue-900">{geotech.waterTableDepthM} m BGL</strong></span>
                  <span>Rain Simulation: <strong className="font-mono text-blue-700">{rainfall} mm/24h</strong></span>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-start gap-3 ${
              geotech.isCriticalFoS 
                ? 'bg-red-100/70 border-red-300 text-red-950' 
                : geotech.isWarningFoS 
                ? 'bg-amber-100/70 border-amber-300 text-amber-950' 
                : 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
            }`}>
              {geotech.isCriticalFoS ? (
                <ShieldAlert className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              ) : geotech.isWarningFoS ? (
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-xs uppercase tracking-wide">
                  {geotech.isCriticalFoS
                    ? "IMMEDIATE SECTION 34 DMA 2005 EVACUATION ORDER MANDATED"
                    : geotech.isWarningFoS
                    ? "24-HOUR CONTINUOUS INCLINOMETER SURVEILLANCE & PRE-EVACUATION ALERT"
                    : "CONTROL BASELINE STABLE • ROUTINE INCLINOMETER SURVEILLANCE ACTIVE"}
                </div>
                <div className="text-[11px] mt-0.5 leading-relaxed">
                  {geotech.isCriticalFoS
                    ? `Factor of Safety (${geotech.dynamicFoS}) is below critical threshold under ${rainfall}mm simulated rain. Immediate transit corridor activation to ${sector.shelter || sector.allocated_camp || "Designated Safe Relief Hub"} required.`
                    : geotech.isWarningFoS
                    ? `Subsidence velocity has accelerated under precipitation infiltration. Maintain continuous satellite telemetry feed and pre-stage transit buses.`
                    : `Slope exhibits intact bedrock cohesion without active subsurface shear failure. Bedrock spur maintains geotechnical structural integrity.`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Sync: Chamoli District Emergency Operations Center (DEOC) Telemetry Link</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Print / Export Geotechnical PDF Bulletin"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Geotech PDF Bulletin</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Close Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
