import { useDisasterData } from './useDisasterData.js';
import { supabase, updateCampOccupancy as dbUpdateCampOccupancy, updateFleetStatus as dbUpdateFleetStatus } from '../lib/supabaseClient.js';

export async function updateCampOccupancy(campId, newOccupancy) {
  if (!supabase) return null;
  try {
    const updatePayload = typeof newOccupancy === 'object' 
      ? newOccupancy 
      : { suitability_score: Number(newOccupancy) };

    const { data, error } = await supabase
      .from('relief_camps')
      .update(updatePayload)
      .eq('id', campId)
      .select();

    if (error) {
      console.warn('[Supabase] updateCampOccupancy notice:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] updateCampOccupancy error:', err);
    return null;
  }
}

export async function updateFleetStatus(vehicleId, status, manifestLoad) {
  if (!supabase) return null;
  try {
    const payload = {};
    if (status !== undefined && status !== null) payload.status = status;
    if (manifestLoad !== undefined && manifestLoad !== null) payload.manifest_load = Number(manifestLoad);

    let { data, error } = await supabase
      .from('evacuation_fleet')
      .update(payload)
      .eq('id', vehicleId)
      .select();

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('transit_fleet')
        .update(payload)
        .eq('id', vehicleId)
        .select();
      data = fallback.data;
    }

    return data;
  } catch (err) {
    console.warn('[Supabase] updateFleetStatus error:', err);
    return null;
  }
}

export const useLiveDisasterData = useDisasterData;
export { useDisasterData };
export default useDisasterData;
