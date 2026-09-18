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
    allocated_camp: "Military Cantonment & ITBP High-Ground Spur",
    center: [30.5562, 79.5645],
    coords: [30.5562, 79.5645],
    lat: 30.5562,
    lon: 79.5645,
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
    allocated_camp: "Pipalkoti Intermediate Relief Center",
    center: [30.5280, 79.5105],
    coords: [30.5280, 79.5105],
    lat: 30.5280,
    lon: 79.5105,
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
    allocated_camp: "Gauchar Civil Airstrip Transit Center",
    center: [30.2610, 79.2215],
    coords: [30.2610, 79.2215],
    lat: 30.2610,
    lon: 79.2215,
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
    allocated_camp: "Gopeshwar District Sports Stadium",
    center: [30.0630, 79.4950],
    coords: [30.0630, 79.4950],
    lat: 30.0630,
    lon: 79.4950,
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
    allocated_camp: "Local In-situ Refuge",
    center: [30.5498, 79.5780],
    coords: [30.5498, 79.5780],
    lat: 30.5498,
    lon: 79.5780,
    polygon: [
      [30.5525, 79.5750],
      [30.5515, 79.5820],
      [30.5475, 79.5810],
      [30.5470, 79.5760],
      [30.5495, 79.5740]
    ]
  }
];

export const CHAMOLI_RELIEF_HUBS = [
  {
    id: "camp-gopeshwar",
    name: "Gopeshwar District Sports Stadium",
    alt_name: "Gopeshwar District HQ Hub",
    role: "Primary Macro-Relief Hub",
    location: "Gopeshwar Terrace (Chamoli District HQ)",
    coords: [30.4135, 79.3245],
    lat: 30.4135,
    lon: 79.3245,
    capacity: 3200,
    total_bed_capacity: 3200,
    totalBeds: 3200,
    water: "2,40,000 L/day",
    waterReserveLPD: 240000,
    waterCapLPD: 240000,
    foodPackets: 12000,
    rations: "12,000 MRE/Ration packets",
    safe_corridor: "Gopeshwar-Mandal Axis",
    authority: "District Magistrate Chamoli"
  },
  {
    id: "camp-gauchar",
    name: "Gauchar Civil Airstrip Transit Center",
    alt_name: "Gauchar Strategic Air-Evacuation Node",
    role: "Strategic Air-Evacuation Node",
    location: "Gauchar River Terrace",
    coords: [30.2850, 79.1550],
    lat: 30.2850,
    lon: 79.1550,
    capacity: 4500,
    total_bed_capacity: 4500,
    totalBeds: 4500,
    water: "3,37,500 L/day",
    waterReserveLPD: 337500,
    waterCapLPD: 337500,
    foodPackets: 15000,
    rations: "15,000 MRE/Ration packets",
    safe_corridor: "Gauchar Air Corridor & NH-58",
    authority: "Indian Air Force / NDRF 8th Bn"
  },
  {
    id: "camp-pipalkoti",
    name: "Pipalkoti Intermediate Relief Center",
    alt_name: "TRC & Mandir Samiti Complex",
    role: "Intermediate Relief Center",
    location: "Pipalkoti Mid-Valley Shelf (NH-07 Axis)",
    coords: [30.4289, 79.4325],
    lat: 30.4289,
    lon: 79.4325,
    capacity: 1450,
    total_bed_capacity: 1450,
    totalBeds: 1450,
    water: "1,08,750 L/day",
    waterReserveLPD: 108750,
    waterCapLPD: 108750,
    foodPackets: 4500,
    rations: "4,500 MRE/Ration packets",
    safe_corridor: "NH-07 Lower Axis",
    authority: "Chamoli District Admin / SDM Pipalkoti"
  },
  {
    id: "camp-cantt",
    name: "Military Cantonment & ITBP High-Ground Spur",
    alt_name: "Joshimath Immediate Refuge Spur",
    role: "Joshimath Immediate Refuge",
    location: "Upper Military Spur, Joshimath",
    coords: [30.5465, 79.5690],
    lat: 30.5465,
    lon: 79.5690,
    capacity: 850,
    total_bed_capacity: 850,
    totalBeds: 850,
    water: "63,750 L/day",
    waterReserveLPD: 63750,
    waterCapLPD: 63750,
    foodPackets: 3000,
    rations: "3,000 Field Rations",
    safe_corridor: "Military High-Ground Ridge",
    authority: "Indian Army / ITBP 1st Bn"
  }
];

export const getDynamicSectors = (rainMm = 30) => {
  const rf = Number(rainMm) || 0;
  return CHAMOLI_DISTRICT_SECTORS.map((sec) => {
    const dynamicRpi = Math.min(100, Math.round(sec.baseRpi + rf * 0.25));
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
      rpi: dynamicRpi,
      calculatedRpi: dynamicRpi,
      status,
      tier: status === "RED" ? "CRITICAL_RED" : status === "ORANGE" ? "WARNING_AMBER" : "STABLE_GREEN",
      strokeColor,
      fillColor,
      fillOpacity
    };
  });
};

export const BALANCED_SECTORS = CHAMOLI_DISTRICT_SECTORS;
export const TOPOGRAPHIC_SECTORS = CHAMOLI_DISTRICT_SECTORS;
export const SAFE_RELIEF_CAMPS = CHAMOLI_RELIEF_HUBS;
export const VERIFIED_RELIEF_CAMPS = CHAMOLI_RELIEF_HUBS;
export const CHAMOLI_SECTORS = CHAMOLI_DISTRICT_SECTORS;
