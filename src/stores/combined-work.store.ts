import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

 type CombinedWorkRow = Database['public']['Tables']['combined_work_log']['Row'];
 type CombinedWorkInsert = Database['public']['Tables']['combined_work_log']['Insert'];
 type CombinedWorkUpdate = Database['public']['Tables']['combined_work_log']['Update'];

 export const combinedWorkStore = {
   async getAll() {
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

   async create(payload: CombinedWorkInsert) {
     if (!isSupabaseAvailable()) {
       throw new Error('Supabase not available');
     }

     const { data, error } = await supabase!
       .from('combined_work_log')
       .insert([payload])
       .select()
       .single();

     if (error) throw error;
     return data as CombinedWorkRow;
   },

   async update(id: string, payload: CombinedWorkUpdate) {
     if (!isSupabaseAvailable()) {
       throw new Error('Supabase not available');
     }

     const { data, error } = await supabase!
       .from('combined_work_log')
       .update(payload)
       .eq('id', id)
       .select()
       .single();

     if (error) throw error;
     return data as CombinedWorkRow;
   },

   async delete(id: string) {
     if (!isSupabaseAvailable()) {
       throw new Error('Supabase not available');
     }

     const { error } = await supabase!
       .from('combined_work_log')
       .delete()
       .eq('id', id);

     if (error) throw error;
   },
 };
