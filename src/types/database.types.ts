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
      cities: {
        Row: {
          id: string
          slug: string
          name: string
          state: string
          brand_name: string
          domain: string
          code: string
          status: 'active' | 'coming_soon' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          slug: string
          name: string
          state: string
          brand_name: string
          domain: string
          code: string
          status?: 'active' | 'coming_soon' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          state?: string
          brand_name?: string
          domain?: string
          code?: string
          status?: 'active' | 'coming_soon' | 'inactive'
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string
          phone: string | null
          email: string
          city_id: string | null
          account_status: 'active' | 'suspended' | 'pending_verification'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          phone?: string | null
          email: string
          city_id?: string | null
          account_status?: 'active' | 'suspended' | 'pending_verification'
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          phone?: string | null
          email?: string
          city_id?: string | null
          account_status?: 'active' | 'suspended' | 'pending_verification'
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          city_id: string | null
          role: 'customer' | 'business_owner' | 'data_entry_staff' | 'city_franchise' | 'super_admin'
          assigned_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          city_id?: string | null
          role: 'customer' | 'business_owner' | 'data_entry_staff' | 'city_franchise' | 'super_admin'
          assigned_by?: string | null
          created_at?: string
        }
        Update: {
          city_id?: string | null
          role?: 'customer' | 'business_owner' | 'data_entry_staff' | 'city_franchise' | 'super_admin'
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          name_te: string
          name_ta: string | null
          name_kn: string | null
          icon: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          name_te: string
          name_ta?: string | null
          name_kn?: string | null
          icon: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          name_te?: string
          name_ta?: string | null
          name_kn?: string | null
          icon?: string
          description?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          legacy_id: string | null
          city_id: string
          owner_id: string | null
          category_id: string
          name: string
          description: string
          phone: string
          whatsapp: string | null
          email: string | null
          address: string
          locality: string
          latitude: number | null
          longitude: number | null
          status: 'draft' | 'pending' | 'active' | 'rejected' | 'suspended'
          is_verified: boolean
          is_featured: boolean
          rating: number
          reviews_count: number
          views_count: number
          price_range: string | null
          timings: string | null
          services: string[]
          badge: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legacy_id?: string | null
          city_id: string
          owner_id?: string | null
          category_id: string
          name: string
          description: string
          phone: string
          whatsapp?: string | null
          email?: string | null
          address: string
          locality: string
          latitude?: number | null
          longitude?: number | null
          status?: 'draft' | 'pending' | 'active' | 'rejected' | 'suspended'
          is_verified?: boolean
          is_featured?: boolean
          rating?: number
          reviews_count?: number
          views_count?: number
          price_range?: string | null
          timings?: string | null
          services?: string[]
          badge?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          name?: string
          description?: string
          phone?: string
          whatsapp?: string | null
          email?: string | null
          address?: string
          locality?: string
          latitude?: number | null
          longitude?: number | null
          status?: 'draft' | 'pending' | 'active' | 'rejected' | 'suspended'
          is_verified?: boolean
          is_featured?: boolean
          price_range?: string | null
          timings?: string | null
          services?: string[]
          badge?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      business_images: {
        Row: {
          id: string
          business_id: string
          storage_path: string
          image_url: string | null
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          storage_path: string
          image_url?: string | null
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          storage_path?: string
          image_url?: string | null
          is_cover?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      customer_enquiries: {
        Row: {
          id: string
          business_id: string
          city_id: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          message: string
          status: 'pending' | 'read' | 'replied' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          city_id: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          message: string
          status?: 'pending' | 'read' | 'replied' | 'archived'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'read' | 'replied' | 'archived'
        }
        Relationships: []
      }
      classified_ads: {
        Row: {
          id: string
          legacy_id: string | null
          city_id: string
          owner_id: string | null
          title: string
          category: string
          price: string
          condition: string
          locality: string
          phone: string
          whatsapp: string | null
          image_url: string | null
          description: string
          status: 'active' | 'pending' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          legacy_id?: string | null
          city_id: string
          owner_id?: string | null
          title: string
          category: string
          price: string
          condition: string
          locality: string
          phone: string
          whatsapp?: string | null
          image_url?: string | null
          description: string
          status?: 'active' | 'pending' | 'expired'
          created_at?: string
        }
        Update: {
          title?: string
          category?: string
          price?: string
          condition?: string
          locality?: string
          phone?: string
          whatsapp?: string | null
          image_url?: string | null
          description?: string
          status?: 'active' | 'pending' | 'expired'
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          author_name: string
          rating: number
          comment: string
          service_quality: number | null
          value_for_money: number | null
          cleanliness: number | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          author_name: string
          rating: number
          comment: string
          service_quality?: number | null
          value_for_money?: number | null
          cleanliness?: number | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected'
        }
        Relationships: []
      }
      saved_businesses: {
        Row: {
          user_id: string
          business_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          business_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          business_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string
          city_id: string | null
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          city_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          action?: string
          details?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: string
          _city_id?: string | null
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
