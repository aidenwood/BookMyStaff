import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../lib/store'
import ServiceSelection from './ServiceSelection'
import LocationInput from './LocationInput'
import DateTimeSelection from './DateTimeSelection'
import CustomerDetails from './CustomerDetails'
import BookingConfirmation from './BookingConfirmation'
import BookingProgress from './BookingProgress'
import type { Business } from '../../types/business'
import type { RegionConfig } from '../../types/regions'
import { supabase } from '../../lib/supabase'

interface BookingFlowProps {
  businessId: string
  businessData?: Business
  embedded?: boolean
  onComplete?: (bookingId: string) => void
}

export default function BookingFlow({ 
  businessId, 
  businessData, 
  embedded = false,
  onComplete 
}: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [business, setBusiness] = useState<Business | null>(businessData || null)
  const [regions, setRegions] = useState<RegionConfig[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(!businessData)
  const [error, setError] = useState<string | null>(null)

  const { customerBooking, updateCustomerBooking, resetCustomerBooking } = useAppStore()

  useEffect(() => {
    if (businessId && !businessData) {
      loadBusinessData()
    } else if (businessData) {
      loadRegionsAndServices()
    }
  }, [businessId, businessData])

  useEffect(() => {
    // Reset booking data when component mounts
    resetCustomerBooking()
  }, [])

  const loadBusinessData = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          regions (*),
          appointment_types (*)
        `)
        .eq('id', businessId)
        .single()

      if (error) throw error

      setBusiness({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        description: data.description,
        logo: data.logo,
        ownerId: data.owner_id,
        industry: {
          id: data.industry_id,
          name: data.industry_id,
          category: 'other' as any,
          defaultServices: [],
          fieldMapping: {}
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        settings: data.settings || {},
        integrations: data.integrations || {}
      })

      setRegions(data.regions.map((r: any) => ({
        id: r.id,
        businessId: r.business_id,
        name: r.name,
        color: r.color,
        postcodes: r.postcodes,
        isActive: r.is_active,
        description: r.description
      })))

      setAppointmentTypes(data.appointment_types.filter((t: any) => t.is_active))
    } catch (error) {
      console.error('Error loading business data:', error)
      setError('Unable to load booking information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRegionsAndServices = async () => {
    if (!businessData) return

    try {
      const [regionsResponse, servicesResponse] = await Promise.all([
        supabase
          .from('regions')
          .select('*')
          .eq('business_id', businessData.id)
          .eq('is_active', true),
        supabase
          .from('appointment_types')
          .select('*')
          .eq('business_id', businessData.id)
          .eq('is_active', true)
      ])

      if (regionsResponse.data) {
        setRegions(regionsResponse.data.map((r: any) => ({
          id: r.id,
          businessId: r.business_id,
          name: r.name,
          color: r.color,
          postcodes: r.postcodes,
          isActive: r.is_active,
          description: r.description
        })))
      }

      if (servicesResponse.data) {
        setAppointmentTypes(servicesResponse.data)
      }
    } catch (error) {
      console.error('Error loading regions and services:', error)
    }
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleStepClick = (step: number) => {
    // Only allow going back to previous steps
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            appointmentTypes={appointmentTypes}
            onNext={handleNext}
            businessName={business?.name || ''}
          />
        )
      case 2:
        return (
          <LocationInput
            regions={regions}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <DateTimeSelection
            businessId={businessId}
            regions={regions}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <CustomerDetails
            onNext={handleNext}
            onBack={handleBack}
            businessName={business?.name || ''}
          />
        )
      case 5:
        return (
          <BookingConfirmation
            businessId={businessId}
            businessData={business}
            onBack={handleBack}
            onComplete={onComplete}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-lightgray border-t-orange mx-auto mb-8"></div>
          <p className="text-2xl text-charcoal font-bold">Loading your booking experience</p>
          <p className="text-lg text-darkgray mt-3">This will just take a moment</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-lightgray rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-charcoal mb-4">Booking Unavailable</h2>
          <p className="text-lg text-darkgray mb-10 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-10 py-5 bg-orange hover:bg-orange/90 text-cream font-bold text-lg rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const containerClass = embedded 
    ? "max-w-2xl mx-auto"
    : "min-h-screen bg-cream"

  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="bg-cream">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-black text-charcoal leading-tight tracking-tight">
                  Book with {business?.name}
                </h1>
                <p className="text-lg text-darkgray mt-4 font-medium">
                  Schedule your appointment in just a few steps
                </p>
              </div>
              {business?.logo && (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="h-16 w-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-12">
        <BookingProgress
          currentStep={currentStep}
          totalSteps={5}
          onStepClick={handleStepClick}
        />

        <div className="mt-12 step-container">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}