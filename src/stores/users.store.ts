import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export const userStore = {
  async getAll() {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not available');
      return [];
    }
    
    const { data, error } = await supabase!
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateUserRole(id: string, role: 'user' | 'admin' | 'super_admin') {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not available');
    }
    
    const { data, error } = await supabase!
      .from('user_profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  async getSystemStats() {
    if (!isSupabaseAvailable()) {
      return {
        users: 0,
        admins: 0,
        super_admins: 0,
        storage_used_mb: 0
      };
    }

    // This is a rough estimate or requires specific RPC calls for accurate counts in large DBs
    // For now, we fetch all profiles to count. In production, use count() query.
    const { count: userCount, error: userError } = await supabase!
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
      
    const { count: adminCount, error: adminError } = await supabase!
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    const { count: superAdminCount, error: superAdminError } = await supabase!
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    return {
      users: userCount || 0,
      admins: adminCount || 0,
      super_admins: superAdminCount || 0,
      storage_used_mb: 12.5 // Mock value as we can't easily get DB size from client
    };
  }
};
