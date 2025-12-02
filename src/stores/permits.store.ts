import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Permit = Database['public']['Tables']['permits']['Row'];
type NewPermit = Database['public']['Tables']['permits']['Insert'];
type UpdatePermit = Database['public']['Tables']['permits']['Update'];

export const permitStore = {
  // Приводим JSON-поля к допустимым значениям ([], {} или null), исключая undefined
  _normalizeJson<T extends Record<string, any>>(payload: T): T {
    const next = { ...payload } as T
    const arrayJsonKeys = ['safety_measures', 'equipment', 'hazards', 'attachments', 'daily_admissions']
    for (const key of arrayJsonKeys) {
      if (key in next) {
        const val = next[key]
        if (val === undefined) {
          next[key] = []
        }
      }
    }
    return next
  },
  async getAll() {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('permits')
      .select(`
        *,
        responsible:personnel!responsible_person_id(*),
        issuer:personnel!issuer_id(*),
        supervisor:personnel!supervisor_id(*),
        foreman:personnel!foreman_id(*),
        permit_workers(worker_id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('permits')
      .select(`
        *,
        responsible:personnel!responsible_person_id(*),
        issuer:personnel!issuer_id(*),
        supervisor:personnel!supervisor_id(*),
        foreman:personnel!foreman_id(*),
        permit_workers(worker_id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(permit: NewPermit, workerIds: string[] = []) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const prepared = this._normalizeJson<NewPermit>(permit)
    const { data, error } = await supabase!
      .from('permits')
      .insert<NewPermit>([prepared])
      .select()
      .single();

    if (error) throw error;

    if (workerIds.length > 0) {
      const workers = workerIds.map(id => ({
        permit_id: data.id,
        worker_id: id
      }));
      
      const { error: workersError } = await supabase!
        .from('permit_workers')
        .insert<Database['public']['Tables']['permit_workers']['Insert']>(workers);
        
      if (workersError) {
        console.error('Error adding workers:', workersError);
      }
    }

    return data;
  },

  async update(id: string, permit: UpdatePermit, workerIds?: string[]) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const prepared = this._normalizeJson<UpdatePermit>(permit)
    const { data, error } = await supabase!
      .from('permits')
      .update<UpdatePermit>(prepared)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (workerIds !== undefined) {
      // Delete existing
      await supabase!
        .from('permit_workers')
        .delete()
        .eq('permit_id', id);
        
      // Insert new
      if (workerIds.length > 0) {
        const workers = workerIds.map(wid => ({
          permit_id: id,
          worker_id: wid
        }));
        
        await supabase!
          .from('permit_workers')
          .insert<Database['public']['Tables']['permit_workers']['Insert']>(workers);
      }
    }

    return data;
  },

  async delete(id: string) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { error } = await supabase!
      .from('permits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getByStatus(status: 'draft' | 'active' | 'completed' | 'cancelled') {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('permits')
      .select(`
        *,
        responsible:personnel!responsible_person_id(*),
        issuer:personnel!issuer_id(*),
        supervisor:personnel!supervisor_id(*),
        permit_workers(worker_id)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
