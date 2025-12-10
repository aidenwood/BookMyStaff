import React, { useState, useRef } from 'react'
import { useAppStore } from '../../lib/store'
import { findRegionByPostcode } from '../../config/regions'
import type { RegionConfig } from '../../types/regions'

interface LocationInputProps {
  regions: RegionConfig[]
  onNext: () => void
  onBack: () => void
}

export default function LocationInput({ regions, onNext, onBack }: LocationInputProps) {
  const { customerBooking, updateCustomerBooking, setSelectedRegion } = useAppStore()
  const [address, setAddress] = useState(customerBooking.customerInfo.address || '')
  const [postcode, setPostcode] = useState(customerBooking.customerInfo.postcode || '')
  const [detectedRegion, setDetectedRegion] = useState<RegionConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const validateLocation = async () => {
    if (!address.trim() || !postcode.trim()) {
      setError('Please enter both address and postcode')
      return false
    }

    setIsValidating(true)
    setError(null)

    try {
      // Find region based on postcode
      const region = regions.find(r => 
        r.postcodes.includes(postcode.trim()) && r.isActive
      )

      if (!region) {
        setError(`Sorry, we don't service the ${postcode} area yet. Available regions: ${regions.map(r => r.name).join(', ')}`)
        setIsValidating(false)
        return false
      }

      setDetectedRegion(region)
      setIsValidating(false)
      return true
    } catch (error) {
      setError('Unable to validate location. Please check your address.')
      setIsValidating(false)
      return false
    }
  }

  const handleNext = async () => {
    const isValid = await validateLocation()
    if (!isValid) return

    // Update customer booking with address info
    updateCustomerBooking({
      customerInfo: {
        ...customerBooking.customerInfo,
        address: address.trim(),
        postcode: postcode.trim()
      }
    })

    // Set selected region for availability lookup
    if (detectedRegion) {
      setSelectedRegion(detectedRegion.id)
    }

    onNext()
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    setError(null)
    setDetectedRegion(null)
  }

  const handlePostcodeChange = (value: string) => {
    setPostcode(value)
    setError(null)
    setDetectedRegion(null)

    // Auto-detect region as user types
    if (value.length >= 4) {
      const region = regions.find(r => 
        r.postcodes.some(pc => pc.startsWith(value.trim())) && r.isActive
      )
      if (region) {
        setDetectedRegion(region)
      }
    }
  }

  // Sample addresses for demonstration
  const sampleAddresses = [
    { address: '123 Queen Street, Brisbane City', postcode: '4000', region: 'Brisbane North' },
    { address: '456 Logan Road, South Brisbane', postcode: '4101', region: 'Brisbane South' },
    { address: '789 Surfers Paradise Blvd, Surfers Paradise', postcode: '4217', region: 'Gold Coast' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Where should we come?
        </h2>
        <p className="text-gray-600 text-lg">
          Enter your address so we can find available staff in your area
        </p>
      </div>

      {/* Location Form */}
      <div className="card">
        <div className="card-body p-8">
          <div className="space-y-6">
            {/* Address Input */}
            <div className="form-group">
              <label className="form-label text-lg">
                Street Address *
              </label>
              <input
                ref={inputRef}
                type="text"
                className="form-input text-lg py-4"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="e.g., 123 Queen Street, Brisbane City"
                required
              />
            </div>

            {/* Postcode Input */}
            <div className="form-group">
              <label className="form-label text-lg">
                Postcode *
              </label>
              <input
                type="text"
                className="form-input text-lg py-4"
                value={postcode}
                onChange={(e) => handlePostcodeChange(e.target.value)}
                placeholder="e.g., 4000"
                maxLength={4}
                required
              />
            </div>

            {/* Region Detection */}
            {detectedRegion && !error && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: detectedRegion.color }}
                />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Great! We service your area
                  </p>
                  <p className="text-sm text-green-600">
                    Service Region: {detectedRegion.name}
                  </p>
                </div>
                <svg className="w-5 h-5 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Service Area Notice</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sample Addresses */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Example addresses in our service areas:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleAddresses.slice(0, 3).map((sample, index) => (
            <button
              key={index}
              onClick={() => {
                setAddress(sample.address)
                setPostcode(sample.postcode)
                handlePostcodeChange(sample.postcode)
              }}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{sample.address}</p>
              <p className="text-xs text-gray-500 mt-1">{sample.postcode} • {sample.region}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Service Areas Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Service Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {regions.map((region) => (
            <div key={region.id} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-sm text-gray-700">{region.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          onClick={onBack}
          className="btn btn-secondary btn-lg"
        >
          ← Back to Services
        </button>
        
        <button
          onClick={handleNext}
          disabled={!address || !postcode || isValidating}
          className="btn btn-primary btn-lg"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Checking...
            </>
          ) : (
            'Continue to Date & Time →'
          )}
        </button>
      </div>
    </div>
  )
}