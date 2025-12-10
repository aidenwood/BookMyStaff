import React, { useState } from 'react'
import { useAppStore } from '../../lib/store'
import { DEFAULT_REGIONS, type RegionConfig } from '../../types/regions'

export default function SetupStep2() {
  const { businessSetup, updateBusinessSetup, setBusinessSetupStep } = useAppStore()
  const [selectedRegions, setSelectedRegions] = useState<RegionConfig[]>(
    businessSetup.regions || []
  )
  const [customRegion, setCustomRegion] = useState({
    name: '',
    postcodes: '',
    color: '#4ECDC4'
  })
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleRegionToggle = (region: RegionConfig) => {
    const isSelected = selectedRegions.find(r => r.id === region.id)
    if (isSelected) {
      setSelectedRegions(prev => prev.filter(r => r.id !== region.id))
    } else {
      setSelectedRegions(prev => [...prev, region])
    }
  }

  const handleCustomRegionAdd = () => {
    if (!customRegion.name || !customRegion.postcodes) {
      alert('Please fill in region name and postcodes')
      return
    }

    const newRegion: RegionConfig = {
      id: `custom_${Date.now()}`,
      businessId: 'temp',
      name: customRegion.name,
      color: customRegion.color,
      postcodes: customRegion.postcodes.split(',').map(p => p.trim()),
      isActive: true,
      description: `Custom region: ${customRegion.name}`
    }

    setSelectedRegions(prev => [...prev, newRegion])
    setCustomRegion({ name: '', postcodes: '', color: '#4ECDC4' })
    setShowCustomForm(false)
  }

  const handleNext = () => {
    if (selectedRegions.length === 0) {
      alert('Please select at least one service region')
      return
    }

    updateBusinessSetup({
      regions: selectedRegions
    })

    setBusinessSetupStep(3)
  }

  const handleBack = () => {
    setBusinessSetupStep(1)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Define Your Service Areas
        </h2>
        <p className="text-gray-600">
          Select the regions where your staff will provide services. This helps optimize scheduling and reduces travel time.
        </p>
      </div>

      {/* Available Regions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Regions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_REGIONS.map((region, index) => {
            const regionWithId = { ...region, id: `region_${index}`, businessId: 'temp' }
            const isSelected = selectedRegions.find(r => r.id === regionWithId.id)
            
            return (
              <div
                key={regionWithId.id}
                onClick={() => handleRegionToggle(regionWithId)}
                className={`card cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'hover:shadow-medium'
                }`}
              >
                <div className="card-body p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {region.name}
                    </h4>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: region.color }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {region.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {region.postcodes.slice(0, 3).map((postcode) => (
                      <span
                        key={postcode}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {postcode}
                      </span>
                    ))}
                    {region.postcodes.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{region.postcodes.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium">
                    {isSelected ? (
                      <span className="text-primary-600">✓ Selected</span>
                    ) : (
                      <span className="text-gray-400">Click to select</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Region Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Custom Region
          </h3>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="btn btn-secondary btn-sm"
          >
            {showCustomForm ? 'Cancel' : '+ Add Custom Region'}
          </button>
        </div>

        {showCustomForm && (
          <div className="card">
            <div className="card-body p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Region Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customRegion.name}
                    onChange={(e) => setCustomRegion(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Western Suburbs"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="color"
                    className="form-input h-12"
                    value={customRegion.color}
                    onChange={(e) => setCustomRegion(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Postcodes (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customRegion.postcodes}
                    onChange={(e) => setCustomRegion(prev => ({ ...prev, postcodes: e.target.value }))}
                    placeholder="e.g., 4000, 4001, 4006"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple postcodes with commas
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <button
                    onClick={handleCustomRegionAdd}
                    className="btn btn-primary btn-sm"
                  >
                    Add Region
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Regions Summary */}
      {selectedRegions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Regions ({selectedRegions.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((region) => (
              <div
                key={region.id}
                className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <span className="text-sm font-medium text-primary-800">
                  {region.name}
                </span>
                <button
                  onClick={() => handleRegionToggle(region)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          onClick={handleBack}
          className="btn btn-secondary btn-lg"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="btn btn-primary btn-lg"
          disabled={selectedRegions.length === 0}
        >
          Continue to Services →
        </button>
      </div>
    </div>
  )
}