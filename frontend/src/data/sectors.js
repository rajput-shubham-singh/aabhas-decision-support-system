import { HAZARD_SECTORS, RELIEF_CAMPS, getDynamicHazardSectors } from './hazardSectors.js';
import { allocateSectorsToCamps } from '../utils/evacuationEngine.js';

export { HAZARD_SECTORS, RELIEF_CAMPS, getDynamicHazardSectors, allocateSectorsToCamps };

export const CHAMOLI_DISTRICT_SECTORS = HAZARD_SECTORS;

export const CHAMOLI_RELIEF_HUBS = RELIEF_CAMPS;

export const getDynamicSectors = (rainMm = 30) => {
  return getDynamicHazardSectors(rainMm);
};

export const BALANCED_SECTORS = CHAMOLI_DISTRICT_SECTORS;
export const TOPOGRAPHIC_SECTORS = CHAMOLI_DISTRICT_SECTORS;
export const SAFE_RELIEF_CAMPS = CHAMOLI_RELIEF_HUBS;
export const VERIFIED_RELIEF_CAMPS = CHAMOLI_RELIEF_HUBS;
export const CHAMOLI_SECTORS = CHAMOLI_DISTRICT_SECTORS;

