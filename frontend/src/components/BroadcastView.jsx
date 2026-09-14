import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  TowerControl, 
  Clock, 
  RefreshCw,
  ShieldAlert,
  Terminal
} from 'lucide-react';

const INITIAL_TOWERS = [
  { id: 'TWR-01', name: 'Joshimath-BSNL-Alpha (JSH-01)', sector: 'Upper Sunil & Manohar Bagh', cells: 'Band 3 / 8 (4G LTE)', activeImsis: 5820, status: 'ONLINE', latencyMs: 14 },
  { id: 'TWR-02', name: 'Auli-Ridge-Airtel (AUL-04)', sector: 'Gandhi Nagar & High Ridge', cells: 'Band 40 (4G/5G)', activeImsis: 3410, status: 'ONLINE', latencyMs: 19 },
  { id: 'TWR-03', name: 'Alaknanda-Gorge-Jio (ALK-09)', sector: 'Marwari Lower Basti & Helipad', cells: 'Band 5 / 28 (4G)', activeImsis: 2180, status: 'ONLINE', latencyMs: 22 },
  { id: 'TWR-04', name: 'Pipalkoti-Transit-BSNL (PPK-02)', sector: 'Pipalkoti Evacuation Hub', cells: 'Band 1 / 3 (4G LTE)', activeImsis: 990, status: 'ONLINE', latencyMs: 16 }
];

const INITIAL_LOGS = [
  { id: 'CAP-LOG-01', time: '14:20:12 IST', severity: 'WARNING', target: 'Upper Sunil Ward', text: 'Precipitation 65mm exceeded stage-1 alert. Citizens advised to remain vigilant.' },
  { id: 'CAP-LOG-02', time: '14:28:45 IST', severity: 'ALERT', target: 'Manohar Bagh & Singhdhar', text: 'Subsurface shear sensors active. Avoid lower ravine trails.' },
  { id: 'CAP-LOG-03', time: '15:10:04 IST', severity: 'INFO', target: 'All Monitored Sectors', text: 'NDRF 8th Bn convoys pre-positioned along NH-7 bypass.' }
];

export default function BroadcastView({ habitations = [], rainfall = 65, onTriggerDispatch }) {
  const [towers, setTowers] = useState(INITIAL_TOWERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedWard, setSelectedWard] = useState('ALL_RED_ZONES');
  const [alertSeverity, setAlertSeverity] = useState('CRITICAL');
  const [isSirenActive, setIsSirenActive] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState(null);
  const [customMsg, setCustomMsg] = useState(
    '[MHA EMERGENCY DIRECTIVE] Urgent evacuation notice for Joshimath vulnerable sectors. Landslide/subsidence risk imminent. Proceed immediately to designated Relief Reception Centers (Tapovan Inter College / Army Cantonment). Emergency Helpline: 1070 / 1077.'
  );

  const totalImsis = towers.reduce((acc, t) => acc + t.activeImsis, 0);

  const handleBroadcast = async () => {
    setIsSending(true);
    try {
      const res = await fetch('http://localhost:8000/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: selectedWard === 'ALL_RED_ZONES' ? 'All Joshimath Red Zones' : selectedWard,
          evac_count: totalImsis
        })
      });

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
      
      const newLog = {
        id: `CAP-TX-${Date.now().toString().slice(-4)}`,
        time: timeStr,
        severity: alertSeverity,
        target: selectedWard === 'ALL_RED_ZONES' ? 'All Vulnerable Red Sectors' : selectedWard,
        text: customMsg.slice(0, 110) + '...'
      };

      setLogs(prev => [newLog, ...prev]);
      setBroadcastNotice(`CAP Broadcast successfully transmitted to ${totalImsis.toLocaleString('en-IN')} cellular IMSIs. Acoustic Sirens: ${isSirenActive ? 'ACTIVE (520 Hz)' : 'OFF'}.`);
      setTimeout(() => setBroadcastNotice(null), 4500);

      if (onTriggerDispatch) {
        onTriggerDispatch();
      }
    } catch (e) {
      setBroadcastNotice(`Simulated local CAP Broadcast executed for ${totalImsis.toLocaleString('en-IN')} subscribers.`);
      setTimeout(() => setBroadcastNotice(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-4 font-sans text-slate-800 select-none">
      {/* Toast Notice */}
      {broadcastNotice && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-red-500 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Radio className="w-5 h-5 text-red-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold">{broadcastNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-blue-900 text-amber-400">
            <Radio className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              COMMON ALERTING PROTOCOL (CAP) • CITIZEN CELL BROADCAST TERMINAL
            </h1>
            <p className="text-xs text-slate-500">
              Direct Emergency Broadcast Link to Telecom Tower Base Transceiver Stations (BTS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Target BTS Towers</div>
            <div className="text-lg font-black text-slate-900 font-mono-data">4 Transceivers</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Active Mobile Reach</div>
            <div className="text-lg font-black text-emerald-700 font-mono-data">{totalImsis.toLocaleString('en-IN')} Devices</div>
          </div>
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-red-700">Siren Network</div>
            <div className="text-lg font-black text-red-600 font-mono-data">520 Hz Armed</div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Broadcast Composer & BTS Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: CAP Broadcast Composer */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-900" />
                <span>Emergency Broadcast Composer</span>
              </h2>
              <span className="text-[10px] font-mono-data font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                CAP-v1.2 MHA COMPLIANT
              </span>
            </div>

            {/* Target Selector */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Target Geo-Sector</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
                >
                  <option value="ALL_RED_ZONES">All Critical Red Zones (High Risk)</option>
                  <option value="Upper Sunil Ward">Upper Sunil Ward (Rank #1)</option>
                  <option value="Manohar Bagh">Manohar Bagh (Rank #2)</option>
                  <option value="Singhdhar Sector">Singhdhar Sector (Rank #3)</option>
                  <option value="Marwari Lower Basti">Marwari Lower Basti</option>
                  <option value="Gandhi Nagar Slope">Gandhi Nagar Slope</option>
                  <option value="Ravigram Stable Zone">Ravigram Stable Zone</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Alert Severity Level</label>
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer text-red-700"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Level 3 Immediate Evac)</option>
                  <option value="WARNING">🟠 WARNING (Level 2 Standby Alert)</option>
                  <option value="ADVISORY">🟢 ADVISORY (Level 1 Info Update)</option>
                </select>
              </div>
            </div>

            {/* Siren Toggle Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                {isSirenActive ? (
                  <Volume2 className="w-5 h-5 text-red-600 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900">Synchronized High-Decibel Acoustic Sirens</div>
                  <div className="text-[10px] text-slate-500 font-mono-data">520 Hz oscillating frequency across municipal poles</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSirenActive(!isSirenActive)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isSirenActive ? 'bg-red-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Message Body Input */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>CELL BROADCAST SMS PAYLOAD</span>
                <span className="font-mono-data text-slate-500">{customMsg.length} / 280 Characters</span>
              </div>
              <textarea
                rows={4}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full text-xs font-mono-data border border-slate-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleBroadcast}
            disabled={isSending}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Cellular Transceivers...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>TRANSMIT CAP EMERGENCY BROADCAST ({totalImsis.toLocaleString('en-IN')} DEVICES)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: BTS Telecom Towers Status & Live Transmission Logs */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* BTS Towers Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TowerControl className="w-4 h-4 text-blue-900" />
                <span>Telecom BTS Towers Link</span>
              </h3>
              <span className="text-[10px] font-mono-data text-emerald-700 font-bold">ALL ONLINE</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {towers.map((t) => (
                <div key={t.id} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{t.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono-data">{t.sector} • {t.cells}</div>
                  </div>
                  <div className="text-right font-mono-data">
                    <div className="font-bold text-slate-800">{t.activeImsis.toLocaleString('en-IN')} IMSIs</div>
                    <div className="text-[10px] text-emerald-600">{t.latencyMs}ms ping</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Transmission Log Feed */}
          <div className="bg-slate-900 text-slate-100 rounded-xl shadow-xs p-4 flex flex-col space-y-2 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Terminal className="w-4 h-4" />
                <span>CAP Broadcast Transmission Logs</span>
              </div>
              <span className="text-[9px] font-mono-data text-slate-400">SECURE MHA GATEWAY</span>
            </div>

            <div className="space-y-2 font-mono-data text-[11px] max-h-48 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-2 rounded border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{log.time}</span>
                    <span className={`px-1 rounded text-[9px] font-bold ${
                      log.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      log.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                  <div className="text-slate-200 font-semibold">{log.target}</div>
                  <div className="text-slate-400 text-[10px] leading-tight">{log.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
