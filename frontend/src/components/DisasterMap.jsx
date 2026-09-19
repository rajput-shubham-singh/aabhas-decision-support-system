import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Tooltip, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HAZARD_SECTORS, RELIEF_CAMPS, getDynamicHazardSectors } from '../data/hazardSectors.js';
import { allocateSectorsToCamps } from '../utils/evacuationEngine.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_MAP_BOUNDS = [
  [30.2600, 79.1400],
  [30.5800, 79.6000]
];

function MapPanController({ targetCoords, zoom, isOverview }) {
  const map = useMap();
  useEffect(() => {
    if (isOverview) {
      map.fitBounds(DEFAULT_MAP_BOUNDS, { padding: [40, 40], duration: 1.2 });
    } else if (targetCoords && Array.isArray(targetCoords) && targetCoords.length === 2) {
      const targetZoom = Math.min(zoom || 16, 17);
      map.flyTo(targetCoords, targetZoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [targetCoords, zoom, isOverview, map]);
  return null;
}

function MapResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const createCampPin = (name, beds) => {
  const bedStr = typeof beds === 'number' ? `${beds.toLocaleString()} Beds` : (beds ? `${beds} Beds` : 'Beds');
  return L.divIcon({
    className: 'official-camp-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          width: 32px; 
          height: 32px; 
          background: #1e3a8a; 
          border: 2px solid #ffffff; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg style="transform: rotate(45deg); width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 21 9-18 9 18H3z"/>
            <path d="M12 3v18"/>
            <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
          </svg>
        </div>

        <div style="
          margin-top: 5px;
          background: rgba(15, 23, 42, 0.85); 
          color: #ffffff; 
          padding: 2px 7px; 
          border-radius: 4px; 
          font-size: 10px; 
          font-weight: 600; 
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          letter-spacing: 0.2px;
          font-family: sans-serif;
        ">
          ${name} <span style="color: #93c5fd; font-weight: 500;">(${bedStr})</span>
        </div>
      </div>
    `,
    iconSize: [32, 54],
    iconAnchor: [16, 32]
  });
};

const shelterIcon = createCampPin;

export default function DisasterMap({
  dynamicSectors,
  sectors,
  habitations,
  selectedSector,
  selectedWard,
  onSelectSector,
  onSelectWard,
  panTarget,
  rainfall = 30,
  camps,
  isRoadBlocked = false
}) {
  const mapRef = useRef(null);
  const activeSector = selectedSector || selectedWard;
  const handleSelect = onSelectSector || onSelectWard;

  const displaySectors = useMemo(() => {
    const rf = Number(rainfall) || 0;
    const baseList = (dynamicSectors && Array.isArray(dynamicSectors) && dynamicSectors.length > 0)
      ? dynamicSectors
      : (habitations && Array.isArray(habitations) && habitations.length > 0
        ? habitations.map(h => {
            const staticMatch = HAZARD_SECTORS.find(s => s.id === h.id || s.ward_no === h.ward_no) || {};
            return {
              ...staticMatch,
              ...h,
              baseFos: h.baseFos || staticMatch.baseFos || 1.20,
              baseRpi: h.baseRpi || staticMatch.baseRpi || 50,
              rainSensitivity: h.rainSensitivity || staticMatch.rainSensitivity || 0.40,
              center: h.center || staticMatch.center || (h.lat && h.lon ? [h.lat, h.lon] : [30.55, 79.55]),
              coordinates: h.coordinates || staticMatch.coordinates || staticMatch.polygon,
              polygon: h.polygon || staticMatch.polygon || staticMatch.coordinates
            };
          })
        : (sectors && Array.isArray(sectors) && sectors.length > 0 ? sectors : HAZARD_SECTORS));

    if (!baseList || !Array.isArray(baseList) || baseList.length === 0) {
      return [];
    }

    const sectorsWithDynamicHazard = baseList.map((sec) => {
      const sensitivity = sec.rainSensitivity || 0.40;
      const baseFos = sec.baseFos !== undefined ? sec.baseFos : 1.20;
      const baseRpi = sec.baseRpi !== undefined ? sec.baseRpi : 50;
      const dynamicFos = Math.max(0.35, Number((baseFos - (rf / 150.0) * sensitivity).toFixed(2)));
      const dynamicRpi = Math.min(100, Math.max(10, Math.round(baseRpi + (rf / 150.0) * (sensitivity * 55))));

      let zone = "GREEN";
      let status = "GREEN";
      let strokeColor = "#10b981";
      let fillColor = "#059669";
      let fillOpacity = 0.28;

      if (dynamicFos < 1.0) {
        zone = "RED";
        status = "RED";
        strokeColor = "#ef4444";
        fillColor = "#dc2626";
        fillOpacity = 0.54;
      } else if (dynamicFos < 1.25) {
        zone = "ORANGE";
        status = "ORANGE";
        strokeColor = "#f97316";
        fillColor = "#ea580c";
        fillOpacity = 0.44;
      } else if (dynamicFos < 1.45) {
        zone = "YELLOW";
        status = "YELLOW";
        strokeColor = "#eab308";
        fillColor = "#ca8a04";
        fillOpacity = 0.36;
      }

      return {
        ...sec,
        fos: dynamicFos,
        currentFos: dynamicFos,
        rpi: dynamicRpi,
        calculatedRpi: dynamicRpi,
        rpiScore: dynamicRpi / 100,
        zone,
        status,
        color: strokeColor,
        strokeColor,
        fillColor,
        fillOpacity
      };
    });

    const activeCamps = (camps && Array.isArray(camps) && camps.length > 0) ? camps : RELIEF_CAMPS;
    return allocateSectorsToCamps(sectorsWithDynamicHazard, activeCamps, isRoadBlocked);
  }, [dynamicSectors, habitations, sectors, rainfall, camps, isRoadBlocked]);

  const handleCenterView = () => {
    if (mapRef.current) {
      try {
        mapRef.current.fitBounds(DEFAULT_MAP_BOUNDS, { padding: [40, 40], duration: 1.2 });
      } catch (e) {}
    }
    if (handleSelect) {
      handleSelect(null);
    }
  };

  if (!displaySectors || displaySectors.length === 0) {
    return (
      <div className="w-full h-[540px] min-h-[520px] bg-slate-900 flex items-center justify-center text-slate-400 font-mono text-sm rounded-xl border border-slate-700 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Loading Geotechnical Map Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] min-h-[520px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
      <MapContainer
        bounds={DEFAULT_MAP_BOUNDS}
        zoom={11}
        maxZoom={18}
        minZoom={10}
        scrollWheelZoom={true}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        ref={mapRef}
        style={{ height: '100%', width: '100%', minHeight: '520px', background: '#020617' }}
      >
        <TileLayer
          attribution="&copy; Esri World Imagery"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          maxNativeZoom={17}
          minZoom={10}
        />

        <TileLayer
          maxZoom={19}
          maxNativeZoom={17}
          minZoom={10}
          opacity={0.8}
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        <MapPanController
          targetCoords={panTarget?.coords || (activeSector ? (activeSector.center || activeSector.coords || [activeSector.lat, activeSector.lon]) : null)}
          zoom={panTarget?.zoom ? Math.min(panTarget.zoom, 17) : (activeSector ? 16 : null)}
          isOverview={!activeSector && !panTarget?.coords}
        />
        <MapResizeWatcher />

        {displaySectors
          .filter((sector) => (sector.zone === 'RED' || sector.zone === 'ORANGE'))
          .map((sector) => {
            const campLoc = sector.assignedCamp?.location || sector.assignedCamp?.coords || RELIEF_CAMPS[0].location;
            const sectorCenter = sector.center || sector.coords || [sector.lat, sector.lon];
            if (!sectorCenter || !campLoc) return null;

            return (
              <Polyline
                key={`transit-${sector.id}`}
                positions={[sectorCenter, campLoc]}
                pathOptions={{
                  color: sector.zone === 'RED' ? '#ea580c' : '#64748b',
                  weight: 2.2,
                  opacity: 0.85,
                  dashArray: '6, 6'
                }}
              >
                <Tooltip direction="top" opacity={0.9}>
                  <span className="font-sans text-[11px] font-semibold text-slate-800">Route: {sector.shortName || sector.name} ➔ {sector.assignedCamp?.name}</span>
                </Tooltip>
              </Polyline>
            );
          })}

        {displaySectors.map((sector) => {
          const polyPositions = sector.coordinates || sector.polygon;
          if (!polyPositions || !Array.isArray(polyPositions) || polyPositions.length < 3) {
            return null;
          }
          const isSelected = activeSector?.id === sector.id || activeSector?.ward_no === sector.ward_no;
          const strokeColor = isSelected ? '#38bdf8' : (sector.color || '#ef4444');
          const weight = isSelected ? 4.0 : (sector.zone === 'RED' ? 3.2 : 2.0);
          const sectorCenter = sector.center || (Array.isArray(polyPositions[0]) ? polyPositions[0] : [30.55, 79.55]);

          return (
            <Polygon
              key={sector.id || `sec-${Math.random()}`}
              positions={polyPositions}
              pathOptions={{
                color: strokeColor,
                fillColor: sector.fillColor || '#ef4444',
                fillOpacity: isSelected ? 0.72 : (sector.fillOpacity || 0.4),
                weight: weight,
                dashArray: sector.zone === 'RED' && !isSelected ? '5, 5' : undefined,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              eventHandlers={{
                click: (e) => {
                  if (handleSelect) handleSelect(sector, sectorCenter, 16);
                  e.target.openPopup();
                },
                mouseover: (e) => e.target.setStyle({ fillOpacity: 0.78, weight: 4.5 }),
                mouseout: (e) => e.target.setStyle({
                  fillOpacity: isSelected ? 0.72 : (sector.fillOpacity || 0.4),
                  weight: weight
                })
              }}
            >
              <Tooltip direction="top" opacity={0.85}>
                <span className="font-bold text-xs">{sector.shortName || sector.name}</span>
              </Tooltip>

              <Popup autoPan={true} className="geotech-clean-popup" maxWidth={300} autoClose={true} closeOnClick={true}>
                <div className="bg-white text-slate-900 p-3 rounded shadow-lg border border-slate-300 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                    <span className="font-bold text-slate-900 text-sm leading-none">{sector.shortName || sector.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sector.zone === 'RED' 
                        ? 'bg-red-100 text-red-800 border border-red-300' 
                        : sector.zone === 'ORANGE'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : sector.zone === 'YELLOW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {sector.zone} STATUS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Factor of Safety</div>
                      <div className="font-bold text-slate-800">{sector.currentFos || sector.fos || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Slope Angle</div>
                      <div className="font-bold text-slate-800">{sector.slope || (sector.slope_deg ? `${sector.slope_deg}°` : "38.5°")}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Red-Tagged Units</div>
                      <div className="font-bold text-red-700">{sector.redTagged || sector.cracked_units || 0} / {sector.dwellings || sector.houses || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">InSAR Creep</div>
                      <div className="font-bold text-slate-800">{sector.insarVelocity || "-14 mm/yr"}</div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-700">
                    <span className="text-slate-500 block text-[10px]">Designated Receiving Shelter:</span>
                    <span className="font-semibold text-slate-900">{sector.assignedCamp?.name || sector.reliefHub || "ITBP / Cantonment Spur Base"}</span>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {RELIEF_CAMPS.map((camp) => (
          <Marker
            key={camp.id}
            position={camp.location || camp.coords}
            icon={shelterIcon(camp.shortName || camp.name, camp.bedsAvailable || camp.capacity)}
          >
            <Popup className="gov-shelter-popup" maxWidth={320} autoClose={true} closeOnClick={true}>
              <div className="p-3 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 font-sans min-w-[260px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ● {camp.status || "OPERATIONAL BASE"}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1 leading-tight">{camp.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium block">Total Bed Capacity</span>
                    <span className="text-sm font-bold text-slate-800">{(typeof camp.capacity === 'number' ? camp.capacity : (camp.total_bed_capacity || 0)).toLocaleString()} Beds</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">({camp.bedsAvailable ? `${camp.bedsAvailable.toLocaleString()} Vacant` : "Available"})</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium block">Sphere Water Buffer</span>
                    <span className="text-sm font-bold text-blue-700">{camp.waterSupply || camp.waterReserve || "75L / person / day"}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">WHO/Sphere Standard</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Medical Unit:</span>
                    <span className="font-semibold text-slate-800">{camp.medicalStaff || "NDRF Medical Detachment"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corridor Route:</span>
                    <span className="font-semibold text-slate-800">{camp.safe_corridor || camp.corridor || "NH-07 Arterial / Ridge Track"}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export { DisasterMap, HAZARD_SECTORS, RELIEF_CAMPS, allocateSectorsToCamps };
