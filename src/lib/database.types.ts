export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          role: 'user' | 'admin' | 'super_admin'
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          role?: 'user' | 'admin' | 'super_admin'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: 'user' | 'admin' | 'super_admin'
          full_name?: string | null
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          emoji: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          emoji?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          emoji?: string
          updated_at?: string
        }
      }
      personnel: {
        Row: {
          id: string
          name: string
          position: string
          department_id: string | null
          phone: string | null
          email: string | null
          role: string | null
          custom_duties: Json
          custom_qualifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          department_id?: string | null
          phone?: string | null
          email?: string | null
          role?: string | null
          custom_duties?: Json
          custom_qualifications?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          department_id?: string | null
          phone?: string | null
          email?: string | null
          role?: string | null
          custom_duties?: Json
          custom_qualifications?: Json
          updated_at?: string
        }
      }
      permit_workers: {
        Row: {
          permit_id: string
          worker_id: string
          created_at: string
        }
        Insert: {
          permit_id: string
          worker_id: string
          created_at?: string
        }
        Update: {
          permit_id?: string
          worker_id?: string
          created_at?: string
        }
      }
      permits: {
        Row: {
          id: string
          permit_number: string
          type: string
          description: string | null
          location: string | null
          status:
            | 'draft'
            | 'issued'
            | 'in-progress'
            | 'suspended'
            | 'completed'
            | 'closed'
            | 'cancelled'
          start_date: string | null
          end_date: string | null
          responsible_person_id: string | null
          issuer_id: string | null
          supervisor_id: string | null
          safety_measures: Json
          equipment: Json
          hazards: Json
          work_scope: string | null
          valid_until: string | null
          foreman_id: string | null
          daily_admissions: Json
          notes: string | null
          attachments: Json
          is_combined_work: boolean
          combined_work_journal_ref: string | null
          issued_at: string | null
          started_at: string | null
          completed_at: string | null
          closed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          permit_number: string
          type: string
          description?: string | null
          location?: string | null
          status?:
            | 'draft'
            | 'issued'
            | 'in-progress'
            | 'suspended'
            | 'completed'
            | 'closed'
            | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          responsible_person_id?: string | null
          issuer_id?: string | null
          supervisor_id?: string | null
          safety_measures?: Json
          equipment?: Json
          hazards?: Json
          work_scope?: string | null
          valid_until?: string | null
          foreman_id?: string | null
          daily_admissions?: Json
          notes?: string | null
          attachments?: Json
          is_combined_work?: boolean
          combined_work_journal_ref?: string | null
          issued_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          closed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          permit_number?: string
          type?: string
          description?: string | null
          location?: string | null
          status?:
            | 'draft'
            | 'issued'
            | 'in-progress'
            | 'suspended'
            | 'completed'
            | 'closed'
            | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          responsible_person_id?: string | null
          issuer_id?: string | null
          supervisor_id?: string | null
          safety_measures?: Json
          equipment?: Json
          hazards?: Json
          work_scope?: string | null
          valid_until?: string | null
          foreman_id?: string | null
          daily_admissions?: Json
          notes?: string | null
          attachments?: Json
          is_combined_work?: boolean
          combined_work_journal_ref?: string | null
          issued_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          closed_at?: string | null
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title_ru: string
          title_tr: string | null
          title_en: string | null
          content_ru: string
          content_tr: string | null
          content_en: string | null
          type: 'info' | 'warning' | 'urgent'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_ru: string
          title_tr?: string | null
          title_en?: string | null
          content_ru: string
          content_tr?: string | null
          content_en?: string | null
          type?: 'info' | 'warning' | 'urgent'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_ru?: string
          title_tr?: string | null
          title_en?: string | null
          content_ru?: string
          content_tr?: string | null
          content_en?: string | null
          type?: 'info' | 'warning' | 'urgent'
          updated_at?: string
        }
      }
      faq: {
        Row: {
          id: string
          question: Json
          answer: Json
          category: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: Json
          answer: Json
          category?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: Json
          answer?: Json
          category?: string | null
          order_index?: number
          updated_at?: string
        }
      }
      combined_work_log: {
        Row: {
          id: string
          date: string
          person_id: string | null
          work_description: string
          location: string | null
          ptw_numbers: Json
          organizations: Json
          work_types: Json
          safety_measures: Json
          hours: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          person_id?: string | null
          work_description: string
          location?: string | null
          ptw_numbers?: Json
          organizations?: Json
          work_types?: Json
          safety_measures?: Json
          hours: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          person_id?: string | null
          work_description?: string
          location?: string | null
          ptw_numbers?: Json
          organizations?: Json
          work_types?: Json
          safety_measures?: Json
          hours?: number
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          user_name: string
          action: 'create' | 'update' | 'delete' | 'export' | 'import' | 'login' | 'logout'
          entity_type: 'personnel' | 'department' | 'ptw' | 'combined-work' | 'faq' | 'announcement'
          entity_id: string
          entity_name: string | null
          changes: Json
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          action: 'create' | 'update' | 'delete' | 'export' | 'import' | 'login' | 'logout'
          entity_type: 'personnel' | 'department' | 'ptw' | 'combined-work' | 'faq' | 'announcement'
          entity_id: string
          entity_name?: string | null
          changes?: Json
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          action?: 'create' | 'update' | 'delete' | 'export' | 'import' | 'login' | 'logout'
          entity_type?: 'personnel' | 'department' | 'ptw' | 'combined-work' | 'faq' | 'announcement'
          entity_id?: string
          entity_name?: string | null
          changes?: Json
          metadata?: Json
          created_at?: string
        }
      }
      edit_locks: {
        Row: {
          id: string
          resource_type: string
          resource_id: string
          owner_id: string
          owner_name: string | null
          created_at: string
          updated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          resource_type: string
          resource_id: string
          owner_id: string
          owner_name?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_type?: string
          resource_id?: string
          owner_id?: string
          owner_name?: string | null
          expires_at?: string
          updated_at?: string
        }
      }
    }
  }
}
