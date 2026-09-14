import React, { useState } from 'react';
import { 
  ListOrdered, 
  ChevronRight, 
  ChevronLeft, 
  Crosshair, 
  Radio, 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export default function RightPanel({
  collapsed,
  setCollapsed,
  habitations,
  selectedHabitation,
  onSelectHabitation,
  onLocateHabitation,
  onOpenDispatchForWard
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL'); // 'ALL' | 'RED' | 'ORANGE' | 'GREEN'

  if (collapsed) {
    return (
      <div className="w-10 bg-zinc-950 border-l border-zinc-800/80 flex flex-col items-center py-3 z-20 flex-shrink-0 transition-all select-none">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="Expand RPI Triage Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="writing-mode-vertical rotate-180 mt-10 text-[11px] font-mono tracking-widest text-zinc-500 uppercase flex items-center space-x-2">
          <span>RELOCATION PRIORITY TRIAGE</span>
        </div>
      </div>
    );
  }

  const filteredHabitations = (habitations || []).filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.soil_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'ALL' || h.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  return (
    <aside className="w-96 md:w-[420px] bg-zinc-950/95 border-l border-zinc-800/80 flex flex-col z-20 flex-shrink-0 shadow-2xl overflow-hidden transition-all font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <ListOrdered className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            RPI TRIAGE & RELOCATION DISPATCH
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition cursor-pointer"
          title="Collapse Panel"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 bg-zinc-900/40 border-b border-zinc-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search ward or soil type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center space-x-1.5 text-[10px]">
          <button
            onClick={() => setZoneFilter('ALL')}
            className={`px-2 py-1 rounded border transition cursor-pointer ${
              zoneFilter === 'ALL'
                ? 'bg-zinc-700 text-white border-zinc-500 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            ALL ({habitations?.length || 0})
          </button>
          <button
            onClick={() => setZoneFilter('RED')}
            className={`px-2 py-1 rounded border transition cursor-pointer ${
              zoneFilter === 'RED'
                ? 'bg-red-950 text-red-300 border-red-500 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            RED ({habitations?.filter(h => h.zone === 'RED').length || 0})
          </button>
          <button
            onClick={() => setZoneFilter('ORANGE')}
            className={`px-2 py-1 rounded border transition cursor-pointer ${
              zoneFilter === 'ORANGE'
                ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            ORANGE ({habitations?.filter(h => h.zone === 'ORANGE').length || 0})
          </button>
          <button
            onClick={() => setZoneFilter('GREEN')}
            className={`px-2 py-1 rounded border transition cursor-pointer ${
              zoneFilter === 'GREEN'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            GREEN ({habitations?.filter(h => h.zone === 'GREEN').length || 0})
          </button>
        </div>
      </div>

      {/* RPI Triage Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredHabitations.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No habitations matching current filter.
          </div>
        ) : (
          filteredHabitations.map((hab) => {
            const isSelected = selectedHabitation?.id === hab.id;
            const isRed = hab.zone === 'RED';
            const isOrange = hab.zone === 'ORANGE';

            return (
              <div
                key={hab.id}
                onClick={() => onSelectHabitation(hab)}
                className={`p-3 rounded border transition cursor-pointer relative ${
                  isSelected 
                    ? 'bg-zinc-900 border-zinc-400 ring-1 ring-zinc-400 shadow-xl' 
                    : (isRed 
                        ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/40' 
                        : (isOrange 
                            ? 'bg-amber-950/15 border-amber-900/40 hover:bg-amber-950/30' 
                            : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/80'))
                }`}
              >
                {/* Top Row: Rank, Name, Zone Tag */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                      isRed 
                        ? 'bg-red-500 text-white' 
                        : (isOrange ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white')
                    }`}>
                      #{hab.rank}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-zinc-100">{hab.name}</div>
                      <div className="text-[10px] text-zinc-400">{hab.soil_type}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider inline-block ${
                      isRed 
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' 
                        : (isOrange ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800')
                    }`}>
                      {hab.zone} ZONE
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">
                      RPI: <strong className="text-amber-400">{hab.rpi_score}</strong>
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-1 py-2 text-[10px]">
                  <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[9px]">SLOPE / HAZARD</span>
                    <span className="font-semibold text-zinc-200">{hab.slope}° | H: {hab.hazard_probability_h}</span>
                  </div>
                  <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[9px]">OVERBURDEN</span>
                    <span className={`font-bold ${hab.overburden_ratio > 1.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {hab.overburden_ratio}x Limit
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[9px]">CUTOFF RISK</span>
                    <span className="font-semibold text-red-300">
                      {Math.round(hab.primary_access_cutoff_risk * 100)}%
                    </span>
                  </div>
                </div>

                {/* Assigned Shelter */}
                <div className="text-[10px] text-zinc-400 pb-2 flex items-center justify-between">
                  <span>Relief Destination:</span>
                  <span className="text-emerald-400 font-semibold truncate max-w-[200px]">
                    {hab.assigned_shelter?.name}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1 border-t border-zinc-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocateHabitation(hab);
                    }}
                    className="flex-1 py-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold border border-zinc-700 flex items-center justify-center space-x-1 transition cursor-pointer"
                    title="Pan & Center Map"
                  >
                    <Crosshair className="w-3 h-3 text-sky-400" />
                    <span>LOCATE & PAN</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDispatchForWard(hab);
                    }}
                    className="flex-1 py-1 px-2 rounded bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold border border-red-500 flex items-center justify-center space-x-1 shadow-md shadow-red-950/50 transition cursor-pointer"
                  >
                    <Radio className="w-3 h-3" />
                    <span>DISPATCH ALERT</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
