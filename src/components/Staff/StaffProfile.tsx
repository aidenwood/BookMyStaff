import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Settings, Save } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuthStore } from '../../lib/authStore'

interface StaffProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  postcode: string
  dateOfBirth: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  qualifications: string[]
  skills: string[]
  hourlyRate: number
  availability: string
  bio: string
}

export default function StaffProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<StaffProfile>({
    id: user?.id || '',
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    postcode: '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    qualifications: [],
    skills: [],
    hourlyRate: 0,
    availability: 'Full-time',
    bio: ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newQualification, setNewQualification] = useState('')
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user?.id) return

    // Mock profile data - in real app, this would come from database
    const mockProfile = {
      ...profile,
      phone: '+61 400 123 456',
      address: '123 Main Street, Sydney NSW',
      postcode: '2000',
      dateOfBirth: '1990-01-15',
      emergencyContact: {
        name: 'Jane Smith',
        phone: '+61 400 987 654',
        relationship: 'Spouse'
      },
      qualifications: ['Licensed Technician', 'Safety Certificate', 'First Aid'],
      skills: ['Property Inspection', 'Maintenance', 'Customer Service'],
      hourlyRate: 45,
      availability: 'Full-time',
      bio: 'Experienced technician with 5+ years in property services. Committed to providing excellent customer service and maintaining high quality standards.'
    }

    setProfile(mockProfile)
  }

  const handleSave = async () => {
    setLoading(true)

    try {
      // In real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const addQualification = () => {
    if (newQualification.trim()) {
      setProfile(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }))
      setNewQualification('')
    }
  }

  const removeQualification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof StaffProfile],
          [child]: value
        }
      }))
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
          <p className="text-gray-600">Manage your personal information and professional details</p>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-gray-600 mb-2">{profile.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {profile.availability}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{profile.phone || 'Not set'}</span>
            </div>
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>{profile.address || 'Not set'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Born {profile.dateOfBirth || 'Not set'}</span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Hourly Rate</h4>
            <p className="text-2xl font-bold text-green-600">${profile.hourlyRate}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{profile.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{profile.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">${profile.hourlyRate}</p>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Emergency Contact</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.emergencyContact.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.emergencyContact.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.emergencyContact.relationship}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          
          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Tell us about yourself and your experience..."
              />
            ) : (
              <p className="text-gray-900">{profile.bio}</p>
            )}
          </div>

          {/* Qualifications */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
            
            <div className="space-y-2 mb-3">
              {profile.qualifications.map((qualification, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-900">{qualification}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeQualification(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="Add qualification..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addQualification()}
                />
                <Button onClick={addQualification} size="sm">
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            
            <div className="space-y-2 mb-3">
              {profile.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-900">{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}