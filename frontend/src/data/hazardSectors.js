export const RELIEF_CAMPS = [
  {
    id: "camp-gopeshwar",
    name: "Gopeshwar District Sports Stadium",
    shortName: "Gopeshwar Stadium Hub",
    alt_name: "Gopeshwar Primary Safe Relocation Hub",
    role: "Primary Safe Civilian Relocation Hub",
    location: [30.4200, 79.3300],
    coords: [30.4200, 79.3300],
    lat: 30.4200,
    lon: 79.3300,
    capacity: 4500,
    bedsAvailable: 3850,
    total_bed_capacity: 4500,
    totalBeds: 4500,
    waterSupply: "337,500 L/day (Sphere Standard)",
    waterReserve: "337,500 L/day",
    waterReserveLPD: 337500,
    medicalStaff: "24 Doctors / 60 Paramedics",
    foodPackets: 18000,
    safe_corridor: "Gopeshwar-Mandal Axis (NH-107A)",
    authority: "Chamoli DDMA / District Magistrate",
    status: "OPERATIONAL"
  },
  {
    id: "camp-pipalkoti",
    name: "Pipalkoti Valley Transit Shelter (NH-07)",
    shortName: "Pipalkoti Transit Hub",
    alt_name: "Pipalkoti Intermediate Relief Center",
    role: "Immediate Downstream Evac Hub",
    location: [30.4335, 79.4284],
    coords: [30.4335, 79.4284],
    lat: 30.4335,
    lon: 79.4284,
    capacity: 2500,
    bedsAvailable: 1980,
    total_bed_capacity: 2500,
    totalBeds: 2500,
    waterSupply: "187,500 L/day",
    waterReserve: "187,500 L/day",
    waterReserveLPD: 187500,
    medicalStaff: "12 Doctors / 30 Paramedics",
    foodPackets: 12000,
    safe_corridor: "NH-07 Lower Valley Axis",
    authority: "SDM Pipalkoti / NDRF Staging Post",
    status: "ACTIVE_INTERMEDIATE"
  },
  {
    id: "camp-gauchar",
    name: "Gauchar Airstrip Macro Evac Center",
    shortName: "Gauchar Airhead Hub",
    alt_name: "Gauchar Airfield Disaster Terminal",
    role: "Strategic Airhead / Critical Fallback",
    location: [30.2846, 79.1616],
    coords: [30.2846, 79.1616],
    lat: 30.2846,
    lon: 79.1616,
    capacity: 5000,
    bedsAvailable: 4400,
    total_bed_capacity: 5000,
    totalBeds: 5000,
    waterSupply: "375,000 L/day",
    waterReserve: "375,000 L/day",
    waterReserveLPD: 375000,
    medicalStaff: "Air Ambulance Unit / NDRF Base",
    foodPackets: 22000,
    safe_corridor: "Gauchar Air Corridor & NH-58",
    authority: "Indian Air Force / NDRF 8th Bn",
    status: "STRATEGIC_RESERVE"
  },
  {
    id: "camp-itbp-cantt",
    name: "ITBP / Army Cantonment High Spur",
    shortName: "Joshimath High Spur",
    alt_name: "Joshimath Military Cantonment Staging Post",
    role: "Immediate Emergency Triage & Airfield Access",
    location: [30.5505, 79.5760],
    coords: [30.5505, 79.5760],
    lat: 30.5505,
    lon: 79.5760,
    capacity: 1200,
    bedsAvailable: 850,
    total_bed_capacity: 1200,
    totalBeds: 1200,
    waterSupply: "90,000 L/day",
    waterReserve: "90,000 L/day",
    waterReserveLPD: 90000,
    medicalStaff: "Military Field Dressing Station",
    foodPackets: 8000,
    safe_corridor: "Auli High Spur Corridor",
    authority: "ITBP 1st Bn / Indian Army",
    status: "IMMEDIATE_TRIAGE"
  }
];

export const HAZARD_SECTORS = [
  {
    id: "sec-singhdhar",
    name: "Singhdhar Scarp (Ward 4)",
    shortName: "Singhdhar Scarp",
    ward_no: "Ward-04",
    zone: "RED",
    status: "RED",
    tier: "CRITICAL_RED",
    hazard_tier: "CRITICAL_RED",
    rpi: 83,
    baseRpi: 83,
    calculatedRpi: 83,
    fos: 0.82,
    baseFos: 0.82,
    currentFos: 0.82,
    rainSensitivity: 0.40,
    slope: "41.0°",
    slope_deg: 41.0,
    population: 2450,
    civilians: 2450,
    dwellings: 162,
    houses: 162,
    redTagged: 98,
    cracked_units: 98,
    insarVelocity: "-18.4 mm/yr",
    reliefHub: "Joshimath High Spur (ITBP Spur) | 1.2 km Immediate Access",
    targetCampId: "camp-itbp-cantt",
    assignedCamp: RELIEF_CAMPS[3],
    allocated_camp: "ITBP / Army Cantonment High Spur",
    color: "#ef4444",
    strokeColor: "#ef4444",
    fillColor: "#dc2626",
    fillOpacity: 0.52,
    center: [30.5570, 79.5560],
    coords: [30.5570, 79.5560],
    lat: 30.5570,
    lon: 79.5560,
    coordinates: [
      [30.5565, 79.5540],
      [30.5585, 79.5555],
      [30.5575, 79.5580],
      [30.5555, 79.5565]
    ],
    polygon: [
      [30.5565, 79.5540],
      [30.5585, 79.5555],
      [30.5575, 79.5580],
      [30.5555, 79.5565]
    ]
  },
  {
    id: "sec-sunil",
    name: "Upper Sunil Colluvial Zone (Ward 3)",
    shortName: "Sunil Ward",
    ward_no: "Ward-03",
    zone: "RED",
    status: "RED",
    tier: "CRITICAL_RED",
    hazard_tier: "CRITICAL_RED",
    rpi: 76,
    baseRpi: 76,
    calculatedRpi: 76,
    fos: 0.90,
    baseFos: 0.90,
    currentFos: 0.90,
    rainSensitivity: 0.40,
    slope: "38.5°",
    slope_deg: 38.5,
    population: 2180,
    civilians: 2180,
    dwellings: 178,
    houses: 178,
    redTagged: 84,
    cracked_units: 84,
    insarVelocity: "-15.2 mm/yr",
    reliefHub: "Joshimath High Spur (ITBP Spur) | 1.2 km Immediate Access",
    targetCampId: "camp-itbp-cantt",
    assignedCamp: RELIEF_CAMPS[3],
    allocated_camp: "ITBP / Army Cantonment High Spur",
    color: "#ef4444",
    strokeColor: "#ef4444",
    fillColor: "#dc2626",
    fillOpacity: 0.52,
    center: [30.5508, 79.5585],
    coords: [30.5508, 79.5585],
    lat: 30.5508,
    lon: 79.5585,
    coordinates: [
      [30.5500, 79.5570],
      [30.5525, 79.5590],
      [30.5515, 79.5615],
      [30.5490, 79.5595]
    ],
    polygon: [
      [30.5500, 79.5570],
      [30.5525, 79.5590],
      [30.5515, 79.5615],
      [30.5490, 79.5595]
    ]
  },
  {
    id: "sec-manohar",
    name: "Manohar Bagh Settlement (Ward 5)",
    shortName: "Manohar Bagh",
    ward_no: "Ward-05",
    zone: "ORANGE",
    status: "ORANGE",
    tier: "WARNING_AMBER",
    hazard_tier: "WARNING_AMBER",
    rpi: 58,
    baseRpi: 58,
    calculatedRpi: 58,
    fos: 1.15,
    baseFos: 1.15,
    currentFos: 1.15,
    rainSensitivity: 0.38,
    slope: "34.2°",
    slope_deg: 34.2,
    population: 1950,
    civilians: 1950,
    dwellings: 154,
    houses: 154,
    redTagged: 66,
    cracked_units: 66,
    insarVelocity: "-11.8 mm/yr",
    reliefHub: "Joshimath High Spur (ITBP Spur) | 1.8 km Immediate Access",
    targetCampId: "camp-itbp-cantt",
    assignedCamp: RELIEF_CAMPS[3],
    allocated_camp: "ITBP / Army Cantonment High Spur",
    color: "#f97316",
    strokeColor: "#f97316",
    fillColor: "#ea580c",
    fillOpacity: 0.44,
    center: [30.5548, 79.5632],
    coords: [30.5548, 79.5632],
    lat: 30.5548,
    lon: 79.5632,
    coordinates: [
      [30.5540, 79.5610],
      [30.5565, 79.5630],
      [30.5555, 79.5655],
      [30.5530, 79.5635]
    ],
    polygon: [
      [30.5540, 79.5610],
      [30.5565, 79.5630],
      [30.5555, 79.5655],
      [30.5530, 79.5635]
    ]
  },
  {
    id: "sec-marwari",
    name: "Marwari JP Colony (Ward 1)",
    shortName: "Marwari JP Colony",
    ward_no: "Ward-01",
    zone: "ORANGE",
    status: "ORANGE",
    tier: "WARNING_AMBER",
    hazard_tier: "WARNING_AMBER",
    rpi: 62,
    baseRpi: 62,
    calculatedRpi: 62,
    fos: 1.08,
    baseFos: 1.08,
    currentFos: 1.08,
    rainSensitivity: 0.38,
    slope: "36.0°",
    slope_deg: 36.0,
    population: 1720,
    civilians: 1720,
    dwellings: 140,
    houses: 140,
    redTagged: 52,
    cracked_units: 52,
    insarVelocity: "-13.5 mm/yr",
    reliefHub: "Pipalkoti Valley Transit Shelter (NH-07) (18 km Down-Valley)",
    targetCampId: "camp-pipalkoti",
    assignedCamp: RELIEF_CAMPS[1],
    allocated_camp: "Pipalkoti Valley Transit Shelter (NH-07)",
    color: "#f97316",
    strokeColor: "#f97316",
    fillColor: "#ea580c",
    fillOpacity: 0.44,
    center: [30.5611, 79.5536],
    coords: [30.5611, 79.5536],
    lat: 30.5611,
    lon: 79.5536,
    coordinates: [
      [30.5600, 79.5525],
      [30.5625, 79.5540],
      [30.5615, 79.5565],
      [30.5590, 79.5550]
    ],
    polygon: [
      [30.5600, 79.5525],
      [30.5625, 79.5540],
      [30.5615, 79.5565],
      [30.5590, 79.5550]
    ]
  },
  {
    id: "sec-gandhinagar",
    name: "Gandhi Nagar & Main Bazar (Ward 2)",
    shortName: "Gandhi Nagar Bazar",
    ward_no: "Ward-02",
    zone: "YELLOW",
    status: "YELLOW",
    tier: "MODERATE_YELLOW",
    hazard_tier: "MODERATE_YELLOW",
    rpi: 44,
    baseRpi: 44,
    calculatedRpi: 44,
    fos: 1.34,
    baseFos: 1.34,
    currentFos: 1.34,
    rainSensitivity: 0.36,
    slope: "29.5°",
    slope_deg: 29.5,
    population: 1600,
    civilians: 1600,
    dwellings: 128,
    houses: 128,
    redTagged: 22,
    cracked_units: 22,
    insarVelocity: "-6.2 mm/yr",
    reliefHub: "Joshimath High Spur (ITBP Spur) | 1.5 km Immediate Access",
    targetCampId: "camp-itbp-cantt",
    assignedCamp: RELIEF_CAMPS[3],
    allocated_camp: "ITBP / Army Cantonment High Spur",
    color: "#eab308",
    strokeColor: "#eab308",
    fillColor: "#ca8a04",
    fillOpacity: 0.36,
    center: [30.5555, 79.5605],
    coords: [30.5555, 79.5605],
    lat: 30.5555,
    lon: 79.5605,
    coordinates: [
      [30.5550, 79.5585],
      [30.5570, 79.5600],
      [30.5560, 79.5625],
      [30.5540, 79.5610]
    ],
    polygon: [
      [30.5550, 79.5585],
      [30.5570, 79.5600],
      [30.5560, 79.5625],
      [30.5540, 79.5610]
    ]
  },
  {
    id: "ward-6-ravigram",
    name: "Ravigram Upper Terrace (Ward 6)",
    shortName: "Ravigram Terrace",
    ward_no: "Ward-06",
    zone: "GREEN",
    status: "GREEN",
    tier: "STABLE_GREEN",
    hazard_tier: "STABLE_GREEN",
    rpi: 26,
    baseRpi: 26,
    calculatedRpi: 26,
    fos: 1.48,
    baseFos: 1.48,
    currentFos: 1.48,
    rainSensitivity: 0.42,
    slope: "24.5°",
    slope_deg: 24.5,
    population: 1380,
    civilians: 1380,
    dwellings: 110,
    houses: 110,
    redTagged: 14,
    cracked_units: 14,
    insarVelocity: "-3.5 mm/yr",
    reliefHub: "Gopeshwar District Sports Stadium (32 km Down-Valley via NH-07)",
    targetCampId: "camp-gopeshwar",
    assignedCamp: RELIEF_CAMPS[0],
    allocated_camp: "Gopeshwar District Sports Stadium",
    color: "#10b981",
    strokeColor: "#10b981",
    fillColor: "#059669",
    fillOpacity: 0.32,
    center: [30.558625, 79.5645],
    coords: [30.558625, 79.5645],
    lat: 30.558625,
    lon: 79.5645,
    coordinates: [
      [30.5580, 79.5620],
      [30.5605, 79.5640],
      [30.5592, 79.5670],
      [30.5568, 79.5650]
    ],
    polygon: [
      [30.5580, 79.5620],
      [30.5605, 79.5640],
      [30.5592, 79.5670],
      [30.5568, 79.5650]
    ]
  }
];

export const getDynamicHazardSectors = (rainMm = 30) => {
  const rf = Number(rainMm) || 0;
  return HAZARD_SECTORS.map((sec) => {
    const sensitivity = sec.rainSensitivity || 0.40;
    const dynamicFos = Math.max(0.35, Number((sec.baseFos - (rf / 150.0) * sensitivity).toFixed(2)));
    const dynamicRpi = Math.min(100, Math.max(10, Math.round(sec.baseRpi + (rf / 150.0) * (sensitivity * 55))));

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
      rpi: dynamicRpi,
      calculatedRpi: dynamicRpi,
      rpi_score: Number((dynamicRpi / 100).toFixed(3)),
      fos: dynamicFos,
      currentFos: dynamicFos,
      zone,
      status,
      tier: zone === "RED" ? "CRITICAL_RED" : zone === "ORANGE" ? "WARNING_AMBER" : zone === "YELLOW" ? "MODERATE_YELLOW" : "STABLE_GREEN",
      hazard_tier: zone === "RED" ? "CRITICAL_RED" : zone === "ORANGE" ? "WARNING_AMBER" : zone === "YELLOW" ? "MODERATE_YELLOW" : "STABLE_GREEN",
      color: strokeColor,
      strokeColor,
      fillColor,
      fillOpacity
    };
  });
};
