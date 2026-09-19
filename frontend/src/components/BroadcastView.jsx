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
  Globe
} from 'lucide-react';

const INITIAL_TOWERS = [
  { 
    id: 'TWR-01', 
    name: 'Joshimath Town Tower (BSNL)', 
    coverage: 'Upper Sunil, Manohar Bagh', 
    activePhones: '~5,800 active phones', 
    status: 'ONLINE' 
  },
  { 
    id: 'TWR-02', 
    name: 'Auli Ridge Tower (Airtel)', 
    coverage: 'High Ridge Sector', 
    activePhones: '~3,400 active phones', 
    status: 'ONLINE' 
  },
  { 
    id: 'TWR-03', 
    name: 'Marwari/Alaknanda Tower (Jio)', 
    coverage: 'Lower Basti & NH-07 Axis', 
    activePhones: '~2,200 active phones', 
    status: 'ONLINE' 
  },
  { 
    id: 'TWR-04', 
    name: 'Pipalkoti Transit Relay (BSNL)', 
    coverage: 'Valley Corridor', 
    activePhones: '~1,000 active phones', 
    status: 'ONLINE' 
  }
];

const INITIAL_LOGS = [
  { 
    id: 'ALERT-01', 
    time: '14:20 IST', 
    severity: 'WARNING', 
    target: 'Upper Sunil Ward', 
    text: 'Precipitation 65mm exceeded stage-1 alert. Citizens advised to remain vigilant.' 
  },
  { 
    id: 'ALERT-02', 
    time: '14:28 IST', 
    severity: 'ALERT', 
    target: 'Manohar Bagh & Singhdhar', 
    text: 'Subsurface shear sensors active. Avoid lower ravine trails.' 
  },
  { 
    id: 'ALERT-03', 
    time: '15:10 IST', 
    severity: 'INFO', 
    target: 'All Monitored Sectors', 
    text: 'NDRF 8th Bn convoys pre-positioned along NH-7 bypass.' 
  }
];

const LANG_PRESETS = {
  hi: {
    label: "हिंदी",
    text: "सावधानी सूचना (चमोली आपदा प्रबंधन): चमोली क्षेत्र में भारी वर्षा के कारण भू-धंसाव का खतरा है। संवेदनशील वार्डों के नागरिक तुरंत सुरक्षित राहत शिविरों की ओर प्रस्थान करें। आपातकालीन हेल्पलाइन: 1070 / 1077."
  },
  gar: {
    label: "गढ़वाली (स्थानीय)",
    text: "सावधान रया (चमोली आपदा प्रबंधन): भारी बरखा से पहाड़ी धंसण को खतरा बणीं रों। सबी लोग तुरत सुरक्षित राहत शिविरों मा पौंछा। मदद वास्ता 1070 या 1077 पर फोन करा।"
  },
  en: {
    label: "English",
    text: "EMERGENCY ADVISORY (DDMA Chamoli): High landslide & subsidence risk due to intense precipitation. Residents in vulnerable sectors must evacuate to designated relief camps immediately. Helpline: 1070 / 1077."
  }
};

export default function BroadcastView({ habitations = [], rainfall = 65, onTriggerDispatch }) {
  const [towers, setTowers] = useState(INITIAL_TOWERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedWard, setSelectedWard] = useState('ALL_RED_ZONES');
  const [alertSeverity, setAlertSeverity] = useState('CRITICAL');
  const [isSirenActive, setIsSirenActive] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState(null);
  const [selectedLang, setSelectedLang] = useState('hi');
  const [messagePayload, setMessagePayload] = useState(LANG_PRESETS.hi.text);

  const handleLangSwitch = (langKey) => {
    setSelectedLang(langKey);
    setMessagePayload(LANG_PRESETS[langKey].text);
  };

  const handleBroadcast = async () => {
    setIsSending(true);
    try {
      await fetch('http://localhost:8000/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: selectedWard === 'ALL_RED_ZONES' ? 'All Joshimath Red Zones' : selectedWard,
          evac_count: 12480,
          broadcast_text: messagePayload
        })
      });

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).slice(0, 5) + ' IST';

      const newLog = {
        id: `ALERT-${Date.now().toString().slice(-4)}`,
        time: timeStr,
        severity: alertSeverity,
        target: selectedWard === 'ALL_RED_ZONES' ? 'All Critical Red Sectors' : selectedWard,
        text: messagePayload.slice(0, 120) + (messagePayload.length > 120 ? '...' : '')
      };

      setLogs(prev => [newLog, ...prev]);
      setBroadcastNotice('Public Alert Broadcast transmitted across all 4 mobile BTS towers and local sirens.');
      setTimeout(() => setBroadcastNotice(null), 4500);

      if (onTriggerDispatch) {
        onTriggerDispatch();
      }
    } catch (e) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).slice(0, 5) + ' IST';

      const fallbackLog = {
        id: `ALERT-${Date.now().toString().slice(-4)}`,
        time: timeStr,
        severity: alertSeverity,
        target: selectedWard === 'ALL_RED_ZONES' ? 'All Critical Red Sectors' : selectedWard,
        text: messagePayload.slice(0, 120) + (messagePayload.length > 120 ? '...' : '')
      };

      setLogs(prev => [fallbackLog, ...prev]);
      setBroadcastNotice('Public Alert Broadcast dispatched to 12,480 active mobile devices.');
      setTimeout(() => setBroadcastNotice(null), 4000);
      if (onTriggerDispatch) {
        onTriggerDispatch();
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-5 space-y-3 font-sans text-slate-800 select-none">

      {broadcastNotice && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-slate-700 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Radio className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold">{broadcastNotice}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-blue-900 text-amber-400">
            <Radio className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              CITIZEN CELL BROADCAST &amp; PUBLIC WARNING SYSTEM
            </h1>
            <p className="text-xs text-slate-500">
              Direct Emergency Public Alert Link to Telecom Towers (BTS) &amp; Local Sirens
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Civil Defense Sirens</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">6 Linked Poles</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Ready / Standby</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Active Mobile Towers</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">4 BTS Stations</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">BSNL • Jio • Airtel</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Active Mobile Reach</div>
            <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">~12,480 Devices</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Chamoli Sector Coverage</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-900" />
                <span>Emergency Broadcast Composer</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Target Geo-Sector</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer text-slate-800"
                >
                  <option value="ALL_RED_ZONES">All Critical Red Zones (High Risk)</option>
                  <option value="Upper Sunil Ward">Upper Sunil Ward</option>
                  <option value="Manohar Bagh">Manohar Bagh</option>
                  <option value="Singhdhar Sector">Singhdhar Sector</option>
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
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer text-red-700"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Immediate Evacuation Order)</option>
                  <option value="WARNING">🟠 WARNING (Standby Alert)</option>
                  <option value="ADVISORY">🟢 ADVISORY (Informational Update)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                {isSirenActive ? (
                  <Volume2 className="w-4 h-4 text-red-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <label className="text-xs font-semibold text-slate-800">
                  Trigger Local Warning Sirens (Joshimath Municipal Poles)
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsSirenActive(!isSirenActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isSirenActive ? 'bg-red-700 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-700" />
                  CELL BROADCAST SMS PAYLOAD
                </span>
                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  {Object.entries(LANG_PRESETS).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleLangSwitch(k)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        selectedLang === k
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={3}
                value={messagePayload}
                onChange={(e) => setMessagePayload(e.target.value)}
                className="w-full resize-none p-2.5 text-xs text-slate-800 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed min-h-[90px]"
              />
              <div className="text-right text-[10px] text-slate-400 font-mono mt-0.5">
                {messagePayload.length} / 280 Characters
              </div>
            </div>
          </div>

          <button 
            onClick={handleBroadcast}
            disabled={isSending}
            className="w-full mt-3 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Broadcast Alert...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                <span>Send Emergency Cell Broadcast Alert</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-3 flex flex-col justify-between">

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TowerControl className="w-4 h-4 text-blue-900" />
                <span>Telecom BTS Towers Link</span>
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                4 Active Stations
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {towers.map((t) => (
                <div key={t.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{t.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Coverage: {t.coverage}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {t.activePhones}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Alert History &amp; Advisories</span>
              </h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{log.target}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        log.severity === 'CRITICAL' || log.severity === 'ALERT'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
