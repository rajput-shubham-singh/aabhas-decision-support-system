import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Clock, 
  CloudRain, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';

export default function Header({ 
  rainfall, 
  setRainfall, 
  rainfallStatus, 
  onOpenDispatch, 
  onPrintManifest, 
  isMapFocused, 
  setIsMapFocused,
  summary,
  leftCollapsed,
  setLeftCollapsed,
  rightCollapsed,
  setRightCollapsed
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBadgeStyle = () => {
    if (rainfall < 50) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400',
        text: 'Normal Monsoonal (<50mm)'
      };
    } else if (rainfall <= 120) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        dot: 'bg-amber-400',
        text: 'Flash Flood Warning (50-120mm)'
      };
    } else {
      return {
        bg: 'bg-red-500/10 border-red-500/30 text-red-400',
        dot: 'bg-red-400 animate-ping',
        text: 'Critical Cloudburst Trigger (>120mm)'
      };
    }
  };

  const badge = getBadgeStyle();

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 select-none z-30 relative shadow-2xl flex-shrink-0">

      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3 border-b border-zinc-900 bg-zinc-950/90">

        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-red-950/40 border border-red-600/40 text-red-500">
            <ShieldAlert className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-widest text-zinc-100 uppercase font-mono">
                NDRF / MHA COMMAND CELL
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono font-medium border border-zinc-700/50">
                OPERATIONAL IDSS v2.4
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5 font-mono">
              <span className="text-amber-400/90 font-semibold">SECTOR 04:</span>
              <span>ALAKNANDA VALLEY / JOSHIMATH DEEP SURVEY CORRIDOR</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-2 bg-zinc-900/90 border border-zinc-800 rounded-md px-3.5 py-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center space-x-1.5 text-zinc-300">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400">
                24H CUMULATIVE PRECIPITATION
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 text-[10px]">VALUE:</span>
              <span className="font-bold text-sky-300 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40 text-xs">
                {rainfall} mm
              </span>
              <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border text-[10px] font-mono ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                <span>{badge.text}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-zinc-500">10mm</span>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
            />
            <span className="text-[10px] font-mono text-zinc-500">300mm</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">

          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-200">{timeStr}</span>
          </div>

          <button
            onClick={onPrintManifest}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono font-medium transition active:scale-95 cursor-pointer"
            title="Export Clean Black & White Field Action Manifest for Field Troops"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">FIELD MANIFEST</span>
          </button>

          <button
            onClick={onOpenDispatch}
            className="relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs tracking-wider border border-red-400 shadow-lg shadow-red-950/60 transition active:scale-95 cursor-pointer animate-pulse"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '3s' }} />
            <span>EXECUTE EVACUATION DISPATCH</span>
            {summary?.red_zone_count > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-900/80 text-[10px] rounded border border-red-400/50">
                {summary.red_zone_count} RED
              </span>
            )}
          </button>

          <button
            onClick={() => {
              const nextState = !isMapFocused;
              setIsMapFocused(nextState);
              if (nextState) {
                setLeftCollapsed(true);
                setRightCollapsed(true);
              } else {
                setLeftCollapsed(false);
                setRightCollapsed(false);
              }
            }}
            className={`p-1.5 rounded border text-xs font-mono transition cursor-pointer ${
              isMapFocused 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title={isMapFocused ? "Restore Panels" : "Focus Full Map View"}
          >
            {isMapFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
