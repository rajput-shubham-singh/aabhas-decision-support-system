import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const INJECT_TACTICAL_STYLES = `
  @keyframes dashFlow {
    to {
      stroke-dashoffset: -40;
    }
  }
  .tactical-evac-line {
    animation: dashFlow 1.2s linear infinite;
  }
  .leaflet-container {
    background: #020617 !important;
  }
`;

export const CHAMOLI_DISTRICT_SECTORS = [
  {
    id: "sec-joshimath",
    name: "Joshimath Urban Bowl (Singhdhar-Sunil Axis)",
    tehsil: "Joshimath Tehsil",
    ward_no: "Joshimath Sector",
    hazard_type: "Deep Subsurface Subsidence & Shear",
    dwellings: "1,052 Structures (436 Tagged)",
    slope: "39.5°",
    baseRpi: 64,
    targetCampId: "camp-cantt",
    center: [30.5562, 79.5645],
    coords: [30.5562, 79.5645],
    polygon: [
      [30.5615, 79.5550],
      [30.5605, 79.5640],
      [30.5560, 79.5680],
      [30.5525, 79.5650],
      [30.5520, 79.5605],
      [30.5550, 79.5555]
    ]
  },
  {
    id: "sec-helang",
    name: "Helang Valley Chute (Alaknanda Gorge)",
    tehsil: "Joshimath Tehsil",
    ward_no: "Helang Sector",
    hazard_type: "Active Scree & Debris Flow",
    dwellings: "210 Dwellings (65 Tagged)",
    slope: "42.0°",
    baseRpi: 68,
    targetCampId: "camp-pipalkoti",
    center: [30.5280, 79.5105],
    coords: [30.5280, 79.5105],
    polygon: [
      [30.5330, 79.5070],
      [30.5315, 79.5145],
      [30.5265, 79.5135],
      [30.5245, 79.5085],
      [30.5280, 79.5050]
    ]
  },
  {
    id: "sec-karnaprayag",
    name: "Karnaprayag Confluence (Bahuguna Nagar Scarp)",
    tehsil: "Karnaprayag Tehsil",
    ward_no: "Karnaprayag Sector",
    hazard_type: "Toe Erosion & Structural Sinking",
    dwellings: "540 Dwellings (152 Tagged)",
    slope: "33.5°",
    baseRpi: 44,
    targetCampId: "camp-gauchar",
    center: [30.2610, 79.2215],
    coords: [30.2610, 79.2215],
    polygon: [
      [30.2660, 79.2170],
      [30.2645, 79.2255],
      [30.2590, 79.2260],
      [30.2565, 79.2205],
      [30.2605, 79.2160]
    ]
  },
  {
    id: "sec-tharali",
    name: "Tharali Pindar Valley Basin",
    tehsil: "Tharali Tehsil",
    ward_no: "Tharali Sector",
    hazard_type: "Riverbank Toe Shear & Cloudburst Runoff",
    dwellings: "620 Dwellings (110 Tagged)",
    slope: "28.0°",
    baseRpi: 38,
    targetCampId: "camp-gopeshwar",
    center: [30.0630, 79.4950],
    coords: [30.0630, 79.4950],
    polygon: [
      [30.0680, 79.4900],
      [30.0670, 79.5010],
      [30.0610, 79.5020],
      [30.0585, 79.4940],
      [30.0615, 79.4890]
    ]
  },
  {
    id: "sec-ravigram",
    name: "Ravigram Geodetic Shelf (Control Baseline)",
    tehsil: "Joshimath Tehsil",
    ward_no: "Ravigram Sector",
    hazard_type: "Stable Bedrock Spur (Minimal Drift)",
    dwellings: "224 Dwellings (Intact)",
    slope: "11.5°",
    baseRpi: 16,
    targetCampId: null,
    center: [30.5498, 79.5780],
    coords: [30.5498, 79.5780],
    polygon: [
      [30.5525, 79.5750],
      [30.5515, 79.5820],
      [30.5475, 79.5810],
      [30.5470, 79.5760],
      [30.5495, 79.5740]
    ]
  }
];

export const CHAMOLI_SECTORS = CHAMOLI_DISTRICT_SECTORS;

export const CHAMOLI_RELIEF_HUBS = [
  {
    id: "camp-gopeshwar",
    name: "Gopeshwar District Sports Stadium",
    role: "Primary Macro-Relief Hub",
    location: "Gopeshwar Terrace (Chamoli District HQ)",
    capacity: "3,200 Persons",
    totalBeds: 3200,
    water: "2,40,000 L/day",
    rations: "12,000 MRE Packets",
    coords: [30.4135, 79.3245]
  },
  {
    id: "camp-gauchar",
    name: "Gauchar Civil Airstrip Transit Center",
    role: "Strategic Air-Evacuation Node",
    location: "Gauchar River Terrace",
    capacity: "4,500 Persons",
    totalBeds: 4500,
    water: "3,37,500 L/day",
    rations: "15,000 MRE Packets",
    coords: [30.2850, 79.1550]
  },
  {
    id: "camp-pipalkoti",
    name: "Pipalkoti Intermediate Relief Center",
    role: "TRC & Mandir Samiti Complex",
    location: "Pipalkoti Mid-Valley Shelf (NH-07 Axis)",
    capacity: "1,450 Persons",
    totalBeds: 1450,
    water: "1,08,750 L/day",
    rations: "4,500 MRE Packets",
    coords: [30.4289, 79.4325]
  },
  {
    id: "camp-cantt",
    name: "Military Cantonment & ITBP High-Ground Spur",
    role: "Joshimath Immediate Refuge",
    location: "Upper Military Spur, Joshimath",
    capacity: "850 Persons",
    totalBeds: 850,
    water: "63,750 L/day",
    rations: "3,000 Field Rations",
    coords: [30.5465, 79.5690]
  }
];

function FluidDistrictCamera({ targetSector }) {
  const map = useMap();
  const lockRef = useRef(false);

  useEffect(() => {
    if (!targetSector || lockRef.current) return;

    let poly = targetSector.polygon;
    if (!poly) {
      const match = CHAMOLI_DISTRICT_SECTORS.find(s => 
        s.id === targetSector.id || 
        s.ward_no === targetSector.ward_no ||
        (s.name && targetSector.name && s.name.toLowerCase().includes(targetSector.name.toLowerCase().slice(0, 6)))
      );
      if (match?.polygon) poly = match.polygon;
    }

    lockRef.current = true;
    try {
      if (poly && poly.length > 0) {
        const bounds = L.polygon(poly).getBounds();
        map.flyToBounds(bounds, {
          padding: [80, 80],
          maxZoom: 15,
          duration: 1.5,
          easeLinearity: 0.28
        });
      } else if (targetSector.coords || (targetSector.lat && (targetSector.lon || targetSector.lng))) {
        const center = targetSector.coords || [targetSector.lat, targetSector.lon || targetSector.lng];
        map.flyTo(center, 15, {
          duration: 1.5,
          easeLinearity: 0.28
        });
      }
    } catch (e) {
      console.warn("Camera transition notice:", e);
    }

    const timer = setTimeout(() => {
      lockRef.current = false;
    }, 1600);

    return () => clearTimeout(timer);
  }, [targetSector, map]);

  return null;
}

export default function TacticalMap({
  rainfall = 30,
  selectedSector,
  selectedWard,
  onSelectSector,
  onSelectWard,
  showEvacCorridors = true,
  evacuationCorridors = [],
  sectors = [],
  habitations = [],
  camps = [],
  roadBlockages = [],
  isRoadBlocked = false
}) {
  const activeSector = selectedSector || selectedWard;
  const handleSelect = onSelectSector || onSelectWard;

  useEffect(() => {
    const styleId = 'tactical-map-custom-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = INJECT_TACTICAL_STYLES;
      document.head.appendChild(styleEl);
    }
  }, []);

  const liveSectors = useMemo(() => {
    const incoming = (sectors && sectors.length > 0) ? sectors : (habitations && habitations.length > 0) ? habitations : [];
    return CHAMOLI_DISTRICT_SECTORS.map((sec) => {
      const match = incoming.find(h => 
        h.id === sec.id || 
        h.ward_no === sec.ward_no || 
        (h.name && h.name.toLowerCase().includes(sec.name.toLowerCase().slice(0, 6)))
      );

      const dynamicRpi = match?.calculatedRpi ?? Math.min(100, Math.round(sec.baseRpi + Number(rainfall) * 0.25));
      let status = "GREEN";
      let strokeColor = "#10b981";
      let fillColor = "#059669";
      let fillOpacity = 0.25;

      if (dynamicRpi >= 75) {
        status = "RED";
        strokeColor = "#ef4444";
        fillColor = "#dc2626";
        fillOpacity = 0.50;
      } else if (dynamicRpi >= 45) {
        status = "ORANGE";
        strokeColor = "#f59e0b";
        fillColor = "#d97706";
        fillOpacity = 0.35;
      }

      return {
        ...sec,
        dwellings: match?.dwellings ?? sec.dwellings,
        rpi: dynamicRpi,
        calculatedRpi: dynamicRpi,
        status,
        strokeColor,
        fillColor,
        fillOpacity
      };
    });
  }, [rainfall, sectors, habitations]);

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.9)]">

      <div className="absolute top-4 left-14 z-[400] bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 pointer-events-none shadow-2xl">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
        <div>
          <div className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            CHAMOLI DISTRICT SITUATION ROOM • 4K SATELLITE
          </div>
          <div className="text-[10px] font-mono text-cyan-400">
            METEOROLOGY: {rainfall} mm/24h | MONITORING 5 MACRO-SECTORS | 4 VERIFIED RELIEF HUBS
          </div>
        </div>
      </div>

      <MapContainer
        center={[30.3800, 79.3800]}
        zoom={10}
        maxZoom={19}
        minZoom={8}
        scrollWheelZoom={true}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ height: '100%', width: '100%', background: '#020617' }}
      >

        <TileLayer
          attribution="&copy; Esri &mdash; Earthstar Geographics"
          maxZoom={19}
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <TileLayer
          maxZoom={19}
          opacity={0.8}
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        <FluidDistrictCamera targetSector={activeSector} />

        {liveSectors.map((sec) => {
          const isSelected = activeSector?.id === sec.id;
          const stroke = isSelected ? "#38bdf8" : sec.strokeColor;
          const weight = isSelected ? 3.8 : sec.status === "RED" ? 2.8 : 2.0;

          return (
            <React.Fragment key={`${sec.id}-${sec.status}`}>
              <Polygon
                positions={sec.polygon}
                pathOptions={{
                  color: stroke,
                  fillColor: sec.fillColor,
                  fillOpacity: isSelected ? 0.65 : sec.fillOpacity,
                  weight: weight,
                  dashArray: sec.status === "RED" && !isSelected ? "6, 8" : undefined,
                  lineCap: "round",
                  lineJoin: "round"
                }}
                eventHandlers={{
                  click: () => handleSelect && handleSelect(sec),
                  mouseover: (e) => e.target.setStyle({ fillOpacity: 0.75, weight: 4 }),
                  mouseout: (e) => e.target.setStyle({ 
                    fillOpacity: isSelected ? 0.65 : sec.fillOpacity, 
                    weight: weight 
                  })
                }}
              >
                <Tooltip className="!bg-slate-950/95 !text-white !border !border-slate-700 !font-mono !text-xs !rounded-xl !p-3 !shadow-2xl backdrop-blur-md" direction="top" sticky>
                  <div className="font-bold text-sm text-cyan-300 mb-1">{sec.name}</div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <div><strong>Tehsil:</strong> {sec.tehsil}</div>
                    <div><strong>Hazard:</strong> {sec.hazard_type}</div>
                    <div>
                      <strong>RPI:</strong>{" "}
                      <span className={sec.status === 'RED' ? 'text-rose-400 font-bold' : sec.status === 'ORANGE' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {sec.rpi}/100 [{sec.status}]
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{sec.dwellings} • Slope: {sec.slope}</div>
                  </div>
                </Tooltip>
              </Polygon>

              <CircleMarker
                center={sec.center}
                radius={isSelected ? 6 : 4}
                pathOptions={{
                  color: stroke,
                  fillColor: "#ffffff",
                  fillOpacity: 1,
                  weight: isSelected ? 2.5 : 1.5
                }}
              />
            </React.Fragment>
          );
        })}

        {CHAMOLI_RELIEF_HUBS.map((camp) => (
          <CircleMarker
            key={camp.id}
            center={camp.coords}
            radius={9}
            pathOptions={{
              color: "#10b981",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 2.5
            }}
          >
            <Tooltip className="!bg-emerald-950/95 !text-emerald-100 !border !border-emerald-500 !font-mono !text-xs !rounded-lg !px-2.5 !py-1.5 !shadow-xl" direction="bottom" permanent>
              <div className="font-bold">⛨ {camp.name}</div>
              <div className="text-[10px] text-emerald-300">Cap: {camp.capacity} | {camp.water}</div>
            </Tooltip>
          </CircleMarker>
        ))}

        {showEvacCorridors && liveSectors
          .filter((s) => s.status === "RED" && s.targetCampId)
          .map((sec) => {
            const camp = CHAMOLI_RELIEF_HUBS.find((c) => c.id === sec.targetCampId);
            if (!camp) return null;

            return (
              <Polyline
                key={`corridor-${sec.id}-${camp.id}`}
                positions={[sec.center, camp.coords]}
                pathOptions={{
                  color: "#38bdf8",
                  weight: 3.5,
                  opacity: 0.95,
                  dashArray: "10, 15",
                  lineCap: "round",
                  className: "tactical-evac-line"
                }}
              >
                <Tooltip className="!bg-slate-900 !text-sky-300 !font-mono !text-[11px] !border !border-sky-500" sticky>
                  Active Evacuation Corridor: {sec.name} ➔ {camp.name}
                </Tooltip>
              </Polyline>
            );
          })}
      </MapContainer>
    </div>
  );
}
