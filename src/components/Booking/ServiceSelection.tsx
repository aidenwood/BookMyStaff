import React from 'react'
import { useAppStore } from '../../lib/store'
import type { AppointmentType } from '../../types/appointment'

interface ServiceSelectionProps {
  appointmentTypes: AppointmentType[]
  onNext: () => void
  businessName: string
}

export default function ServiceSelection({ 
  appointmentTypes, 
  onNext, 
  businessName 
}: ServiceSelectionProps) {
  const { customerBooking, updateCustomerBooking } = useAppStore()

  const handleServiceSelect = (service: AppointmentType) => {
    updateCustomerBooking({
      appointmentType: service,
      duration: service.duration
    })
    onNext()
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for pricing'
    return `$${price.toFixed(0)}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-charcoal mb-4 tracking-tight">
          Choose Your Service
        </h2>
        <p className="text-xl text-darkgray font-medium">
          Select the service you'd like to book with {businessName}
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {appointmentTypes.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className="bg-lightgray/30 rounded-3xl p-8 hover:bg-lightgray/50 transition-all duration-300 cursor-pointer group hover:-translate-y-2 border-2 border-transparent hover:border-orange/20 hover:shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <div className="w-8 h-8 bg-orange rounded-xl"></div>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-black text-charcoal">
                  {formatPrice(service.price)}
                </p>
                <p className="text-base text-darkgray font-medium">
                  {formatDuration(service.duration)}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-black text-charcoal mb-3 group-hover:text-orange transition-colors">
              {service.name}
            </h3>
            
            {service.description && (
              <p className="text-darkgray text-base mb-6 leading-relaxed">
                {service.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center text-base text-darkgray font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(service.duration)}
              </div>
              
              <div className="flex items-center text-orange group-hover:text-orange/80 transition-colors">
                <span className="text-base font-bold mr-2">Book now</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {appointmentTypes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-lightgray rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-darkgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-charcoal mb-3">
            No Services Available
          </h3>
          <p className="text-lg text-darkgray">
            This business hasn't set up their services yet. Please contact them directly.
          </p>
        </div>
      )}

      {/* Quick Info Banner */}
      {appointmentTypes.length > 0 && (
        <div className="mt-12 bg-lightgray/20 rounded-3xl p-8 border border-lightgray/30">
          <div className="flex items-center justify-center">
            <div className="flex items-center text-center">
              <svg className="w-10 h-10 text-orange mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-charcoal">Easy Booking Process</h4>
                <p className="text-base text-darkgray mt-2">Choose your service → Enter location → Pick date & time → Confirm details</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}