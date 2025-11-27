import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Personnel = Database['public']['Tables']['personnel']['Row'];
type NewPersonnel = Database['public']['Tables']['personnel']['Insert'];
type UpdatePersonnel = Database['public']['Tables']['personnel']['Update'];

export const personnelStore = {
  async getAll() {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available. Using local storage.');
    }
    
    const { data, error } = await supabase!
      .from('personnel')
      .select(`
        *,
        department:departments(*)
      `)
      .order('name');

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('personnel')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(person: NewPersonnel) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('personnel')
      .insert([person])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, person: UpdatePersonnel) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('personnel')
      .update(person)
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
      .from('personnel')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async bulkCreate(persons: NewPersonnel[]) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('personnel')
      .insert(persons)
      .select();

    if (error) throw error;
    return data;
  }
};
