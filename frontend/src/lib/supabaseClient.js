import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beunztzqqabivgvzfocu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldW56dHpxcWFiaXZndnpmb2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTA2NjMsImV4cCI6MjEwNTI4NjY2M30.6HlCoAH4Rz8vorDGMdivvvUf5OMua_54vyucMY4ojDk';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export async function fetchLiveReliefCamps() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('relief_camps')
      .select('*');

    if (error) {
      console.warn('[Supabase] relief_camps fetch notice:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] relief_camps connection error:', err);
    return null;
  }
}

export async function fetchLiveSectors() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('*');

    if (error) {
      console.warn('[Supabase] sectors fetch notice:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] sectors connection error:', err);
    return null;
  }
}

export async function fetchLiveTransitFleet() {
  if (!supabase) return null;
  try {
    let { data, error } = await supabase
      .from('evacuation_fleet')
      .select('*');

    if (error || !data) {
      const fallback = await supabase.from('transit_fleet').select('*');
      data = fallback.data;
    }

    return data;
  } catch (err) {
    console.warn('[Supabase] evacuation_fleet connection error:', err);
    return null;
  }
}

export async function fetchLiveRoadBlockages() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('road_blockages')
      .select('*');

    if (error) {
      console.warn('[Supabase] road_blockages fetch notice:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] road_blockages connection error:', err);
    return null;
  }
}

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
