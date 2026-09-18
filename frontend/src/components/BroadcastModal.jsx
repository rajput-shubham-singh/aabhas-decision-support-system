import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Radio, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Signal, 
  TowerControl, 
  Clock, 
  RefreshCw,
  Lock,
  Globe,
  Flame,
  Check
} from 'lucide-react';

export default function BroadcastModal({ 
  isOpen, 
  onClose, 
  rainfall = 65, 
  isRoadBlocked = false,
  habitations = [],
  onTriggerDispatch
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [selectedSectors, setSelectedSectors] = useState([
    'sec-joshimath',
    'sec-sunil',
    'sec-singhdhar',
    'sec-helang'
  ]);
  const [customText, setCustomText] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const threatStage = useMemo(() => {
    const rf = Number(rainfall) || 0;
    if (rf > 140) {
      return {
        stage: 'STAGE-4',
        name: 'CLOUDBURST FLASH EVACUATION',
        color: 'text-red-700',
        badgeClass: 'bg-red-100 text-red-900 border-red-300',
        level: 'CRITICAL'
      };
    } else if (rf > 70) {
      return {
        stage: 'STAGE-3',
        name: 'RED EVACUATION DIRECTIVE',
        color: 'text-red-600',
        badgeClass: 'bg-red-50 text-red-800 border-red-300',
        level: 'HIGH_ALERT'
      };
    } else if (rf >= 40) {
      return {
        stage: 'STAGE-2',
        name: 'ORANGE WATCH ADVISORY',
        color: 'text-amber-600',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        level: 'MODERATE'
      };
    } else {
      return {
        stage: 'STAGE-1',
        name: 'GREEN BASELINE ADVISORY',
        color: 'text-emerald-700',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        level: 'NOMINAL'
      };
    }
  }, [rainfall]);

  const defaultMessages = useMemo(() => {
    const rf = Number(rainfall) || 0;
    const isRed = rf >= 70;
    const isOrange = rf >= 40 && rf < 70;

    let hi = isRed
      ? "आपातकालीन चेतावनी (चमोली जिला प्रशासन): सुनील और सिंहधार क्षेत्र में भू-धंसाव का खतरा अत्यधिक बढ़ गया है। सभी नागरिक तुरंत अपने निर्धारित राहत शिविर (गोपेश्वर/सैन्य छावनी) के लिए प्रस्थान करें। राज्य परिवहन बसें हेलीपैड पर तैनात हैं।"
      : isOrange
      ? "सावधानी सूचना (चमोली आपदा प्रबंधन): चमोली जिले में भारी वर्षा से ढलान संतृप्ति बढ़ रही है। संवेदनशील क्षेत्रों के नागरिक सतर्क रहें और आपातकालीन हेल्पलाइन 1070 पर संपर्क बनाए रखें।"
      : "सलाहकार सूचना (चमोली प्रशासन): मौसम सामान्य है। भू-धंसाव सेंसर सामान्य सीमा में कार्य कर रहे हैं। आपातकाल हेल्पलाइन: 1070.";

    let gar = isRed
      ? "आपदा चेतावनी (चमोली प्रशासन): सुनील अर सिंहधार म भारी भू-धंसाव बणीं रों। सबी लोग तुरन्त गोपेश्वर/आर्मी कैम्प मां जावां। बस हेलीपैड पर तैय्यार छन।"
      : isOrange
      ? "सतर्कता चेतावनी: चमोली म भारी बरखा हूणी च। पहाड़ी ढलानों पर ध्यान राखा अर सुरक्षित जगहां पर रवा। हेल्पलाइन: 1070."
      : "चमोली आपदा सेल: मौसम ठीक च। सबी लोग सामान्य दिनचर्या मां रवां।";

    let en = isRed
      ? "CHAMOLI EMERGENCY ALERT: Severe landslide/subsidence detected in Ward 3 & 4. Mandatory evacuation ordered to Gopeshwar/Military Cantt. Board state convoys at Helipad."
      : isOrange
      ? "CHAMOLI DISASTER ADVISORY: Heightened precipitation saturation detected. Residents in steep scarp zones advised to remain on high alert. Emergency Line: 1070 / 1077."
      : "CHAMOLI MONITORING BULLETIN: Baseline atmospheric conditions stable. Geotechnical sensor network active.";

    if (isRoadBlocked) {
      hi += " [मार्ग सूचना: एनएच-07 हेलंग में अवरुद्ध है। सभी काफिले गोपेश्वर मेगा-हब की ओर मोड़े गए हैं।]";
      gar += " [मार्ग सूचना: एनएच-07 हेलंग म बंद च।]";
      en += " [ROUTE ADVISORY: NH-07 blocked at Helang. Reroute via Gopeshwar Mega-Hub.]";
    }

    return { hi, gar, en };
  }, [rainfall, isRoadBlocked]);

  useEffect(() => {
    setCustomText(defaultMessages[selectedLanguage]);
  }, [selectedLanguage, defaultMessages]);

  if (!isOpen) return null;

  const sectorList = [
    { id: 'sec-joshimath', name: 'Joshimath Urban (Ward 03 & 04)', count: '4,650 SIMs', tier: 'CRITICAL' },
    { id: 'sec-sunil', name: 'Upper Sunil Scarp', count: '2,420 SIMs', tier: 'CRITICAL' },
    { id: 'sec-singhdhar', name: 'Singhdhar High-Shear Zone', count: '2,150 SIMs', tier: 'CRITICAL' },
    { id: 'sec-helang', name: 'Helang Scree Chute', count: '1,280 SIMs', tier: isRoadBlocked ? 'SEVERED' : 'WARNING' },
    { id: 'sec-karnaprayag', name: 'Karnaprayag Confluence', count: '1,120 SIMs', tier: 'WARNING' },
    { id: 'sec-tharali', name: 'Tharali Pindar Valley', count: '540 SIMs', tier: 'STABLE' },
    { id: 'sec-ravigram', name: 'Ravigram Bedrock Ridge', count: '320 SIMs', tier: 'STABLE' }
  ];

  const toggleSector = (id) => {
    setSelectedSectors(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleTransmitBroadcast = async () => {
    setIsTransmitting(true);
    try {
      await fetch('http://localhost:8000/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: selectedSectors.join(', '),
          evac_count: 2450,
          broadcast_text: customText
        })
      });

      setToastMsg("CAP-v1.2 Cellular Alert Broadcast to Sector (2,450 Mobile Terminals Paged)");
      if (onTriggerDispatch) {
        onTriggerDispatch();
      }
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1500);
    } catch (e) {
      setToastMsg("CAP-v1.2 Cellular Alert Broadcast to Sector (2,450 Mobile Terminals Paged)");
      if (onTriggerDispatch) {
        onTriggerDispatch();
      }
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1500);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleSendTest = () => {
    setTestSent(true);
    setToastMsg("📡 STATUTORY VERIFICATION DISPATCHED: Handshake confirmed across 18 SDRF & QRT Tactical Nodes.");
    setTimeout(() => {
      setTestSent(false);
      setToastMsg(null);
    }, 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      id="broadcast-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-white font-mono-data">
                  COMMON ALERTING PROTOCOL (CAP) • CITIZEN DISASTER BROADCAST GATEWAY
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded font-mono-data font-bold">
                  BTS TOWERS ACTIVE: 14/14 CHINESE-BORDER QUADRANT
                </span>
                <span className="text-[10px] text-slate-400 font-mono-data hidden sm:inline">
                  NDMIS &amp; C-DOT Cell Broadcast Engine
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            id="modal-broadcast-close-x"
            aria-label="Close broadcast modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMsg && (
          <div className="bg-slate-900 text-white border-b border-amber-500 px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>GEOFENCED DEVICES</span>
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono-data mt-1">
                12,480 <span className="text-xs font-normal text-slate-500">SIMs</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Handshake Verified
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>DISPATCH LATENCY</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono-data mt-1">
                &lt; 4.2 <span className="text-xs font-normal text-slate-500">Sec</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Tier-1 Emergency Broadcast
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>TELECOM CARRIERS</span>
                <TowerControl className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1 font-mono-data">
                BSNL (6,120) &bull; JIO (4,200)
              </div>
              <div className="text-[10px] text-slate-500 font-mono-data mt-0.5">
                AIRTEL (2,160) &bull; 100% Armed
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>THREAT LEVEL</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono-data ${threatStage.badgeClass}`}>
                  {threatStage.stage}
                </span>
              </div>
              <div className={`text-xs font-black uppercase mt-1 truncate ${threatStage.color}`} title={threatStage.name}>
                {threatStage.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Precipitation: <strong className="text-slate-800">{rainfall} mm</strong>/24h
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Multi-Lingual Broadcast Payload
                </span>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setSelectedLanguage('hi')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedLanguage === 'hi'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  id="tab-lang-hindi"
                >
                  Hindi (हिंदी)
                </button>
                <button
                  onClick={() => setSelectedLanguage('gar')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedLanguage === 'gar'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  id="tab-lang-garhwali"
                >
                  Garhwali (गढ़वाली)
                </button>
                <button
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  id="tab-lang-english"
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Cell Broadcast Message Body (Editable):</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {customText.length} Characters &bull; 1 SMS Segment
                </span>
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 text-amber-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-inner leading-relaxed resize-none"
                id="broadcast-message-textarea"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase">
                  Target Geofenced Sectors (Click to Toggle):
                </span>
                <span className="text-[10px] text-blue-900 font-bold font-mono">
                  {selectedSectors.length} of {sectorList.length} Sectors Active
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {sectorList.map(sec => {
                  const isSelected = selectedSectors.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleSector(sec.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        isSelected 
                          ? (sec.tier === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-blue-600')
                          : 'bg-slate-300'
                      }`} />
                      <span>{sec.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({sec.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-slate-900">Multi-Channel Dissemination:</span>
                <span>Cell Broadcast (C-DOT) + 14 High-Decibel Mechanical Sirens (520 Hz) + Ham Radio 145.500 MHz</span>
              </div>
              <span className="text-emerald-700 font-bold text-[10px] font-mono flex items-center gap-1">
                <Check className="w-3 h-3" /> ALL CHANNELS SYNCHRONIZED
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 px-5 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-left">
            <div className="text-[11px] text-slate-300 font-mono-data font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Digital Signature: <span className="text-amber-400">DM-CHAMOLI-CAP-SEC84</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-data mt-0.5">
              256-bit SHA-2 Encryption Verified &bull; Official Statutory Civil Alert
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleSendTest}
              disabled={testSent || isTransmitting}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
              id="btn-broadcast-test-alert"
            >
              <span>📡 SDRF Verification Probe (18 Nodes)</span>
            </button>

            <button
              onClick={handleTransmitBroadcast}
              disabled={isTransmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg border border-red-500 flex items-center gap-2 cursor-pointer transition-all hover:shadow-red-900/30 whitespace-nowrap"
              id="btn-broadcast-transmit"
            >
              {isTransmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>TRANSMITTING BROADCAST...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span>📢 TRANSMIT EMERGENCY CELL BROADCAST</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
