import { supabase } from '../supabase'
import type { Business, BusinessIntegrations, BusinessSetupData } from '../../types/business'
import type { Database } from '../../types/database'

type BusinessRow = Database['public']['Tables']['businesses']['Row']
type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export class BusinessService {
  async createBusiness(businessData: BusinessSetupData): Promise<Business | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const businessInsert: BusinessInsert = {
        name: businessData.businessInfo.name!,
        email: businessData.businessInfo.email!,
        phone: businessData.businessInfo.phone!,
        address: businessData.businessInfo.address,
        website: businessData.businessInfo.website,
        description: businessData.businessInfo.description,
        owner_id: user.user.id,
        industry_id: businessData.selectedIndustry?.id || 'other',
        settings: businessData.businessInfo.settings || {},
        integrations: businessData.integrations || {}
      }

      const { data, error } = await supabase
        .from('businesses')
        .insert(businessInsert)
        .select()
        .single()

      if (error) throw error

      // Create regions
      if (businessData.regions.length > 0) {
        const regionInserts = businessData.regions.map(region => ({
          business_id: data.id,
          name: region.name,
          color: region.color,
          postcodes: region.postcodes,
          description: region.description,
          is_active: region.isActive
        }))

        await supabase.from('regions').insert(regionInserts)
      }

      // Create appointment types
      if (businessData.services.length > 0) {
        const serviceInserts = businessData.services.map(service => ({
          business_id: data.id,
          name: service.name,
          duration: service.duration,
          price: service.price,
          description: service.description,
          color: service.color,
          is_active: service.isActive
        }))

        await supabase.from('appointment_types').insert(serviceInserts)
      }

      return this.mapRowToBusiness(data)
    } catch (error) {
      console.error('Error creating business:', error)
      return null
    }
  }

  async getBusinessById(id: string): Promise<Business | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          regions (*),
          appointment_types (*),
          staff_members (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return this.mapRowToBusiness(data)
    } catch (error) {
      console.error('Error fetching business:', error)
      return null
    }
  }

  async getCurrentUserBusiness(): Promise<Business | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return null

      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          regions (*),
          appointment_types (*),
          staff_members (*)
        `)
        .eq('owner_id', user.user.id)
        .single()

      if (error) throw error
      return this.mapRowToBusiness(data)
    } catch (error) {
      console.error('Error fetching current user business:', error)
      return null
    }
  }

  async updateBusiness(id: string, updates: Partial<BusinessUpdate>): Promise<Business | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return this.mapRowToBusiness(data)
    } catch (error) {
      console.error('Error updating business:', error)
      return null
    }
  }

  async updateBusinessIntegrations(id: string, integrations: BusinessIntegrations): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ integrations })
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Error updating business integrations:', error)
      return false
    }
  }

  async getBusinessSettings(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('settings')
        .eq('id', id)
        .single()

      if (error) throw error
      return data.settings
    } catch (error) {
      console.error('Error fetching business settings:', error)
      return null
    }
  }

  async updateBusinessSettings(id: string, settings: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ settings })
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Error updating business settings:', error)
      return false
    }
  }

  private mapRowToBusiness(row: any): Business {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      website: row.website,
      description: row.description,
      logo: row.logo,
      ownerId: row.owner_id,
      industry: {
        id: row.industry_id,
        name: row.industry_id, // This would need to be mapped from a lookup table
        category: 'other' as any,
        defaultServices: [],
        fieldMapping: {}
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      settings: row.settings || {},
      integrations: row.integrations || {}
    }
  }

  // Real-time subscriptions
  subscribeToBusinessChanges(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`business_${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'businesses',
        filter: `id=eq.${businessId}`
      }, callback)
      .subscribe()
  }

  subscribeToBusinessBookings(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`bookings_${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `business_id=eq.${businessId}`
      }, callback)
      .subscribe()
  }
}