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
  Building2,
  Droplets,
  Layers,
  Truck,
  Award,
  Users,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

const INITIAL_SHELTERS = [
  {
    id: 'camp-gopeshwar',
    name: 'Gopeshwar District Sports Stadium',
    alt_name: 'Primary Macro-Relief Hub',
    location: 'Gopeshwar Terrace (Chamoli District HQ)',
    lat: 30.4135,
    lon: 79.3245,
    distanceKm: 28.5,
    total_bed_capacity: 3200,
    capacity: 3200,
    totalBeds: 3200,
    current_occupancy: 450,
    occupancy: 450,
    available_beds: 2750,
    rations_days: 30,
    dryRationsPercent: 95,
    safe_corridor: 'Gopeshwar-Mandal Axis',
    authority: 'District Magistrate Chamoli',
    medical_unit: 'District Hospital Gopeshwar (300-Bed)',
    medical_personnel: 24,
    sanitation_units: 95,
    water_available_liters_day: 240000,
    road_accessibility: 'ALL_WEATHER_PAVED',
    doctorOnDuty: 'Chief Medical Officer Dr. R. S. Negi',
    powerBackup: 'Dual 500 kVA Grid Tie DG Units',
    waterStorageLtr: '240,000 Litres Municipal Reserve',
    foodPackets: 12000,
    suitability_score: 96.5,
    status: 'OPERATIONAL'
  },
  {
    id: 'camp-gauchar',
    name: 'Gauchar Civil Airstrip Transit Center',
    alt_name: 'Strategic Air-Evacuation Node',
    location: 'Gauchar River Terrace (Air-Evac Axis)',
    lat: 30.2850,
    lon: 79.1550,
    distanceKm: 58.0,
    total_bed_capacity: 4500,
    capacity: 4500,
    totalBeds: 4500,
    current_occupancy: 620,
    occupancy: 620,
    available_beds: 3880,
    rations_days: 45,
    dryRationsPercent: 98,
    safe_corridor: 'Gauchar Air Corridor & NH-58',
    authority: 'Indian Air Force / NDRF 8th Bn',
    medical_unit: 'IAF Mobile Surgical Hospital & Trauma Hub',
    medical_personnel: 35,
    sanitation_units: 140,
    water_available_liters_day: 337500,
    road_accessibility: 'AIRLIFT_AND_HEAVY_HIGHWAY',
    doctorOnDuty: 'Wing Commander Dr. A. Sharma (IAF Med)',
    powerBackup: '750 kVA Dedicated Military Generators',
    waterStorageLtr: '337,500 Litres Dedicated Strategic Supply',
    foodPackets: 15000,
    suitability_score: 98.0,
    status: 'OPERATIONAL'
  },
  {
    id: 'camp-pipalkoti',
    name: 'Pipalkoti Intermediate Relief Center',
    alt_name: 'TRC & Mandir Samiti Complex',
    location: 'Pipalkoti Mid-Valley Shelf (NH-07 Axis)',
    lat: 30.4289,
    lon: 79.4325,
    distanceKm: 32.0,
    total_bed_capacity: 1450,
    capacity: 1450,
    totalBeds: 1450,
    current_occupancy: 380,
    occupancy: 380,
    available_beds: 1070,
    rations_days: 20,
    dryRationsPercent: 86,
    safe_corridor: 'NH-07 Lower Axis',
    authority: 'Chamoli District Admin / SDM Pipalkoti',
    medical_unit: 'Pipalkoti Emergency Care Centre',
    medical_personnel: 12,
    sanitation_units: 48,
    water_available_liters_day: 108750,
    road_accessibility: 'HEAVY_VEHICLE_CLEAR',
    doctorOnDuty: 'Dr. Neha Rawat (Civil MO) / NDRF Surgeon',
    powerBackup: '150 kVA Silent DG Set',
    waterStorageLtr: '108,750 Litres Potable Supply',
    foodPackets: 4500,
    suitability_score: 89.0,
    status: 'OPERATIONAL'
  },
  {
    id: 'camp-cantt',
    name: 'Military Cantonment & ITBP High-Ground Spur',
    alt_name: 'Joshimath Immediate Refuge',
    location: 'Upper Military Spur, Joshimath',
    lat: 30.5465,
    lon: 79.5690,
    distanceKm: 2.2,
    total_bed_capacity: 850,
    capacity: 850,
    totalBeds: 850,
    current_occupancy: 180,
    occupancy: 180,
    available_beds: 670,
    rations_days: 25,
    dryRationsPercent: 92,
    safe_corridor: 'Military High-Ground Ridge',
    authority: 'Indian Army / ITBP 1st Bn',
    medical_unit: 'Army Military Hospital (MH) Ward',
    medical_personnel: 18,
    sanitation_units: 36,
    water_available_liters_day: 63750,
    road_accessibility: 'AIRLIFT_AND_CONVOY',
    doctorOnDuty: 'Lt. Col. Dr. S. K. Bhatt (AMC)',
    powerBackup: 'Dual 250 kVA Grid Tie DG Units',
    waterStorageLtr: '63,750 Litres Military Reserve',
    foodPackets: 3000,
    suitability_score: 91.5,
    status: 'OPERATIONAL'
  }
];

export default function SheltersView({ 
  camps = [], 
  relocationPlan = [], 
  rainfall = 65,
  onOpenLogisticsModal 
}) {
  const [actionNotice, setActionNotice] = useState(null);
  const [manifestFilter, setManifestFilter] = useState('ALL');

  const displayedCamps = (camps && camps.length > 0) ? camps.map((liveCamp, idx) => {
    const fallback = INITIAL_SHELTERS.find(f => f.id === liveCamp.id) || INITIAL_SHELTERS[idx] || {};
    return {
      ...fallback,
      ...liveCamp,
      name: liveCamp.name || fallback.name,
      totalCapacity: liveCamp.total_bed_capacity || liveCamp.capacity || fallback.total_bed_capacity || 500,
      currentOccupancy: liveCamp.live_occupancy !== undefined ? liveCamp.live_occupancy : (liveCamp.occupancy || fallback.current_occupancy || 0),
      availableBeds: liveCamp.live_available_beds !== undefined ? liveCamp.live_available_beds : (liveCamp.available_beds || fallback.available_beds || 0),
      suitabilityScore: liveCamp.suitability_score !== undefined ? liveCamp.suitability_score : fallback.suitability_score,
      lpcd: liveCamp.lpcd_live || Math.round((liveCamp.water_available_liters_day || 50000) / Math.max(1, (liveCamp.live_occupancy || 100))),
      sanitationRatio: liveCamp.persons_per_toilet || Math.round((liveCamp.live_occupancy || 100) / Math.max(1, liveCamp.sanitation_units || 25)),
      medicalStaff: liveCamp.medical_personnel || fallback.medical_personnel || 8,
      roadAccess: liveCamp.road_accessibility || fallback.road_accessibility || 'TWO_WAY_PAVED'
    };
  }) : INITIAL_SHELTERS;

  const totalCapacity = displayedCamps.reduce((acc, s) => acc + (s.totalCapacity || s.total_bed_capacity || s.capacity || 0), 0);
  const totalOccupancy = displayedCamps.reduce((acc, s) => acc + (s.currentOccupancy || s.live_occupancy || s.occupancy || 0), 0);
  const totalAvailableBeds = Math.max(0, totalCapacity - totalOccupancy);
  const overflowCount = relocationPlan.filter(p => p.is_overflow_split).length;

  const filteredManifest = manifestFilter === 'OVERFLOW' 
    ? relocationPlan.filter(p => p.is_overflow_split) 
    : relocationPlan;

  const handleRequestSupplies = (shelterName) => {
    setActionNotice(`Supply Requisition Order logged with Chamoli District Food & Supplies Department for ${shelterName}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAlertMedical = (shelterName) => {
    setActionNotice(`Medical Trauma Team standby order dispatched to ${shelterName}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-5 font-sans text-slate-800 select-none">

      {actionNotice && (
        <div className="fixed top-28 right-6 z-50 bg-slate-900 text-white border border-blue-500/50 shadow-2xl px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <PackageCheck className="w-5 h-5 text-blue-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-lg bg-blue-900 text-amber-400 shadow-2xs">
            <Tent className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                SAFE RELIEF CAMPS &amp; CARRYING CAPACITY LOGISTICS
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded font-mono-data">
                MHA SOVEREIGN HUB
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Verified Gneiss/Quartzite Stable Bedrock Nodes (Zero Sinking Hazard Overlap) • Real-Time Constrained Allocation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Shelter Grid</div>
            <div className="text-lg font-black text-slate-900 font-mono-data">{totalCapacity.toLocaleString()} Beds</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Available Vacancies</div>
            <div className="text-lg font-black text-emerald-700 font-mono-data">{totalAvailableBeds.toLocaleString()} Free</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-blue-900">Current Occupancy</div>
            <div className="text-lg font-black text-blue-900 font-mono-data">
              {Math.round((totalOccupancy / Math.max(1, totalCapacity)) * 100)}% ({totalOccupancy.toLocaleString()})
            </div>
          </div>
          {onOpenLogisticsModal && (
            <button
              onClick={onOpenLogisticsModal}
              className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Full Manifest Modal</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-900" />
            1. Verified Safe Reception Nodes (Multi-Vector Diagnostic Profiles)
          </h2>
          <span className="text-[11px] font-mono-data text-slate-500">
            Automated Live Suitability Scoring Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedCamps.map((s) => {
            const occPercent = Math.round((s.currentOccupancy / Math.max(1, s.totalCapacity)) * 100);
            const score = s.suitabilityScore !== undefined ? s.suitabilityScore : 85.0;
            const isFull = occPercent >= 100;

            return (
              <div 
                key={s.id}
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >

                <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <span className="text-[9px] font-mono-data font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                        {s.id}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1 leading-snug">{s.name}</h3>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{s.safe_corridor || s.safeCorridor}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Suitability</div>
                      <div className={`text-xs font-black font-mono-data px-1.5 py-0.5 rounded border inline-block ${
                        score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        score >= 60 ? 'bg-blue-50 text-blue-800 border-blue-300' :
                        'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {score}/100
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 space-y-3 text-xs">

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Bed className="w-3.5 h-3.5 text-blue-900" /> Bed Occupancy
                      </span>
                      <span className="font-mono-data text-slate-900 font-bold">
                        {s.currentOccupancy} / {s.totalCapacity} ({occPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          occPercent >= 100 ? 'bg-red-600' : (occPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`} 
                        style={{ width: `${Math.min(100, occPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 font-mono-data">
                      <span className="text-emerald-700 font-semibold">{s.availableBeds} beds free</span>
                      <span className="text-slate-500">{isFull ? '100% Saturation' : 'Within Limit'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                      <div className="text-slate-500 font-medium flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-600" /> Water LPCD
                      </div>
                      <div className="font-mono-data font-bold text-slate-900 mt-0.5">
                        {s.lpcd ? `${s.lpcd} L/cap` : '75 L/cap'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                      <div className="text-slate-500 font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-600" /> Sanitation
                      </div>
                      <div className="font-mono-data font-bold text-slate-900 mt-0.5">
                        {s.sanitation_units || s.sanitationUnits || 30} Units
                      </div>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                      <div className="text-slate-500 font-medium flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-red-600" /> Medical
                      </div>
                      <div className="font-mono-data font-bold text-slate-900 mt-0.5">
                        {s.medicalStaff} Doctors
                      </div>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                      <div className="text-slate-500 font-medium flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-600" /> Access
                      </div>
                      <div className="font-mono-data font-bold text-slate-800 mt-0.5 truncate">
                        {s.roadAccess}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                    <div><strong>Authority:</strong> {s.authority}</div>
                    <div className="truncate"><strong>Medical Cell:</strong> {s.medical_unit || s.medicalUnit}</div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => handleRequestSupplies(s.name)}
                    className="flex-1 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded border border-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3 h-3 text-blue-900" />
                    <span>Supplies</span>
                  </button>
                  <button
                    onClick={() => handleAlertMedical(s.name)}
                    className="flex-1 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <PhoneCall className="w-3 h-3 text-amber-400" />
                    <span>Medical</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-900" />
              2. Live Habitation Relocation Manifest (Constrained Optimization Engine)
            </h2>
            <p className="text-[11px] text-slate-500">
              Autonomous matching of distressed wards to safe camps with automatic overflow cohort splitting
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setManifestFilter('ALL')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                manifestFilter === 'ALL' ? 'bg-blue-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Routes ({relocationPlan.length})
            </button>
            <button
              onClick={() => setManifestFilter('OVERFLOW')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                manifestFilter === 'OVERFLOW' ? 'bg-amber-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-300" />
              <span>Overflow Splits ({overflowCount})</span>
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Origin Ward</th>
                  <th className="p-2.5">Hazard Tier</th>
                  <th className="p-2.5">Destination Safe Camp</th>
                  <th className="p-2.5">Safe Transit Corridor</th>
                  <th className="p-2.5 text-right">Allotted Citizens</th>
                  <th className="p-2.5 text-right">Camp Post-Occ %</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredManifest.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                      No distressed sectors require active relocation under current baseline conditions.
                    </td>
                  </tr>
                ) : (
                  filteredManifest.map((row, idx) => {
                    const isRed = row.hazard_tier === 'CRITICAL_RED' || row.priority === 'URGENT';
                    const isSplit = row.is_overflow_split;

                    return (
                      <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${isSplit ? 'bg-amber-50/25' : ''}`}>
                        <td className="p-2.5 font-mono-data font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{row.from_ward}</span>
                            {isSplit && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-mono-data font-bold">
                                SPLIT OVERFLOW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isRed ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {row.hazard_tier || (isRed ? 'CRITICAL_RED' : 'WARNING_AMBER')}
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold text-blue-950">{row.to_camp}</td>
                        <td className="p-2.5 text-slate-600 font-mono-data text-[11px]">{row.safe_corridor}</td>
                        <td className="p-2.5 text-right font-mono-data font-black text-slate-900">{row.displaced_pop?.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono-data font-bold">
                          <span className={row.camp_post_occupancy_pct >= 100 ? 'text-red-600' : 'text-slate-700'}>
                            {row.camp_post_occupancy_pct}%
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                            row.priority === 'URGENT' ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {row.priority === 'URGENT' ? 'DISPATCHED' : 'ALLOCATED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
