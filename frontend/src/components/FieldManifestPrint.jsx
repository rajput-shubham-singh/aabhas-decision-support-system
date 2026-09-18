import React from 'react';

export default function FieldManifestPrint({
  rainfall,
  rainfallStatus,
  summary,
  habitations,
  shelters
}) {
  const printDate = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });

  return (
    <div className="print-only p-8 text-black bg-white font-mono text-xs">

      <div className="border-b-2 border-black pb-4 mb-4 text-center">
        <h1 className="text-lg font-black uppercase tracking-wider">
          MINISTRY OF HOME AFFAIRS (MHA) | GOVT OF INDIA
        </h1>
        <h2 className="text-sm font-bold uppercase tracking-wide">
          NATIONAL DISASTER RESPONSE FORCE (NDRF) — 8TH BATTALION
        </h2>
        <h3 className="text-xs uppercase text-gray-700 font-semibold mt-1">
          OPERATIONAL ACTION MANIFEST: JOSHIMATH / ALAKNANDA SECTOR-04 RED ZONE EVACUATION
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 border border-black p-3 mb-4 text-[11px]">
        <div>
          <div><strong>INCIDENT SECTOR:</strong> Joshimath Urban Hazard Corridor (Chamoli, UK)</div>
          <div><strong>GENERATION TIMESTAMP:</strong> {printDate} IST</div>
          <div><strong>SIMULATED PRECIPITATION:</strong> {rainfall} mm (24h Cumulative)</div>
          <div><strong>PRECIPITATION CLASSIFICATION:</strong> {rainfallStatus}</div>
        </div>
        <div>
          <div><strong>TOTAL HABITATIONS MONITORED:</strong> {summary?.total_habitations || 6}</div>
          <div><strong>CRITICAL RED ZONES:</strong> {summary?.red_zone_count || 0} Sectors</div>
          <div><strong>MANDATORY EVACUATION POPULATION:</strong> {summary?.total_red_displaced_population?.toLocaleString() || 0} Individuals</div>
          <div><strong>MAX OVERBURDEN RATIO:</strong> {summary?.max_overburden_ratio || 1.0}x Permissible Limit</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-xs uppercase mb-1">
          PRIORITIZED HABITATIONS ACTION TABLE (SORTED BY RELOCATION PRIORITY INDEX - RPI)
        </h4>
        <table className="print-table w-full text-[10px] border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-1 text-center">RANK</th>
              <th className="border border-black p-1 text-left">HABITATION NAME</th>
              <th className="border border-black p-1 text-center">ZONE</th>
              <th className="border border-black p-1 text-center">RPI</th>
              <th className="border border-black p-1 text-center">SLOPE</th>
              <th className="border border-black p-1 text-center">HOUSES</th>
              <th className="border border-black p-1 text-center">OVERBURDEN</th>
              <th className="border border-black p-1 text-center">CUTOFF RISK</th>
              <th className="border border-black p-1 text-left">ASSIGNED RELIEF SHELTER</th>
            </tr>
          </thead>
          <tbody>
            {(habitations || []).map((hab) => (
              <tr key={hab.id} className={hab.zone === 'RED' ? 'font-bold bg-gray-100' : ''}>
                <td className="border border-black p-1 text-center">#{hab.rank}</td>
                <td className="border border-black p-1">{hab.name} ({hab.soil_type})</td>
                <td className="border border-black p-1 text-center">
                  <strong>{hab.zone}</strong>
                </td>
                <td className="border border-black p-1 text-center">{hab.rpi_score}</td>
                <td className="border border-black p-1 text-center">{hab.slope}°</td>
                <td className="border border-black p-1 text-center">{hab.current_houses}</td>
                <td className="border border-black p-1 text-center">{hab.overburden_ratio}x</td>
                <td className="border border-black p-1 text-center">{Math.round(hab.primary_access_cutoff_risk * 100)}%</td>
                <td className="border border-black p-1">{hab.assigned_shelter?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h4 className="font-bold text-xs uppercase mb-1">
          DESIGNATED RELIEF CAMPS & TRANSIT FACILITIES
        </h4>
        <table className="print-table w-full text-[10px] border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-1 text-left">SHELTER NAME</th>
              <th className="border border-black p-1 text-center">CAPACITY</th>
              <th className="border border-black p-1 text-center">AVAILABLE</th>
              <th className="border border-black p-1 text-center">DISTANCE</th>
              <th className="border border-black p-1 text-left">ATTACHED MEDICAL UNIT</th>
            </tr>
          </thead>
          <tbody>
            {(shelters || []).map((s) => (
              <tr key={s.id}>
                <td className="border border-black p-1 font-semibold">{s.name}</td>
                <td className="border border-black p-1 text-center">{s.capacity}</td>
                <td className="border border-black p-1 text-center">{s.available_beds}</td>
                <td className="border border-black p-1 text-center">{s.distance_km} km</td>
                <td className="border border-black p-1">{s.medical_unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-black text-[10px]">
        <div className="space-y-8">
          <div>FIELD INCIDENT COMMANDER:</div>
          <div className="border-b border-black w-full" />
          <div className="text-gray-600">Name & Designation (NDRF)</div>
        </div>

        <div className="space-y-8">
          <div>DISTRICT MAGISTRATE / DEOC:</div>
          <div className="border-b border-black w-full" />
          <div className="text-gray-600">Signature / Seal (Chamoli)</div>
        </div>

        <div className="space-y-8">
          <div>TRANSPORT & LOGISTICS HEAD:</div>
          <div className="border-b border-black w-full" />
          <div className="text-gray-600">Fleet Deployment Officer</div>
        </div>
      </div>
    </div>
  );
}
