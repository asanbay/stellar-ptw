import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Permit = Database['public']['Tables']['permits']['Row'];
type NewPermit = Database['public']['Tables']['permits']['Insert'];
type UpdatePermit = Database['public']['Tables']['permits']['Update'];

export const permitStore = {
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
        supervisor:personnel!supervisor_id(*)
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
        supervisor:personnel!supervisor_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(permit: NewPermit) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('permits')
      .insert([permit])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, permit: UpdatePermit) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('permits')
      .update(permit)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
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
        supervisor:personnel!supervisor_id(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
