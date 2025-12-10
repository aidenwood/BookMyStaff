export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string | null
          website: string | null
          description: string | null
          logo: string | null
          owner_id: string
          industry_id: string
          created_at: string
          updated_at: string
          settings: Json
          integrations: Json
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address?: string | null
          website?: string | null
          description?: string | null
          logo?: string | null
          owner_id: string
          industry_id: string
          created_at?: string
          updated_at?: string
          settings?: Json
          integrations?: Json
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string | null
          website?: string | null
          description?: string | null
          logo?: string | null
          owner_id?: string
          industry_id?: string
          created_at?: string
          updated_at?: string
          settings?: Json
          integrations?: Json
        }
      }
      regions: {
        Row: {
          id: string
          business_id: string
          name: string
          color: string
          postcodes: string[]
          is_active: boolean
          description: string | null
          travel_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          color: string
          postcodes: string[]
          is_active?: boolean
          description?: string | null
          travel_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          color?: string
          postcodes?: string[]
          is_active?: boolean
          description?: string | null
          travel_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      staff_members: {
        Row: {
          id: string
          business_id: string
          name: string
          email: string
          phone: string
          role: 'staff' | 'admin' | 'owner'
          regions: string[]
          avatar: string | null
          bio: string | null
          skills: string[] | null
          rating: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          email: string
          phone: string
          role?: 'staff' | 'admin' | 'owner'
          regions: string[]
          avatar?: string | null
          bio?: string | null
          skills?: string[] | null
          rating?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          email?: string
          phone?: string
          role?: 'staff' | 'admin' | 'owner'
          regions?: string[]
          avatar?: string | null
          bio?: string | null
          skills?: string[] | null
          rating?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointment_types: {
        Row: {
          id: string
          business_id: string
          name: string
          duration: number
          price: number | null
          description: string | null
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          duration: number
          price?: number | null
          description?: string | null
          color: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          duration?: number
          price?: number | null
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_address: string | null
          customer_postcode: string | null
          staff_id: string
          appointment_type_id: string
          date: string
          time: string
          duration: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          region_id: string
          confirmation_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_address?: string | null
          customer_postcode?: string | null
          staff_id: string
          appointment_type_id: string
          date: string
          time: string
          duration: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          region_id: string
          confirmation_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          customer_address?: string | null
          customer_postcode?: string | null
          staff_id?: string
          appointment_type_id?: string
          date?: string
          time?: string
          duration?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          region_id?: string
          confirmation_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: string
          staff_id: string
          business_id: string
          date: string
          start_time: string
          end_time: string
          region_id: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          business_id: string
          date: string
          start_time: string
          end_time: string
          region_id: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          business_id?: string
          date?: string
          start_time?: string
          end_time?: string
          region_id?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_availability: {
        Row: {
          id: string
          staff_id: string
          business_id: string
          day_of_week: number
          start_time: string
          end_time: string
          regions: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          business_id: string
          day_of_week: number
          start_time: string
          end_time: string
          regions: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          business_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          regions?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
      staff_role: 'staff' | 'admin' | 'owner'
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]