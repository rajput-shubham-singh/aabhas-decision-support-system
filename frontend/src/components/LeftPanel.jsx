import React, { useState } from 'react';
import { 
  Building2, 
  AlertOctagon, 
  Users, 
  Weight, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Layers, 
  TrendingUp,
  Activity,
  Compass
} from 'lucide-react';

export default function LeftPanel({
  collapsed,
  setCollapsed,
  summary,
  habitations,
  shelters,
  rainfall
}) {
  const [activeTab, setActiveTab] = useState('diagnostics');

  if (collapsed) {
    return (
      <div className="w-10 bg-zinc-950 border-r border-zinc-800/80 flex flex-col items-center py-3 z-20 flex-shrink-0 transition-all select-none">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="Expand Diagnostics Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="writing-mode-vertical rotate-180 mt-10 text-[11px] font-mono tracking-widest text-zinc-500 uppercase flex items-center space-x-2">
          <span>TERRAIN & CAPACITY DIAGNOSTICS</span>
        </div>
      </div>
    );
  }

  const topOverburdenHab = habitations && habitations.length > 0
    ? [...habitations].sort((a, b) => b.overburden_ratio - a.overburden_ratio)[0]
    : null;

  return (
    <aside className="w-84 md:w-96 bg-zinc-950/95 border-r border-zinc-800/80 flex flex-col z-20 flex-shrink-0 shadow-2xl overflow-hidden transition-all">

      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
            GEO-CAPACITY DIAGNOSTICS
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition cursor-pointer"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex border-b border-zinc-800/80 bg-zinc-950 text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'border-red-500 text-red-400 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          METRICS & KPI
        </button>
        <button
          onClick={() => setActiveTab('math_engine')}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition cursor-pointer ${
            activeTab === 'math_engine'
              ? 'border-red-500 text-red-400 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          FORMULA ENGINE
        </button>
        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition cursor-pointer ${
            activeTab === 'shelters'
              ? 'border-red-500 text-red-400 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          RELIEF BASES
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
        {activeTab === 'diagnostics' && (
          <>

            <div className="grid grid-cols-2 gap-2">

              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Monitored Sectors</span>
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="text-xl font-black text-zinc-100 mt-1">
                  {summary?.total_habitations || 6}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Joshimath Corridor</div>
              </div>

              <div className={`p-2.5 rounded border relative overflow-hidden ${
                (summary?.red_zone_count || 0) > 0 
                  ? 'bg-red-950/30 border-red-500/40 text-red-400' 
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              }`}>
                <div className="flex items-center justify-between text-[10px] uppercase">
                  <span>Critical Red Zones</span>
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-xl font-black mt-1 flex items-baseline space-x-1.5">
                  <span className={(summary?.red_zone_count || 0) > 0 ? 'text-red-400' : 'text-zinc-200'}>
                    {summary?.red_zone_count || 0}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">/ {summary?.total_habitations || 6}</span>
                </div>
                <div className="text-[9px] text-red-400/80 mt-0.5 font-semibold">
                  {(summary?.red_zone_count || 0) > 0 ? 'Immediate Evacuation' : 'Within Safety Margins'}
                </div>
              </div>

              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Evac Population</span>
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {summary?.total_red_displaced_population?.toLocaleString() || 0}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">
                  Total Corridor: {summary?.all_sectors_population?.toLocaleString() || 0}
                </div>
              </div>

              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Peak Overburden</span>
                  <Weight className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-xl font-black text-red-400 mt-1">
                  {summary?.max_overburden_ratio ? `${summary.max_overburden_ratio}x` : '1.00x'}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Threshold Limit: 1.00x</div>
              </div>
            </div>

            {topOverburdenHab && (
              <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Peak Overburden Sector: {topOverburdenHab.name}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                    {topOverburdenHab.overburden_ratio}x Load
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Safe Structural Limit: <strong className="text-zinc-200">{topOverburdenHab.safe_house_capacity} Houses</strong></span>
                    <span>Actual Load: <strong className="text-red-400">{topOverburdenHab.current_houses} Houses</strong></span>
                  </div>

                  <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden flex border border-zinc-800">
                    <div 
                      className="bg-emerald-500 h-full" 
                      style={{ width: `${Math.min(100, (100 / topOverburdenHab.overburden_ratio))}%` }}
                      title="Safe Threshold (100%)"
                    />
                    <div 
                      className="bg-red-500 h-full animate-pulse" 
                      style={{ width: `${Math.max(0, 100 - (100 / topOverburdenHab.overburden_ratio))}%` }}
                      title="Hazardous Overburden Excess"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span className="text-emerald-400/90">■ Permissible Capacity</span>
                    <span className="text-red-400/90">■ Critical Excess ({topOverburdenHab.overburden_percent - 100}%)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/70 text-[10px] text-zinc-400 leading-relaxed">
                  <p>
                    <span className="text-zinc-300 font-semibold">Geological Constraint:</span> Slope of {topOverburdenHab.slope}° on {topOverburdenHab.soil_type} has degraded shear resistance. Rainfall saturation ({rainfall}mm) reduces pore safety factor.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 uppercase">
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sector Hazard Classification</span>
                </span>
                <span className="text-[10px] text-zinc-500">6 Habitations</span>
              </div>

              <div className="w-full h-3 bg-zinc-950 rounded flex overflow-hidden border border-zinc-800">
                <div 
                  className="bg-red-600 transition-all duration-500 flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ width: `${((summary?.red_zone_count || 0) / 6) * 100}%` }}
                >
                  {(summary?.red_zone_count || 0) > 0 && summary?.red_zone_count}
                </div>
                <div 
                  className="bg-amber-500 transition-all duration-500 flex items-center justify-center text-[9px] text-black font-bold"
                  style={{ width: `${((summary?.orange_zone_count || 0) / 6) * 100}%` }}
                >
                  {(summary?.orange_zone_count || 0) > 0 && summary?.orange_zone_count}
                </div>
                <div 
                  className="bg-emerald-600 transition-all duration-500 flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ width: `${((summary?.green_zone_count || 0) / 6) * 100}%` }}
                >
                  {(summary?.green_zone_count || 0) > 0 && summary?.green_zone_count}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[10px] pt-1 text-center">
                <div className="p-1 rounded bg-red-950/30 border border-red-900/40 text-red-400">
                  <span className="font-bold">{summary?.red_zone_count || 0}</span> RED (EVAC)
                </div>
                <div className="p-1 rounded bg-amber-950/30 border border-amber-900/40 text-amber-400">
                  <span className="font-bold">{summary?.orange_zone_count || 0}</span> ORANGE (ALERT)
                </div>
                <div className="p-1 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-400">
                  <span className="font-bold">{summary?.green_zone_count || 0}</span> GREEN (HOLD)
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-zinc-900/50 border border-zinc-800/80 text-[10px] text-zinc-400 flex items-start space-x-2">
              <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <span>
                Simulated under Disaster Management Act (2005) & NDMA Uttarakhand Guidelines for rapid habitation triage.
              </span>
            </div>
          </>
        )}

        {activeTab === 'math_engine' && (
          <div className="space-y-3 text-[11px] text-zinc-300">
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-red-400 font-bold block text-xs uppercase">1. Dynamic Hazard Probability (H)</span>
              <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-sky-400 font-semibold text-[10px]">
                H = min(1.0, (Rainfall_mm / 180.0) * 0.65 + (Slope / 45.0) * 0.35)
              </div>
              <p className="text-[10px] text-zinc-400">
                Weights pore-water saturation against critical landslide angle (45°).
              </p>
            </div>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-amber-400 font-bold block text-xs uppercase">2. Slope Carrying Capacity (OR)</span>
              <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-amber-300 font-semibold text-[10px]">
                Safe_Capacity = max(15, 200 * (1 - (Slope / 45.0)^1.5))
                <br />
                Overburden_Ratio (OR) = Current_Houses / Safe_Capacity
              </div>
              <p className="text-[10px] text-zinc-400">
                Non-linear exponential decay of permissible structural loads with steepening terrain.
              </p>
            </div>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-emerald-400 font-bold block text-xs uppercase">3. Relocation Priority Index (RPI)</span>
              <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-emerald-300 font-semibold text-[10px]">
                RPI = 0.40(H) + 0.25(OR / 2) + 0.20(Density) + 0.15(CutoffRisk)
              </div>
              <p className="text-[10px] text-zinc-400">
                Composite vulnerability score prioritizing life safety, access cutoff, and density.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'shelters' && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide block">
              Designated Relief Reception Centers
            </span>
            {shelters && shelters.map(s => (
              <div key={s.id} className="p-2.5 rounded bg-zinc-900/90 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{s.name}</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    {s.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                  <div>Capacity: <strong className="text-zinc-200">{s.capacity} Pax</strong></div>
                  <div>Available: <strong className="text-emerald-300">{s.available_beds} Beds</strong></div>
                  <div>Distance: <strong className="text-zinc-200">{s.distance_km} km</strong></div>
                  <div>Medical: <strong className="text-zinc-300 text-[9px]">{s.medical_unit}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
