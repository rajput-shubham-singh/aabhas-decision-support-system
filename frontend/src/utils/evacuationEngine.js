import { RELIEF_CAMPS } from '../data/hazardSectors.js';

export function allocateSectorsToCamps(sectors = [], rawCamps = RELIEF_CAMPS, isRoadBlocked = false) {
  const campsList = (rawCamps && Array.isArray(rawCamps) && rawCamps.length > 0) ? rawCamps : RELIEF_CAMPS;
  
  const camps = campsList.map(c => ({
    ...c,
    remainingCapacity: typeof c.bedsAvailable === 'number' 
      ? c.bedsAvailable 
      : (typeof c.capacity === 'number' ? c.capacity : (c.total_bed_capacity || 1000))
  }));

  const sortedSectors = [...sectors].sort((a, b) => {
    const rpiA = Number(a.rpiScore || a.rpi || a.calculatedRpi || 0);
    const rpiB = Number(b.rpiScore || b.rpi || b.calculatedRpi || 0);
    return rpiB - rpiA;
  });

  return sortedSectors.map(sector => {
    const sectorCenter = sector.center || sector.coords || [sector.lat || 30.55, sector.lon || 79.55];

    const eligibleCamps = camps
      .filter(camp => {
        if (isRoadBlocked && (camp.id === 'camp-pipalkoti' || camp.id === 'camp-3')) {
          return false;
        }
        return camp.remainingCapacity > 0;
      })
      .map(camp => {
        const campLoc = camp.location || camp.coords || [30.42, 79.33];
        const dLat = (sectorCenter[0] || 30.55) - (campLoc[0] || 30.42);
        const dLng = (sectorCenter[1] || 79.55) - (campLoc[1] || 79.33);
        const dist = Math.hypot(dLat, dLng);
        return { camp, dist };
      })
      .sort((a, b) => a.dist - b.dist);

    const selected = eligibleCamps[0]?.camp || camps[0];

    const pop = Number(sector.population || sector.civilians || 500);
    selected.remainingCapacity = Math.max(0, selected.remainingCapacity - pop);

    return {
      ...sector,
      assignedCamp: selected,
      reliefHub: `${selected.name} (${selected.shortName || selected.role || 'Safe Base'})`,
      allocated_camp: selected.name,
      targetCampId: selected.id
    };
  });
}
