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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'user' | 'employee'
          is_active: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'user' | 'employee'
          is_active?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'user' | 'employee'
          is_active?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menus: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          route: string
          order_index: number
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string
          route: string
          order_index?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          route?: string
          order_index?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_menus: {
        Row: {
          id: string
          user_id: string
          menu_id: string
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          menu_id: string
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          menu_id?: string
          granted_by?: string | null
          granted_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
  }
}
