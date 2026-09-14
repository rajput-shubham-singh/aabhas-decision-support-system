import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Tent, Shield, Navigation, Crosshair, Eye, EyeOff, Layers } from 'lucide-react';

const tacticalStyles = `
  @keyframes sonarPulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 0.3; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }
  .radar-ring {
    animation: sonarPulse 2.4s ease-in-out infinite;
    transform-origin: center;
  }
  
  @keyframes flowDashUrgent {
    to {
      stroke-dashoffset: -28;
    }
  }
  @keyframes flowDashStandby {
    to {
      stroke-dashoffset: -20;
    }
  }

  .corridor-polyline-urgent {
    animation: flowDashUrgent 1.2s linear infinite;
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
  }

  .corridor-polyline-standby {
    animation: flowDashStandby 2.2s linear infinite;
    filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
  }

  .leaflet-popup-content-wrapper {
    background: #0f172a !important;
    color: #f8fafc !important;
    border: 1px solid #334155;
    border-radius: 6px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  }
  .leaflet-popup-tip {
    background: #0f172a !important;
  }
  
  .camp-marker-badge {
    background: #022c22;
    border: 2px solid #10b981;
    color: #ffffff;
    border-radius: 6px;
    padding: 3px 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 10px;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(0,0,0,0.8), 0 0 12px rgba(16, 185, 129, 0.6);
    white-space: nowrap;
    cursor: pointer;
    transform: translate(-50%, -50%);
    transition: all 0.2s ease;
  }
  .camp-marker-badge:hover {
    transform: translate(-50%, -50%) scale(1.08);
    border-color: #34d399;
    box-shadow: 0 6px 18px rgba(0,0,0,0.9), 0 0 16px rgba(52, 211, 153, 0.8);
  }
`;

// Helper to generate custom tactical Leaflet icons for safe relief camps
const createCampDivIcon = (camp) => {
  const shortName = camp.name
    .replace("Relief Center", "")
    .replace("Transit Hub", "")
    .replace("Intermediate Staging Center", "Staging")
    .replace("First Responder Transit Node", "Transit")
    .replace("Civil Center", "")
    .replace("& Helipad", "")
    .trim();
  const occ = camp.live_occupancy ?? camp.occupancy ?? 100;
  const cap = camp.capacity ?? 500;
  const occPct = Math.round((occ / cap) * 100);

  return L.divIcon({
    className: 'custom-camp-div-icon',
    html: `
      <div class="camp-marker-badge">
        <span style="font-size: 13px;">🛡️</span>
        <div style="display: flex; flex-direction: column; line-height: 1.1; text-align: left;">
          <span style="font-size: 7.5px; color: #4ade80; font-weight: 800; letter-spacing: 0.5px;">SAFE STAGING AREA</span>
          <span style="font-size: 9.5px; color: #ffffff; font-weight: bold;">${shortName}</span>
        </div>
        <span style="font-size: 8.5px; padding: 1px 4px; border-radius: 3px; background: #059669; color: #fff; font-weight: bold; margin-left: 2px;">
          ${occ}/${cap}
        </span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

function MapController({ 
  selectedWard, 
  focusCorridorsTrigger, 
  camps = [], 
  corridors = [],
  onPipalkotiVisibilityChange = () => {}
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  // Viewport tracking for off-screen Pipalkoti beacon
  useEffect(() => {
    const checkVisibility = () => {
      try {
        const bounds = map.getBounds();
        const pipalkotiCoords = [30.4289, 79.4325];
        const isVisible = bounds.contains(pipalkotiCoords);
        onPipalkotiVisibilityChange(isVisible);
      } catch (e) {
        // ignore during initial mount
      }
    };

    checkVisibility();
    map.on('moveend', checkVisibility);
    map.on('zoomend', checkVisibility);

    return () => {
      map.off('moveend', checkVisibility);
      map.off('zoomend', checkVisibility);
    };
  }, [map, onPipalkotiVisibilityChange]);

  useEffect(() => {
    if (selectedWard && selectedWard.coords) {
      map.flyTo(selectedWard.coords, 16, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    } else if (selectedWard && selectedWard.lat && (selectedWard.lon || selectedWard.lng)) {
      map.flyTo([selectedWard.lat, selectedWard.lon || selectedWard.lng], 16, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    }
  }, [selectedWard, map]);

  useEffect(() => {
    if (focusCorridorsTrigger > 0) {
      const allPoints = [];
      camps.forEach(c => {
        if (c.coords) allPoints.push(c.coords);
        else if (c.lat && c.lon) allPoints.push([c.lat, c.lon]);
      });
      corridors.forEach(corr => {
        if (corr.from_coords) allPoints.push(corr.from_coords);
        if (corr.to_coords) allPoints.push(corr.to_coords);
      });

      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.8,
          easeLinearity: 0.25
        });
      }
    }
  }, [focusCorridorsTrigger, map, camps, corridors]);

  return null;
}

export default function TacticalMap({ 
  selectedWard = null, 
  onSelectWard = () => {},
  rainfall = 65,
  habitations = [],
  camps = [],
  evacuationCorridors = [],
  showCorridorsDefault = true
}) {
  const [showCorridors, setShowCorridors] = useState(showCorridorsDefault);
  const [showCamps, setShowCamps] = useState(true);
  const [focusCorridorsTrigger, setFocusCorridorsTrigger] = useState(0);
  const [isPipalkotiInView, setIsPipalkotiInView] = useState(false);

  // 4 Verified Stable Bedrock Relief Camps (100% OUTSIDE all red/amber hazard polygons)
  const fallbackCamps = [
    {
      id: "camp-1",
      name: "Military Cantonment & Helipad",
      alt_name: "Army Cantonment Staging Base",
      coords: [30.5435, 79.5710],
      lat: 30.5435,
      lon: 79.5710,
      capacity: 850,
      occupancy: 180,
      available_beds: 670,
      safe_corridor: "High Gneiss Plateau Axis",
      authority: "Indian Army 9th (I) Mtn Bde",
      rations_days: 21,
      medical_unit: "Army Military Hospital (MH) Ward",
      status: "OPERATIONAL"
    },
    {
      id: "camp-2",
      name: "ITBP First Responder Transit Node",
      alt_name: "ITBP Joshimath Staging Area",
      coords: [30.5685, 79.5520],
      lat: 30.5685,
      lon: 79.5520,
      capacity: 600,
      occupancy: 95,
      available_beds: 505,
      safe_corridor: "Auli Ridge Bypass",
      authority: "ITBP 1st Battalion Staging",
      rations_days: 18,
      medical_unit: "ITBP Tactical Trauma Team",
      status: "OPERATIONAL"
    },
    {
      id: "camp-3",
      name: "Tapovan GIC Civil Center",
      alt_name: "Tapovan Relief Center",
      coords: [30.4950, 79.6320],
      lat: 30.4950,
      lon: 79.6320,
      capacity: 450,
      occupancy: 120,
      available_beds: 330,
      safe_corridor: "Malari Link Route",
      authority: "Uttarakhand SDM Civil Sector",
      rations_days: 10,
      medical_unit: "Primary Health Centre (PHC) Annex",
      status: "OPERATIONAL"
    },
    {
      id: "camp-4",
      name: "Pipalkoti Intermediate Staging Center",
      alt_name: "Pipalkoti Transit Camp",
      coords: [30.4289, 79.4325],
      lat: 30.4289,
      lon: 79.4325,
      capacity: 1200,
      occupancy: 410,
      available_beds: 790,
      safe_corridor: "NH-07 Axis",
      authority: "NDRF 8th Bn / Chamoli District Admin",
      rations_days: 14,
      medical_unit: "Level-2 Field Surgical Facility",
      status: "OPERATIONAL"
    }
  ];

  const activeCamps = camps.length > 0 ? camps : fallbackCamps;

  const handleToggleCorridors = () => {
    const nextState = !showCorridors;
    setShowCorridors(nextState);
    if (nextState) {
      // Auto-fit bounds including all 4 camps and sectors with [50, 50] padding
      setFocusCorridorsTrigger(prev => prev + 1);
    }
  };

  // 6 Verified Sinking Sector Geofences (Central & Lower Colluvium Slip Zones)
  const baseSectors = [
    {
      id: "ward-1",
      numericId: 1,
      wardNo: 3,
      name: "Upper Sunil (Ward 3)",
      searchName: "upper sunil",
      coords: [30.5588, 79.5580],
      polygon: [
        [30.5606, 79.5558],
        [30.5602, 79.5602],
        [30.5570, 79.5600],
        [30.5572, 79.5556]
      ],
      slope: "38.5°",
      subsidenceRate: "12.4 mm/week",
      population: 890,
      vulnerableUnits: 178,
      dwellings: 178,
      crackedUnits: 84,
      geology: "Loose Glacial Till & Colluvium",
      evacRoute: "Military Cantonment & Helipad"
    },
    {
      id: "ward-2",
      numericId: 2,
      wardNo: 5,
      name: "Manohar Bagh (Ward 5)",
      searchName: "manohar bagh",
      coords: [30.5565, 79.5680],
      polygon: [
        [30.5582, 79.5660],
        [30.5580, 79.5702],
        [30.5548, 79.5700],
        [30.5550, 79.5658]
      ],
      slope: "34.2°",
      subsidenceRate: "6.8 mm/week",
      population: 740,
      vulnerableUnits: 154,
      dwellings: 154,
      crackedUnits: 66,
      geology: "Unconsolidated Moraine Scree",
      evacRoute: "Tapovan GIC Civil Center"
    },
    {
      id: "ward-3",
      numericId: 3,
      wardNo: 4,
      name: "Singhdhar (Ward 4)",
      searchName: "singhdhar",
      coords: [30.5542, 79.5635],
      polygon: [
        [30.5558, 79.5615],
        [30.5554, 79.5655],
        [30.5526, 79.5652],
        [30.5528, 79.5616]
      ],
      slope: "41.0°",
      subsidenceRate: "16.1 mm/week",
      population: 780,
      vulnerableUnits: 162,
      dwellings: 162,
      crackedUnits: 98,
      geology: "Fractured Gneissic Base + Saturated Silt",
      evacRoute: "Pipalkoti Intermediate Staging Center"
    },
    {
      id: "ward-4",
      numericId: 4,
      wardNo: 2,
      name: "Marwari (Ward 2)",
      searchName: "marwari",
      coords: [30.5615, 79.5740],
      polygon: [
        [30.5632, 79.5718],
        [30.5630, 79.5762],
        [30.5598, 79.5760],
        [30.5600, 79.5716]
      ],
      slope: "28.0°",
      subsidenceRate: "5.1 mm/week",
      population: 960,
      vulnerableUnits: 192,
      dwellings: 192,
      crackedUnits: 58,
      geology: "Alaknanda Flood Plain River Silt",
      evacRoute: "ITBP First Responder Transit Node"
    },
    {
      id: "ward-5",
      numericId: 5,
      wardNo: 1,
      name: "Gandhi Nagar (Ward 1)",
      searchName: "gandhi nagar",
      coords: [30.5510, 79.5595],
      polygon: [
        [30.5528, 79.5575],
        [30.5525, 79.5615],
        [30.5492, 79.5612],
        [30.5495, 79.5576]
      ],
      slope: "22.0°",
      subsidenceRate: "1.9 mm/week",
      population: 690,
      vulnerableUnits: 138,
      dwellings: 138,
      crackedUnits: 34,
      geology: "Semi-compacted Quartzite Regolith",
      evacRoute: "Military Cantonment & Helipad"
    },
    {
      id: "ward-6",
      numericId: 6,
      wardNo: 9,
      name: "Ravigram (Ward 9)",
      searchName: "ravigram",
      coords: [30.5502, 79.5780],
      polygon: [
        [30.5520, 79.5758],
        [30.5518, 79.5802],
        [30.5485, 79.5798],
        [30.5488, 79.5756]
      ],
      slope: "11.5°",
      subsidenceRate: "0.4 mm/week",
      population: 1120,
      vulnerableUnits: 224,
      dwellings: 224,
      crackedUnits: 12,
      geology: "High-grade Central Crystalline Gneiss",
      evacRoute: "Military Cantonment & Helipad"
    }
  ];

  // Merge live habitations prediction state
  const sectors = baseSectors.map(s => {
    const live = habitations.find(h => 
      h.id === s.numericId || 
      h.id === s.id || 
      (h.name && h.name.toLowerCase().includes(s.searchName))
    );

    let tier = "STABLE_GREEN";
    let calculatedRpi = 30;
    let overburden = 1.0;

    if (live) {
      const rpiVal = live.rpi_score !== undefined ? live.rpi_score : (live.rpi !== undefined ? live.rpi : 0.3);
      if (live.hazard_tier) {
        tier = live.hazard_tier;
      } else if (live.tier) {
        tier = live.tier;
      } else if (live.status === 'RED' || live.zone === 'RED' || rpiVal >= 0.70) {
        tier = "CRITICAL_RED";
      } else if (live.status === 'ORANGE' || live.status === 'AMBER' || live.zone === 'ORANGE' || live.zone === 'AMBER' || rpiVal >= 0.45) {
        tier = "WARNING_AMBER";
      } else {
        tier = "STABLE_GREEN";
      }

      calculatedRpi = live.calculatedRpi ?? Math.round(rpiVal * 100);
      overburden = live.overburden ?? live.overburden_ratio ?? 1.0;
    } else {
      if (s.numericId === 1 || s.numericId === 3) tier = "CRITICAL_RED";
      else if (s.numericId === 2 || s.numericId === 4) tier = "WARNING_AMBER";
      else tier = "STABLE_GREEN";
    }

    return {
      ...s,
      tier,
      calculatedRpi,
      overburden,
      liveData: live
    };
  });

  const getSectorStyle = (tier) => {
    switch (tier) {
      case "CRITICAL_RED":
        return {
          color: "#dc2626",
          fillColor: "#ef4444",
          fillOpacity: 0.38,
          weight: 2.5,
          dashArray: "6, 6"
        };
      case "WARNING_AMBER":
        return {
          color: "#d97706",
          fillColor: "#f59e0b",
          fillOpacity: 0.32,
          weight: 2,
          dashArray: "4, 4"
        };
      default:
        return {
          color: "#059669",
          fillColor: "#22c55e",
          fillOpacity: 0.25,
          weight: 1.5,
          dashArray: null
        };
    }
  };

  // Active Evacuation Corridors to display
  const activeCorridors = evacuationCorridors.length > 0 ? evacuationCorridors : sectors
    .filter(s => s.tier === 'CRITICAL_RED' || s.tier === 'WARNING_AMBER')
    .map(s => {
      // Find matching relief camp fallback
      let targetCamp = activeCamps[0];
      if (s.searchName.includes("sunil")) targetCamp = activeCamps.find(c => c.id === 'camp-2') || activeCamps[1];
      else if (s.searchName.includes("singhdhar")) targetCamp = activeCamps.find(c => c.id === 'camp-1') || activeCamps[0];
      else if (s.searchName.includes("manohar")) targetCamp = activeCamps.find(c => c.id === 'camp-4') || activeCamps[3];
      else if (s.searchName.includes("marwari")) targetCamp = activeCamps.find(c => c.id === 'camp-3') || activeCamps[2];

      const isRed = s.tier === 'CRITICAL_RED';
      const isUrgent = isRed && rainfall >= 30;

      return {
        sector_id: s.numericId,
        sector_name: s.name,
        from_coords: s.coords,
        to_camp_id: targetCamp.id,
        to_camp_name: targetCamp.name,
        to_coords: targetCamp.coords,
        corridor_name: targetCamp.safe_corridor,
        civilians_to_route: s.population,
        dwellings_affected: s.dwellings,
        priority: isUrgent ? "URGENT" : "STANDBY",
        hazard_tier: s.tier,
        tier: s.tier,
        color: isUrgent ? "#ef4444" : "#f59e0b"
      };
    });

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <style>{tacticalStyles}</style>
      
      {/* Floating Map Controls & Corridor Toggle Overlay */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }} className="flex items-center gap-2 pointer-events-auto">
        {/* Toggle Evacuation Corridors Button with Auto-Fit */}
        <button
          onClick={handleToggleCorridors}
          className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md border cursor-pointer ${
            showCorridors 
              ? 'bg-blue-900 text-white border-blue-700 shadow-blue-900/30' 
              : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          id="btn-toggle-corridors"
          title="Toggle Dynamic Evacuation Corridors & Auto-Fit Regional Hubs"
        >
          {showCorridors ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>Evac Corridors</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
            showCorridors ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'
          }`}>
            {activeCorridors.length}
          </span>
        </button>

        {/* Focus & Center on Corridors + Relief Camps */}
        <button
          onClick={() => setFocusCorridorsTrigger(prev => prev + 1)}
          className="bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          id="btn-focus-corridors"
          title="Zoom and Focus on all 4 Evacuation Corridors & Relief Hubs"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Focus Corridors</span>
        </button>
      </div>

      {/* Mini Radial / Off-Screen Corridor HUD Beacon for Pipalkoti */}
      {!isPipalkotiInView && showCamps && (
        <div
          onClick={() => setFocusCorridorsTrigger(prev => prev + 1)}
          className="absolute bottom-20 left-4 z-[1000] bg-slate-900/95 border border-sky-500/80 text-white px-3.5 py-2 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-all hover:scale-102 pointer-events-auto border-l-4 border-l-sky-400 group"
          id="hud-pipalkoti-beacon"
          title="Click to auto-fit and zoom to Pipalkoti Intermediate Hub (34 km Down-Valley along NH-07 Axis)"
        >
          <div className="w-7 h-7 rounded-full bg-sky-950 border border-sky-400 flex items-center justify-center text-sky-300 font-bold text-sm shadow-inner animate-pulse flex-shrink-0">
            ↙
          </div>
          <div>
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>NH-07 HIGHWAY CORRIDOR</span>
              <span className="text-[9px] bg-sky-950/80 text-sky-300 px-1.5 py-0.2 rounded border border-sky-700 font-mono">
                34 km Down-Valley
              </span>
            </div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span>Pipalkoti Intermediate Hub</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                (Cap: 1,200 | 790 Beds Free)
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-sky-600 group-hover:bg-sky-500 text-white font-bold px-2 py-1 rounded shadow-xs ml-1 whitespace-nowrap flex items-center gap-1">
            <span>Auto-Fit</span> &rarr;
          </span>
        </div>
      )}

      <MapContainer
        center={[30.552, 79.566]}
        zoom={14}
        maxZoom={18}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController 
          selectedWard={selectedWard} 
          focusCorridorsTrigger={focusCorridorsTrigger} 
          camps={activeCamps} 
          corridors={activeCorridors}
          onPipalkotiVisibilityChange={(inView) => setIsPipalkotiInView(inView)}
        />

        {/* 1. High-Res Satellite Imagery (Esri World Imagery) */}
        <TileLayer
          attribution='&copy; USGS, Esri, DigitalGlobe'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        {/* 2. Topographic Elevation Overlay */}
        <TileLayer
          opacity={0.35}
          attribution='&copy; OpenTopoMap'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        />

        {/* 3. Administrative Reference & Roads Overlay */}
        <TileLayer
          attribution='&copy; Esri Reference'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* ================= 4. SECTOR POLYGONS & THREAT ZONES ================= */}
        {sectors.map((sector) => {
          const style = getSectorStyle(sector.tier);
          const isCritical = sector.tier === "CRITICAL_RED";

          return (
            <React.Fragment key={sector.id}>
              <Polygon
                positions={sector.polygon}
                pathOptions={style}
                eventHandlers={{
                  click: () => onSelectWard(sector),
                  mouseover: (e) => {
                    e.target.setStyle({ fillOpacity: 0.55, weight: 3.5 });
                  },
                  mouseout: (e) => {
                    e.target.setStyle({ fillOpacity: style.fillOpacity, weight: style.weight });
                  }
                }}
              >
                <Tooltip sticky direction="top">
                  <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{sector.name}</span>
                </Tooltip>

                <Popup>
                  <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '6px' }}>
                      {sector.name}
                    </div>
                    <div>Hazard Tier: <b style={{ color: isCritical ? '#f87171' : sector.tier === 'WARNING_AMBER' ? '#fbbf24' : '#34d399' }}>{sector.tier}</b></div>
                    <div>Slope: <b>{sector.slope}</b></div>
                    <div>Subsidence Rate: <b style={{ color: '#f87171' }}>{sector.subsidenceRate}</b></div>
                    <div>Civilians: <b>{sector.population}</b> | Dwellings: <b>{sector.dwellings || sector.vulnerableUnits}</b> ({sector.crackedUnits || 0} Red-Tagged)</div>
                    <div style={{ marginTop: '4px', borderTop: '1px solid #1e293b', paddingTop: '4px', color: '#94a3b8' }}>
                      Designated Hub: <span style={{ color: '#6ee7b7' }}>{sector.evacRoute}</span>
                    </div>
                  </div>
                </Popup>
              </Polygon>

              {isCritical && (
                <>
                  <Circle
                    center={sector.coords}
                    radius={160}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.18,
                      weight: 1.5,
                      className: 'radar-ring'
                    }}
                  />
                  <Circle
                    center={sector.coords}
                    radius={30}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: '#dc2626',
                      fillOpacity: 0.95,
                      weight: 2
                    }}
                  />
                </>
              )}
            </React.Fragment>
          );
        })}

        {/* ================= 5. DYNAMIC EVACUATION ROUTE POLYLINES ================= */}
        {showCorridors && activeCorridors.map((corr, idx) => {
          const isUrgent = corr.priority === "URGENT";
          const positions = [corr.from_coords, corr.to_coords];

          return (
            <React.Fragment key={`corridor-${corr.sector_id || idx}-${corr.to_camp_id || idx}`}>
              {/* Animated / Dashed Evacuation Polyline */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: isUrgent ? "#ef4444" : "#f59e0b",
                  weight: isUrgent ? 3.5 : 2.5,
                  dashArray: isUrgent ? "6, 8" : "4, 6",
                  className: isUrgent ? "corridor-polyline-urgent" : "corridor-polyline-standby",
                  opacity: 0.92
                }}
              >
                <Tooltip sticky direction="top">
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    <span style={{ color: isUrgent ? '#ef4444' : '#f59e0b' }}>
                      {isUrgent ? '⚡ URGENT CORRIDOR: ' : '🛡️ STANDBY AXIS: '}
                    </span>
                    {corr.sector_name} &rarr; {corr.to_camp_name} ({corr.corridor_name})
                  </div>
                </Tooltip>

                <Popup>
                  <div style={{ fontSize: '11px', lineHeight: '1.6', minWidth: '220px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: isUrgent ? '#f87171' : '#fbbf24', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '6px' }}>
                      {isUrgent ? 'URGENT EVACUATION CORRIDOR' : 'STANDBY EVACUATION AXIS'}
                    </div>
                    <div>From Sector: <b>{corr.sector_name}</b></div>
                    <div>To Camp: <b>{corr.to_camp_name}</b></div>
                    <div>Designated Corridor: <b style={{ color: '#38bdf8' }}>{corr.corridor_name}</b></div>
                    <div>Civilians Routed: <b style={{ color: '#fff' }}>{corr.civilians_to_route} Citizens</b></div>
                    {corr.dwellings_affected && <div>Vulnerable Units: <b>{corr.dwellings_affected} Dwellings</b></div>}
                    <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #334155', fontSize: '10px', color: '#94a3b8' }}>
                      Status: <span style={{ color: isUrgent ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>{isUrgent ? 'ACTIVE DIRECTIVE - ESCORT EN ROUTE' : 'PRE-POSITIONED STANDBY'}</span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* ================= 6. RELIEF CAMP TACTICAL MARKERS ================= */}
        {showCamps && activeCamps.map((camp) => {
          const occ = camp.live_occupancy ?? camp.occupancy ?? 100;
          const cap = camp.capacity ?? 500;
          const availableBeds = camp.live_available_beds ?? camp.available_beds ?? Math.max(0, cap - occ);
          const occPct = Math.round((occ / cap) * 100);
          const coords = camp.coords || [camp.lat, camp.lon];

          return (
            <Marker
              key={camp.id}
              position={coords}
              icon={createCampDivIcon(camp)}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  ⛺ {camp.name} | Cap: {cap} | Free: {availableBeds}
                </div>
              </Tooltip>

              <Popup>
                <div style={{ fontSize: '11px', lineHeight: '1.6', minWidth: '240px' }}>
                  {/* Camp Title */}
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⛺</span>
                    <span>{camp.name}</span>
                  </div>

                  {/* Authority */}
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '6px' }}>
                    Command Authority: <b style={{ color: '#f1f5f9' }}>{camp.authority || "Chamoli District Emergency Authority"}</b>
                  </div>

                  {/* Bed Capacity Progress Bar */}
                  <div style={{ marginBottom: '8px', background: '#1e293b', padding: '6px', borderRadius: '4px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                      <span>Bed Capacity &amp; Occupancy:</span>
                      <b style={{ color: occPct > 80 ? '#f87171' : '#38bdf8' }}>{occ} / {cap} ({occPct}%)</b>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, occPct)}%`, 
                          height: '100%', 
                          background: occPct > 80 ? '#ef4444' : '#0284c7',
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>
                      <span>Available: <b style={{ color: '#34d399' }}>{availableBeds} Beds</b></span>
                      <span>Safe Corridor: <b style={{ color: '#fbbf24' }}>{camp.safe_corridor || "NH-07"}</b></span>
                    </div>
                  </div>

                  {/* Rations & Medical Facility */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', borderTop: '1px solid #334155', paddingTop: '6px' }}>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block' }}>DRY RATIONS:</span>
                      <b style={{ color: '#34d399' }}>{camp.rations_days || 14} Days Stock</b>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block' }}>MEDICAL UNIT:</span>
                      <b style={{ color: '#f1f5f9' }}>{camp.medical_unit ? camp.medical_unit.split(' ')[0] : 'Tactical Team'}</b>
                    </div>
                  </div>

                  <div style={{ marginTop: '6px', fontSize: '9px', color: '#64748b' }}>
                    Medical Unit Detail: {camp.medical_unit || "Tactical Trauma Response Unit"}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

