import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wtlzlpkwxlvfzqgkssch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bHpscGt3eGx2ZnpxZ2tzc2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NzAyMzIsImV4cCI6MjEwNTM0NjIzMn0.NrgCgbbH7NxzYPuonRwnQVY61fsv8qDxNbsSOUAd9Ls';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export async function fetchLiveReliefCamps() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('relief_camps')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export async function fetchLiveTransitFleet() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('evacuation_fleet')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export async function fetchLiveWardsRisk() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('wards_risk_index')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export async function fetchLiveSectors() {
  return fetchLiveWardsRisk();
}

export async function logEvacuationTransit({ vehicleReg, sourceWard, destCamp, passengers, status }) {
  if (!supabase) return null;
  try {
    const payload = {
      vehicle_reg: vehicleReg || 'UK 07 PA 4412',
      source_ward_name: sourceWard || 'Sector Staging Point',
      destination_camp_name: destCamp || 'Designated Relief Shelter',
      passengers_moved: Number(passengers !== undefined ? passengers : 0),
      status: status || 'IN TRANSIT'
    };

    const { data, error } = await supabase
      .from('evacuation_transits')
      .insert([payload])
      .select();

    if (error) {
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export async function updateFleetStatus(vehicleId, status, manifestLoad, extra = {}) {
  if (!supabase) return null;
  try {
    const payload = {};
    if (status !== undefined && status !== null) {
      payload.status = status;
    }
    if (manifestLoad !== undefined && manifestLoad !== null) {
      payload.current_load = Number(manifestLoad);
      if (extra.capacity) {
        payload.load_percent = Math.min(100, Math.round((Number(manifestLoad) / Number(extra.capacity)) * 100));
      }
    }

    let query = supabase.from('evacuation_fleet').update(payload);
    if (typeof vehicleId === 'number') {
      query = query.eq('id', vehicleId);
    } else if (typeof vehicleId === 'string' && vehicleId.startsWith('UK') || vehicleId.startsWith('IAF')) {
      query = query.eq('registration_no', vehicleId);
    } else {
      query = query.or(`registration_no.eq.${vehicleId},id.eq.${Number(vehicleId) || 0}`);
    }

    const { data } = await query.select();

    const transitStatus = status === 'HALTED' ? 'HALTED' : (status === 'EN ROUTE' ? 'IN TRANSIT' : String(status));
    const vehicleReg = extra.reg || (typeof vehicleId === 'string' && (vehicleId.startsWith('UK') || vehicleId.startsWith('IAF')) ? vehicleId : (data?.[0]?.registration_no || String(vehicleId)));
    const sourceWard = extra.pickup || extra.origin_axis || data?.[0]?.origin_axis || 'Chamoli Ward Sector';
    const destCamp = extra.destination || extra.destination_camp_name || data?.[0]?.destination_camp_name || 'Designated Shelter';
    const paxMoved = manifestLoad !== undefined ? Number(manifestLoad) : (data?.[0]?.current_load || 0);

    await logEvacuationTransit({
      vehicleReg,
      sourceWard,
      destCamp,
      passengers: paxMoved,
      status: transitStatus
    });

    return data;
  } catch (err) {
    return null;
  }
}

export async function updateCampOccupancy(campId, newOccupancy) {
  if (!supabase) return null;
  try {
    const payload = typeof newOccupancy === 'object'
      ? newOccupancy
      : { occupied_beds: Number(newOccupancy) };

    let query = supabase.from('relief_camps').update(payload);
    if (typeof campId === 'number') {
      query = query.eq('id', campId);
    } else {
      query = query.or(`camp_code.eq.${campId},id.eq.${Number(campId) || 0}`);
    }

    const { data } = await query.select();
    return data;
  } catch (err) {
    return null;
  }
}

export async function logDispatchAudit(auditRecord = {}) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('dispatch_audits')
      .insert([
        {
          order_ref: auditRecord.orderRef || 'DDMA/CHM/2026-EVAC',
          ward_name: auditRecord.wardName || 'Sector Monitored Zones',
          evac_count: auditRecord.evacCount || 858,
          timestamp: new Date().toISOString(),
          status: 'DISPATCHED',
          metadata: auditRecord.metadata || {}
        }
      ])
      .select();

    if (error) {
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}
