import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Department = Database['public']['Tables']['departments']['Row'];
type NewDepartment = Database['public']['Tables']['departments']['Insert'];
type UpdateDepartment = Database['public']['Tables']['departments']['Update'];

export const departmentStore = {
  async getAll() {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(department: NewDepartment) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('departments')
      .insert([department])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, department: UpdateDepartment) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('departments')
      .update(department)
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
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
