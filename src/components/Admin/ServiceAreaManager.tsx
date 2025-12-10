import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Edit3, Trash2, Save, X, Palette } from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { useAuthStore } from '../../lib/authStore'
import { ServiceAreaService, type ServiceArea } from '../../lib/database/serviceAreas'

interface ServiceAreaForm {
  name: string
  description: string
  color: string
  postcodes: string[]
  isActive: boolean
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
]

export default function ServiceAreaManager() {
  const { user } = useAuthStore()
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [form, setForm] = useState<ServiceAreaForm>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
    postcodes: [],
    isActive: true
  })
  const [postcodeInput, setPostcodeInput] = useState('')

  const serviceAreaService = new ServiceAreaService()

  useEffect(() => {
    if (user?.businessId) {
      loadServiceAreas()
    }
  }, [user])

  const loadServiceAreas = async () => {
    try {
      setLoading(true)
      setError(null)

      const areas = await serviceAreaService.getServiceAreas(user!.businessId)
      setServiceAreas(areas)
    } catch (error) {
      console.error('Error loading service areas:', error)
      setError('Failed to load service areas')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      color: DEFAULT_COLORS[0],
      postcodes: [],
      isActive: true
    })
    setPostcodeInput('')
    setEditingArea(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  const openEditDialog = (area: ServiceArea) => {
    setForm({
      name: area.name,
      description: area.description || '',
      color: area.color,
      postcodes: area.postcodes,
      isActive: area.isActive
    })
    setPostcodeInput(area.postcodes.join(', '))
    setEditingArea(area)
    setShowCreateDialog(true)
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!form.name.trim()) {
        throw new Error('Service area name is required')
      }

      // Parse postcodes
      const postcodes = postcodeInput
        .split(',')
        .map(pc => pc.trim().toUpperCase())
        .filter(pc => pc.length > 0)

      const areaData = {
        ...form,
        name: form.name.trim(),
        postcodes
      }

      if (editingArea) {
        // Update existing area
        await serviceAreaService.updateServiceArea(editingArea.id, areaData)
        
        // Update local state
        setServiceAreas(prev => prev.map(area => 
          area.id === editingArea.id 
            ? { ...area, ...areaData, updatedAt: new Date().toISOString() }
            : area
        ))
      } else {
        // Create new area
        const areaId = await serviceAreaService.createServiceArea({
          ...areaData,
          businessId: user!.businessId
        })
        
        // Add to local state
        const newArea: ServiceArea = {
          ...areaData,
          id: areaId,
          businessId: user!.businessId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setServiceAreas(prev => [...prev, newArea])
      }

      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving service area:', error)
      setError(error instanceof Error ? error.message : 'Failed to save service area')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (area: ServiceArea) => {
    if (!confirm(`Are you sure you want to delete "${area.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      await serviceAreaService.deleteServiceArea(area.id)
      
      // Remove from local state
      setServiceAreas(prev => prev.filter(a => a.id !== area.id))
    } catch (error) {
      console.error('Error deleting service area:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete service area')
    } finally {
      setSaving(false)
    }
  }

  const toggleAreaStatus = async (area: ServiceArea) => {
    try {
      setSaving(true)
      setError(null)

      const newStatus = !area.isActive
      await serviceAreaService.updateServiceArea(area.id, { isActive: newStatus })
      
      // Update local state
      setServiceAreas(prev => prev.map(a => 
        a.id === area.id 
          ? { ...a, isActive: newStatus, updatedAt: new Date().toISOString() }
          : a
      ))
    } catch (error) {
      console.error('Error updating service area status:', error)
      setError('Failed to update service area status')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Areas</h2>
          <p className="text-gray-600">Manage the areas where your staff can work</p>
        </div>
        
        <Button onClick={openCreateDialog} disabled={saving}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service Area
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Service Areas List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {serviceAreas.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Areas</h3>
            <p className="text-gray-600 mb-4">
              Create service areas to organize where your staff can work.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Service Area
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {serviceAreas.map(area => (
              <div key={area.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: area.color }}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          area.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {area.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {area.description && (
                        <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                      )}
                      
                      {area.postcodes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Postcodes:</p>
                          <div className="flex flex-wrap gap-1">
                            {area.postcodes.map(postcode => (
                              <span
                                key={postcode}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {postcode}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2">
                        Created {new Date(area.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAreaStatus(area)}
                      disabled={saving}
                    >
                      {area.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(area)}
                      disabled={saving}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(area)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingArea ? 'Edit Service Area' : 'Create Service Area'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. North Sydney, City Center"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      form.color === color 
                        ? 'border-gray-800' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Postcodes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcodes
              </label>
              <input
                type="text"
                value={postcodeInput}
                onChange={(e) => setPostcodeInput(e.target.value)}
                placeholder="e.g. 2000, 2001, 2002"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple postcodes with commas
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (staff can be assigned to this area)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingArea ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}