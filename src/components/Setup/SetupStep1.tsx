import React, { useState } from 'react'
import { useAppStore } from '../../lib/store'
import { BUSINESS_INDUSTRIES, type BusinessIndustry } from '../../types/business'

export default function SetupStep1() {
  const { businessSetup, updateBusinessSetup, setBusinessSetupStep } = useAppStore()
  const [formData, setFormData] = useState({
    businessName: businessSetup.businessInfo?.name || '',
    ownerName: businessSetup.businessInfo?.email || '', // Using email field for owner name temporarily
    email: businessSetup.businessInfo?.email || '',
    phone: businessSetup.businessInfo?.phone || '',
    website: businessSetup.businessInfo?.website || '',
    description: businessSetup.businessInfo?.description || ''
  })
  
  const [selectedIndustry, setSelectedIndustry] = useState<BusinessIndustry | null>(
    businessSetup.selectedIndustry
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleIndustrySelect = (industry: BusinessIndustry) => {
    setSelectedIndustry(industry)
  }

  const handleNext = () => {
    if (!selectedIndustry || !formData.businessName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields and select an industry')
      return
    }

    updateBusinessSetup({
      selectedIndustry,
      businessInfo: {
        ...businessSetup.businessInfo,
        name: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        industry: selectedIndustry
      }
    })

    setBusinessSetupStep(2)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your business
        </h2>
        <p className="text-gray-600">
          Help us customize BookMyStaff for your industry and business needs
        </p>
      </div>

      {/* Industry Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What industry are you in?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUSINESS_INDUSTRIES.map((industry) => (
            <div
              key={industry.id}
              onClick={() => handleIndustrySelect(industry)}
              className={`card cursor-pointer transition-all duration-200 ${
                selectedIndustry?.id === industry.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:shadow-medium'
              }`}
            >
              <div className="card-body p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {industry.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {industry.defaultServices.slice(0, 2).join(', ')}
                  {industry.defaultServices.length > 2 && '...'}
                </p>
                <div className="text-xs text-primary-600 font-medium">
                  {selectedIndustry?.id === industry.id ? 'Selected' : 'Select'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Information Form */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Business Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              Business Name *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Your business name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Owner Name *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="business@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+61 XXX XXX XXX"
              required
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">
              Website (Optional)
            </label>
            <input
              type="url"
              className="form-input"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourbusiness.com"
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">
              Business Description (Optional)
            </label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell us about your business and what services you provide..."
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <div></div>
        <button
          onClick={handleNext}
          className="btn btn-primary btn-lg"
          disabled={!selectedIndustry || !formData.businessName || !formData.email || !formData.phone}
        >
          Continue to Regions →
        </button>
      </div>
    </div>
  )
}