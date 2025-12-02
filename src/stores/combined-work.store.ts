import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

 type CombinedWorkRow = Database['public']['Tables']['combined_work_log']['Row'];
 type CombinedWorkInsert = Database['public']['Tables']['combined_work_log']['Insert'];
 type CombinedWorkUpdate = Database['public']['Tables']['combined_work_log']['Update'];

// Нормализация JSON-полей, чтобы не отправлять undefined
const normalizeJson = <T extends Record<string, any>>(payload: T): T => {
  const next = { ...payload } as T
  const jsonKeys = ['ptw_numbers', 'organizations', 'work_types', 'safety_measures']
  for (const key of jsonKeys) {
    if (key in next) {
      const val = next[key]
      if (val === undefined) {
        // по умолчанию пустой массив, чтобы согласовать тип Json
        next[key] = []
      }
    }
  }
  return next
}

export const combinedWorkStore = {
  async getAll(): Promise<CombinedWorkRow[]> {
     if (!isSupabaseAvailable()) {
       throw new Error('Supabase not available');
     }

     const { data, error } = await supabase!
       .from('combined_work_log')
       .select('*')
       .order('date', { ascending: false });

     if (error) throw error;
    return data as CombinedWorkRow[];
   },

  async create(payload: CombinedWorkInsert): Promise<CombinedWorkRow> {
     if (!isSupabaseAvailable()) {
      // enqueue offline create
      offlineQueue.enqueue('combined_work_log', 'create', payload)
      return {
        ...(payload as any),
        id: 'offline-' + Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as CombinedWorkRow
     }

    const prepared = normalizeJson<CombinedWorkInsert>(payload)
     const { data, error } = await supabase!
       .from('combined_work_log')
      .insert<CombinedWorkInsert>([prepared])
       .select()
       .single();

     if (error) throw error;
     return data as CombinedWorkRow;
   },

  async update(id: string, payload: CombinedWorkUpdate): Promise<CombinedWorkRow> {
     if (!isSupabaseAvailable()) {
      offlineQueue.enqueue('combined_work_log', 'update', { id, ...payload }, id)
      return {
        id,
        ...(payload as any),
        updated_at: new Date().toISOString(),
      } as CombinedWorkRow
     }

    const prepared = normalizeJson<CombinedWorkUpdate>(payload)
     const { data, error } = await supabase!
       .from('combined_work_log')
      .update<CombinedWorkUpdate>(prepared)
       .eq('id', id)
       .select()
       .single();

     if (error) throw error;
     return data as CombinedWorkRow;
   },

  async delete(id: string): Promise<void> {
     if (!isSupabaseAvailable()) {
      offlineQueue.enqueue('combined_work_log', 'delete', { id }, id)
      return
     }

     const { error } = await supabase!
       .from('combined_work_log')
       .delete()
       .eq('id', id);

     if (error) throw error;
   },
 };
