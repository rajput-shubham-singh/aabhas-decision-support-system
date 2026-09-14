import React, { useState } from 'react';
import { 
  Tent, 
  Bed, 
  Utensils, 
  HeartPulse, 
  Zap, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  PlusCircle, 
  PhoneCall, 
  PackageCheck,
  Building2
} from 'lucide-react';

const INITIAL_SHELTERS = [
  {
    id: 'CAMP_01',
    name: 'Military Cantonment & Helipad',
    altName: 'Army Cantonment Staging Base',
    location: 'Joshimath High Plateau (High Gneiss Plateau Axis)',
    lat: 30.5435,
    lon: 79.5710,
    distanceKm: 2.2,
    totalCapacity: 850,
    currentOccupancy: 180,
    availableBeds: 670,
    dryRationsStockDays: 21,
    dryRationsPercent: 95,
    safeCorridor: 'High Gneiss Plateau Axis',
    authority: 'Indian Army 9th (I) Mtn Bde',
    medicalUnit: 'Army Military Hospital (MH) Ward',
    doctorOnDuty: 'Lt. Col. Dr. S. K. Bhatt (AMC)',
    powerBackup: 'Dual 250 kVA Grid Tie DG Units',
    waterStorageLtr: '60,000 Litres Military Reserve',
    status: 'OPERATIONAL'
  },
  {
    id: 'CAMP_02',
    name: 'ITBP First Responder Transit Node',
    altName: 'ITBP Joshimath Staging Area',
    location: 'Auli Ridge Bypass Junction (ITBP 1st Bn)',
    lat: 30.5685,
    lon: 79.5520,
    distanceKm: 3.1,
    totalCapacity: 600,
    currentOccupancy: 95,
    availableBeds: 505,
    dryRationsStockDays: 18,
    dryRationsPercent: 88,
    safeCorridor: 'Auli Ridge Bypass',
    authority: 'ITBP 1st Battalion Staging',
    medicalUnit: 'ITBP Tactical Trauma Team',
    doctorOnDuty: 'Maj. Dr. Anand Verma (ITBP MO)',
    powerBackup: '125 kVA Hybrid Solar + DG',
    waterStorageLtr: '35,000 Litres Clean Reservoir',
    status: 'OPERATIONAL'
  },
  {
    id: 'CAMP_03',
    name: 'Tapovan GIC Civil Center',
    altName: 'Tapovan Relief Center',
    location: 'Tapovan Safe River Terrace (Malari Link Route)',
    lat: 30.4950,
    lon: 79.6320,
    distanceKm: 12.0,
    totalCapacity: 450,
    currentOccupancy: 120,
    availableBeds: 330,
    dryRationsStockDays: 10,
    dryRationsPercent: 72,
    safeCorridor: 'Malari Link Route',
    authority: 'Uttarakhand SDM Civil Sector',
    medicalUnit: 'Primary Health Centre (PHC) Annex',
    doctorOnDuty: 'Dr. Vivek Joshi (SDM Emergency Cell)',
    powerBackup: '100 kVA Hybrid Solar + DG',
    waterStorageLtr: '25,000 Litres Filtered Reservoir',
    status: 'OPERATIONAL'
  },
  {
    id: 'CAMP_04',
    name: 'Pipalkoti Intermediate Staging Center',
    altName: 'Pipalkoti Transit Camp',
    location: 'Pipalkoti Safe Valley Terminal (NH-07 Axis)',
    lat: 30.4289,
    lon: 79.4325,
    distanceKm: 32.0,
    totalCapacity: 1200,
    currentOccupancy: 410,
    availableBeds: 790,
    dryRationsStockDays: 14,
    dryRationsPercent: 85,
    safeCorridor: 'NH-07 Axis',
    authority: 'NDRF 8th Bn / Chamoli District Admin',
    medicalUnit: 'Level-2 Field Surgical Facility',
    doctorOnDuty: 'Dr. Neha Rawat (Civil MO) / NDRF Surgeon',
    powerBackup: '150 kVA Silent DG Set (Active)',
    waterStorageLtr: '50,000 Litres Potable Supply',
    status: 'OPERATIONAL'
  }
];

export default function SheltersView({ onSelectShelter }) {
  const [shelters, setShelters] = useState(INITIAL_SHELTERS);
  const [actionNotice, setActionNotice] = useState(null);

  const totalCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const totalAvailableBeds = shelters.reduce((acc, s) => acc + s.availableBeds, 0);

  const handleRequestSupplies = (shelterName) => {
    setActionNotice(`Supply Requisition Order logged with Chamoli District Food & Supplies Department for ${shelterName}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAlertMedical = (shelterName) => {
    setActionNotice(`Medical Trauma Team standby order dispatched to ${shelterName}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-4 font-sans text-slate-800 select-none">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-blue-500/50 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <PackageCheck className="w-5 h-5 text-blue-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-blue-900 text-amber-400">
            <Tent className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              DESIGNATED SAFE RELIEF RECEPTION CENTERS &amp; LOGISTICS
            </h1>
            <p className="text-xs text-slate-500">
              MHA / SDRF Approved Stable Bedrock Shelters &amp; Humanitarian Supply Stockpiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Shelter Capacity</div>
            <div className="text-lg font-black text-slate-900 font-mono-data">{totalCapacity} Beds</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Available Vacancies</div>
            <div className="text-lg font-black text-emerald-700 font-mono-data">{totalAvailableBeds} Beds Free</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] uppercase font-bold text-blue-900">Current Occupancy</div>
            <div className="text-lg font-black text-blue-900 font-mono-data">
              {Math.round((totalOccupancy / totalCapacity) * 100)}% ({totalOccupancy} Souls)
            </div>
          </div>
        </div>
      </div>

      {/* Shelter Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {shelters.map((s) => {
          const occPercent = Math.round((s.currentOccupancy / s.totalCapacity) * 100);

          return (
            <div 
              key={s.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono-data font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                      {s.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{s.name}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.location} ({s.distanceKm} km transit)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {s.status}
                  </span>
                </div>
              </div>

              {/* Card Body Metrics */}
              <div className="p-4 space-y-3.5 text-xs">
                {/* Bed Occupancy Meter */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Bed className="w-3.5 h-3.5 text-blue-900" /> Bed Occupancy
                    </span>
                    <span className="font-mono-data text-slate-900">
                      {s.currentOccupancy} / {s.totalCapacity} ({occPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all ${
                        occPercent < 50 ? 'bg-emerald-500' : (occPercent < 80 ? 'bg-amber-500' : 'bg-red-600')
                      }`} 
                      style={{ width: `${occPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1 font-mono-data">
                    + {s.availableBeds} beds currently sanitized &amp; ready
                  </div>
                </div>

                {/* Dry Rations Stock Meter */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" /> Dry Rations &amp; Food Stock
                    </span>
                    <span className="font-mono-data text-slate-900">
                      {s.dryRationsStockDays} Days Reserve ({s.dryRationsPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-amber-500 transition-all" 
                      style={{ width: `${s.dryRationsPercent}%` }}
                    />
                  </div>
                </div>

                {/* Logistics Badges */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" /> Medical Cell:
                    </span>
                    <span className="font-bold text-slate-800 text-right truncate max-w-[180px]" title={s.medicalUnit}>
                      {s.medicalUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Power Backup:
                    </span>
                    <span className="font-mono-data text-slate-800 text-right text-[10px]">
                      {s.powerBackup}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">Water Reserve:</span>
                    <span className="font-mono-data text-slate-800 font-bold">{s.waterStorageLtr}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                <button
                  onClick={() => handleRequestSupplies(s.name)}
                  className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded border border-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-900" />
                  <span>Request Supplies</span>
                </button>
                <button
                  onClick={() => handleAlertMedical(s.name)}
                  className="flex-1 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Medical Standby</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
