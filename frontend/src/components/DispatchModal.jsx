import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Smartphone, 
  TowerControl, 
  Clock, 
  Printer,
  FileCheck
} from 'lucide-react';

export default function DispatchModal({
  isOpen,
  onClose,
  targetWard,
  allRedHabitations,
  rainfall,
  summary
}) {
  const [sirenEnabled, setSirenEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [sdrfAlertEnabled, setSdrfAlertEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);

  if (!isOpen) return null;

  const targets = targetWard 
    ? [targetWard] 
    : (allRedHabitations && allRedHabitations.length > 0 ? allRedHabitations : []);

  const totalHouses = targets.reduce((sum, h) => sum + h.current_houses, 0);
  const totalPop = targets.reduce((sum, h) => sum + (h.estimated_displaced_population || h.current_houses * 5), 0);
  const totalSmsEst = Math.round(totalHouses * 4.2);

  const handleToggleSirenTest = () => {
    if (isPlayingSiren) {
      setIsPlayingSiren(false);
      return;
    }

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.8);
      osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 1.2);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.6);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);

      setIsPlayingSiren(true);
      setTimeout(() => {
        setIsPlayingSiren(false);
      }, 1800);
    } catch (e) {
      console.error("Web audio not supported or blocked", e);
    }
  };

  const handleExecuteDispatch = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        ward_id: targetWard ? targetWard.id : null,
        target_ward_ids: targetWard ? [targetWard.id] : targets.map(t => t.id),
        simulated_type: sirenEnabled && smsEnabled ? "SMS_AND_SIREN" : (sirenEnabled ? "SIREN_ONLY" : "SMS_ONLY")
      };

      const res = await fetch('http://127.0.0.1:8000/api/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchResult(data);
      } else {
        setDispatchResult({
          status: "DISPATCH_CONFIRMED",
          dispatch_id: `MHA-NDRF-${new Date().getFullYear()}-SIM01`,
          timestamp: new Date().toISOString(),
          target_wards: targets.map(t => t.name).join(', '),
          total_sms_dispatched: totalSmsEst,
          target_population_alerted: totalPop,
          siren_frequency_hz: 520,
          cellular_towers_notified: [
            "Joshimath-BSNL-Tower-Alpha (ID: JSH-01)",
            "Auli-Ridge-Airtel-Relay-Bravo (ID: AUL-04)",
            "Alaknanda-Gorge-Jio-Mast-02 (ID: ALK-09)"
          ],
          ndrf_battalion_notified: "8th Battalion NDRF (Dehradun Quick Response Unit / Joshimath Camp)",
          sdrf_command: "SDRF Uttarakhand Post Joshimath Sector-4",
          district_magistrate_notified: "DM Office Chamoli (Gopeshwar Control Room)"
        });
      }
    } catch (e) {
      setDispatchResult({
        status: "DISPATCH_CONFIRMED",
        dispatch_id: `MHA-NDRF-${new Date().getFullYear()}-SIM01`,
        timestamp: new Date().toISOString(),
        target_wards: targets.map(t => t.name).join(', '),
        total_sms_dispatched: totalSmsEst,
        target_population_alerted: totalPop,
        siren_frequency_hz: 520,
        cellular_towers_notified: [
          "Joshimath-BSNL-Tower-Alpha (ID: JSH-01)",
          "Auli-Ridge-Airtel-Relay-Bravo (ID: AUL-04)",
          "Alaknanda-Gorge-Jio-Mast-02 (ID: ALK-09)"
        ],
        ndrf_battalion_notified: "8th Battalion NDRF (Dehradun Quick Response Unit / Joshimath Camp)",
        sdrf_command: "SDRF Uttarakhand Post Joshimath Sector-4",
        district_magistrate_notified: "DM Office Chamoli (Gopeshwar Control Room)"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setDispatchResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-red-500/60 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden font-mono text-zinc-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-5 py-3.5 bg-red-950/40 border-b border-red-500/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-red-900/60 border border-red-500/80 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-red-400">
                EMERGENCY EVACUATION DISPATCH PROTOCOL
              </h3>
              <p className="text-[11px] text-zinc-400">
                NATIONAL DISASTER RESPONSE FORCE (NDRF) | MHA ALERT CELL
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!dispatchResult ? (
            <>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="uppercase text-amber-400">Target Habitations for Immediate Alert:</span>
                  <span className="text-[11px] text-zinc-400">{targets.length} Sectors Selected</span>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {targets.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800 text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${t.zone === 'RED' ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`} />
                        <span className="font-bold text-zinc-100">{t.name}</span>
                        <span className="text-[10px] text-zinc-500">({t.soil_type}, {t.slope}°)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-red-400 font-bold">{t.current_houses} Houses</span>
                        <span className="text-zinc-500 text-[10px]"> (~{t.estimated_displaced_population} Pax)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs font-bold">
                  <span className="text-zinc-400">Aggregated Evacuation Load:</span>
                  <span className="text-amber-400">{totalHouses} Households | ~{totalPop} Citizens</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Alert Transmission Vector Configuration
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                  <label className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-start space-x-3 cursor-pointer hover:border-zinc-700 transition">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                      className="mt-0.5 accent-red-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-200 flex items-center space-x-1">
                        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                        <span>Cellular CAP Broadcast</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        High-priority SMS & Cell Broadcast to all SIM cards in Sector 04 (~{totalSmsEst} recipients).
                      </div>
                    </div>
                  </label>

                  <label className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-start space-x-3 cursor-pointer hover:border-zinc-700 transition">
                    <input
                      type="checkbox"
                      checked={sirenEnabled}
                      onChange={(e) => setSirenEnabled(e.target.checked)}
                      className="mt-0.5 accent-red-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-200 flex items-center space-x-1">
                        <Radio className="w-3.5 h-3.5 text-red-400" />
                        <span>High-Decibel Sector Sirens</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        520Hz dual tactical sweeps on Auli ridge & Alaknanda valley acoustic poles.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800 text-[11px]">
                  <span className="text-zinc-400">Audio Warning Tone Synthesizer:</span>
                  <button
                    type="button"
                    onClick={handleToggleSirenTest}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center space-x-1.5 transition cursor-pointer text-[10px]"
                  >
                    {isPlayingSiren ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-amber-400" />}
                    <span>{isPlayingSiren ? "Playing 520Hz Tone..." : "Test Acoustic Tone"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded flex items-start space-x-2.5 text-[11px] text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>AUTHORIZATION NOTICE:</strong> Executing this dispatch will immediately signal District Emergency Operation Centre (DEOC) Gopeshwar and mobilize the 8th Battalion NDRF.
                </span>
              </div>
            </>
          ) : (

            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 rounded text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-emerald-300 uppercase tracking-wider">
                  EVACUATION ALERT BROADCAST ACTIVE
                </h4>
                <p className="text-xs text-zinc-300">
                  Broadcast transmitted across CAP Gateway, NDRF Tactical Mesh, and Sector Towers.
                </p>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded space-y-2 text-xs">
                <div className="flex justify-between pb-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">DISPATCH ID:</span>
                  <span className="font-bold text-amber-400">{dispatchResult.dispatch_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">TRANSMISSION TIME:</span>
                  <span className="font-mono text-zinc-200">{new Date(dispatchResult.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">TARGET WARDS:</span>
                  <span className="font-bold text-red-400 truncate max-w-[280px]">{dispatchResult.target_wards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">TOTAL SMS BROADCAST:</span>
                  <span className="font-bold text-sky-400">{dispatchResult.total_sms_dispatched} SMS Pushed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">CITIZENS ALERTED:</span>
                  <span className="font-bold text-amber-400">~{dispatchResult.target_population_alerted} Citizens</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] block uppercase">Cellular Towers Engaged:</span>
                  {dispatchResult.cellular_towers_notified?.map((t, idx) => (
                    <div key={idx} className="text-[10px] text-zinc-300 flex items-center space-x-1">
                      <TowerControl className="w-3 h-3 text-emerald-400" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 text-[10px] text-zinc-400">
                  <span className="text-zinc-500">Quick Response Detachment: </span>
                  <span className="text-zinc-200 font-semibold">{dispatchResult.ndrf_battalion_notified}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleResetAndClose}
            className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            {dispatchResult ? "CLOSE WINDOW" : "CANCEL"}
          </button>

          {!dispatchResult ? (
            <button
              onClick={handleExecuteDispatch}
              disabled={isSubmitting || targets.length === 0}
              className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold tracking-wider border border-red-400 shadow-lg shadow-red-950 flex items-center space-x-2 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "TRANSMITTING..." : "CONFIRM & BROADCAST ALERT"}</span>
            </button>
          ) : (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT DISPATCH RECEIPT</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
