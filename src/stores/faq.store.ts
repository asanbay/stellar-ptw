import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type FAQRow = Database['public']['Tables']['faq']['Row'];
type FAQInsert = Database['public']['Tables']['faq']['Insert'];
type FAQUpdate = Database['public']['Tables']['faq']['Update'];

export const faqStore = {
  async getAll() {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }

    const { data, error } = await supabase!
      .from('faq')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as FAQRow[];
  },

  async create(payload: FAQInsert) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }

    console.log('📤 faqStore.create payload:', payload);

    const { data, error } = await supabase!
      .from('faq')
      .insert<FAQInsert>([payload])
      .select()
      .single();

    if (error) {
      console.error('❌ faqStore.create error:', error);
      throw error;
    }
    
    console.log('✅ faqStore.create success:', data);
    return data as FAQRow;
  },

  async update(id: string, payload: FAQUpdate) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }

    const { data, error } = await supabase!
      .from('faq')
      .update<FAQUpdate>(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FAQRow;
  },

  async delete(id: string) {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }

    const { error } = await supabase!
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
