import React, { useState, useEffect } from 'react'
import AvailabilityCalendar from './AvailabilityCalendar'
import StaffLayout from './StaffLayout'
import { useAuthStore } from '../../lib/authStore'
import { supabase } from '../../lib/supabase'
import type { RegionConfig } from '../../types/regions'
import type { AvailabilitySlot } from '../../types/appointment'

export default function AvailabilityPage() {
  const { user } = useAuthStore()
  const [regions, setRegions] = useState<RegionConfig[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSlots: 0,
    thisWeek: 0,
    nextWeek: 0,
    regionsActive: 0
  })

  useEffect(() => {
    if (user?.businessId) {
      loadRegions()
    }
  }, [user])

  useEffect(() => {
    calculateStats()
  }, [availability])

  const loadRegions = async () => {
    if (!user?.businessId) return

    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('business_id', user.businessId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      
      setRegions(data.map(row => ({
        id: row.id,
        businessId: row.business_id,
        name: row.name,
        color: row.color,
        postcodes: row.postcodes,
        isActive: row.is_active,
        description: row.description
      })))
    } catch (error) {
      console.error('Error loading regions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    if (availability.length === 0) {
      setStats({ totalSlots: 0, thisWeek: 0, nextWeek: 0, regionsActive: 0 })
      return
    }

    const now = new Date()
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - now.getDay())
    
    const startOfNextWeek = new Date(startOfThisWeek)
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7)
    
    const endOfNextWeek = new Date(startOfNextWeek)
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)

    const thisWeekSlots = availability.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate >= startOfThisWeek && slotDate < startOfNextWeek
    })

    const nextWeekSlots = availability.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate >= startOfNextWeek && slotDate <= endOfNextWeek
    })

    const activeRegions = new Set(availability.map(slot => slot.region))

    setStats({
      totalSlots: availability.length,
      thisWeek: thisWeekSlots.length,
      nextWeek: nextWeekSlots.length,
      regionsActive: activeRegions.size
    })
  }

  const handleAvailabilityChange = (newAvailability: AvailabilitySlot[]) => {
    setAvailability(newAvailability)
  }

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
          <p className="text-gray-600 mt-1">
            Set your availability across different regions to receive bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Slots</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalSlots}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.thisWeek}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Next Week</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.nextWeek}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Regions</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.regionsActive}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="card">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold mb-4">📝 Quick Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900 mb-2">Setting Individual Days:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use Calendar View to set specific dates</li>
                  <li>Select multiple dates by clicking</li>
                  <li>Choose your region and time range</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">Creating Weekly Patterns:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use Recurring Patterns to set weekly schedules</li>
                  <li>Set different times for each day</li>
                  <li>Generate 30 days from your patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Calendar */}
        {regions.length > 0 ? (
          <AvailabilityCalendar
            regions={regions}
            onAvailabilityChange={handleAvailabilityChange}
          />
        ) : (
          <div className="card">
            <div className="card-body p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Regions Configured</h3>
              <p className="text-gray-600 mb-6">
                Your business needs to set up service regions before you can manage availability.
              </p>
              <button
                onClick={() => window.location.href = '/business/regions'}
                className="btn btn-primary"
              >
                Contact Business Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  )
}