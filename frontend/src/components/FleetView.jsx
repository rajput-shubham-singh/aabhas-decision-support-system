import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Fuel, 
  Users, 
  Clock, 
  Route, 
  Send,
  Navigation
} from 'lucide-react';

const INITIAL_FLEET = [
  { id: 'BUS-01', name: 'NDRF Transit Bus 01', type: '4x4 High-Clearance Bus', capacity: 45, current_pax: 0, assignedSector: 'Upper Sunil Ward', route: 'Sector 04 -> Army Cantt Ground', status: 'READY', driver: 'Havildar R. S. Negi', contact: 'CH-4 VHF (Freq 156.8 MHz)', fuel: 95, readiness: 'Immediate Staging' },
  { id: 'BUS-02', name: 'NDRF Transit Bus 02', type: '4x4 High-Clearance Bus', capacity: 45, current_pax: 38, assignedSector: 'Upper Sunil Ward', route: 'Sector 04 -> Army Cantt Ground', status: 'EN_ROUTE', driver: 'Naik Surendra Rawat', contact: 'CH-4 VHF (Freq 156.8 MHz)', fuel: 88, readiness: 'Convoy Lead' },
  { id: 'BUS-03', name: 'NDRF Transit Bus 03', type: '4x4 High-Clearance Bus', capacity: 45, current_pax: 42, assignedSector: 'Manohar Bagh', route: 'Manohar Bagh -> Tapovan Inter College', status: 'EN_ROUTE', driver: 'Subedar M. Joshi', contact: 'CH-2 VHF (Freq 154.2 MHz)', fuel: 82, readiness: 'In Transit' },
  { id: 'BUS-04', name: 'NDRF Transit Bus 04', type: 'All-Terrain 32-Seater', capacity: 32, current_pax: 0, assignedSector: 'Singhdhar Sector', route: 'Singhdhar -> Pipalkoti Base', status: 'STAGED', driver: 'Constable Amit Chauhan', contact: 'CH-3 VHF (Freq 155.0 MHz)', fuel: 100, readiness: 'Pre-positioned at Bypass' },
  { id: 'BUS-05', name: 'NDRF Transit Bus 05', type: 'All-Terrain 32-Seater', capacity: 32, current_pax: 0, assignedSector: 'Marwari Lower Basti', route: 'Marwari -> Tapovan Inter College', status: 'READY', driver: 'Havildar Deepesh Pundir', contact: 'CH-2 VHF (Freq 154.2 MHz)', fuel: 90, readiness: 'Standby at Helipad' },
  { id: 'BUS-06', name: 'NDRF Transit Bus 06', type: '4x4 Medical Transit Unit', capacity: 20, current_pax: 6, assignedSector: 'Upper Sunil Ward', route: 'Emergency Corridor -> Army Hospital', status: 'DISPATCHED', driver: 'Paramedic Lt. V. Sharma', contact: 'CH-1 Tactical Direct', fuel: 92, readiness: 'Priority Trauma Evac' }
];

export default function FleetView({ habitations = [], onInitiateEvac }) {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [selectedVehicle, setSelectedVehicle] = useState(fleet[0]);
  const [dispatchToast, setDispatchToast] = useState(null);

  const handleDispatchVehicle = (id) => {
    setFleet(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: 'DISPATCHED', readiness: 'Active Convoy En Route' };
      }
      return v;
    }));

    setDispatchToast(`Vehicle ${id} authorized for high-priority transit corridor dispatch.`);
    setTimeout(() => setDispatchToast(null), 3500);
  };

  const handleRadioTest = (v) => {
    setDispatchToast(`VHF Radio Handshake with ${v.name} (${v.driver}) confirmed. Signal: 100%`);
    setTimeout(() => setDispatchToast(null), 3500);
  };

  const totalCapacity = fleet.reduce((acc, v) => acc + v.capacity, 0);
  const activeDispatched = fleet.filter(v => v.status === 'EN_ROUTE' || v.status === 'DISPATCHED').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-4 font-sans text-slate-800 select-none">
      {/* Toast Notification */}
      {dispatchToast && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-emerald-500/50 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold">{dispatchToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-900 text-amber-400">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                NDRF 8TH BATTALION • EVACUATION FLEET &amp; TRANSIT LOGISTICS
              </h1>
              <p className="text-xs text-slate-500">
                Joshimath Sector 04 Dedicated Emergency Convoy &amp; Arterial Road Clearance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Fleet Units</div>
            <div className="text-lg font-black text-slate-900 font-mono-data">18 Dedicated</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Active Convoys</div>
            <div className="text-lg font-black text-emerald-700 font-mono-data">{activeDispatched} Active</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-blue-900">Throughput</div>
            <div className="text-lg font-black text-blue-900 font-mono-data">{totalCapacity * 3} pax/hr</div>
          </div>
          {onInitiateEvac && (
            <button
              onClick={onInitiateEvac}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 uppercase tracking-wide cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Full Convoy Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* Fleet Table & Vehicle Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Tactical Roster Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-900" />
              <span>Active Transit Units &amp; Assigned Corridors</span>
            </h2>
            <span className="text-[10px] font-mono-data font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              GPS REFRESH: LIVE
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <th className="p-3">Vehicle ID</th>
                  <th className="p-3">Assigned Sector</th>
                  <th className="p-3">Transit Corridor</th>
                  <th className="p-3">Pax Load</th>
                  <th className="p-3">Readiness</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleet.map((v) => {
                  const isDispatched = v.status === 'DISPATCHED' || v.status === 'EN_ROUTE';
                  const isSelected = selectedVehicle.id === v.id;

                  return (
                    <tr 
                      key={v.id} 
                      onClick={() => setSelectedVehicle(v)}
                      className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 font-mono-data">
                        <div className="font-bold text-slate-900">{v.id}</div>
                        <div className="text-[10px] text-slate-500">{v.type}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{v.assignedSector}</div>
                        <div className="text-[10px] text-slate-500 font-mono-data">{v.driver}</div>
                      </td>
                      <td className="p-3 font-mono-data text-[11px] text-slate-700">
                        {v.route}
                      </td>
                      <td className="p-3 font-mono-data">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{v.current_pax}</span>
                          <span className="text-slate-400">/</span>
                          <span>{v.capacity}</span>
                        </div>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${v.current_pax > 0 ? 'bg-blue-600' : 'bg-slate-400'}`} 
                            style={{ width: `${(v.current_pax / v.capacity) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isDispatched 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchVehicle(v.id);
                          }}
                          disabled={isDispatched}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            isDispatched
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-blue-900 hover:bg-blue-800 text-white shadow-xs cursor-pointer'
                          }`}
                        >
                          {isDispatched ? 'Dispatched' : 'Dispatch'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Vehicle Telemetry Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 uppercase">Unit Telemetry Dossier</h3>
              </div>
              <span className="font-mono-data text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedVehicle.id}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">Unit Designation</div>
                <div className="font-bold text-slate-900 text-sm">{selectedVehicle.name}</div>
                <div className="text-[11px] text-slate-600">{selectedVehicle.type}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Platoon Driver</span>
                  <span className="font-bold text-slate-800">{selectedVehicle.driver}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Fuel Reserve</span>
                  <span className="font-bold text-emerald-700 font-mono-data flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-emerald-600" /> {selectedVehicle.fuel}% (Full Tank)
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold uppercase text-[10px]">VHF Comms Channel:</span>
                  <span className="font-mono-data text-blue-900 font-semibold">{selectedVehicle.contact}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold uppercase text-[10px]">Target Habitation:</span>
                  <span className="font-bold text-slate-800">{selectedVehicle.assignedSector}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold uppercase text-[10px]">Transit Route:</span>
                  <span className="font-mono-data text-slate-700 truncate max-w-[170px]" title={selectedVehicle.route}>
                    {selectedVehicle.route}
                  </span>
                </div>
              </div>

              {/* Road Condition Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900">
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>NH-7 Arterial Road Status</span>
                </div>
                Single-lane traffic active at Marwari Bridge due to slope seepage. BRO dozer on standby.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => handleRadioTest(selectedVehicle)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-blue-900" />
              <span>VHF Check</span>
            </button>
            <button
              onClick={() => handleDispatchVehicle(selectedVehicle.id)}
              disabled={selectedVehicle.status === 'DISPATCHED'}
              className={`flex-1 py-2 font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all ${
                selectedVehicle.status === 'DISPATCHED'
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-800 text-white cursor-pointer'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{selectedVehicle.status === 'DISPATCHED' ? 'Dispatched' : 'Authorize Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
