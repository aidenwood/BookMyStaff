import React, { useState, useEffect } from 'react'
import { User, Settings, Plus, Clock, LogOut, Menu, X } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuthStore } from '../../lib/authStore'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-sm relative z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BookMyStaff</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="/demo" className="text-gray-600 hover:text-gray-900 transition-colors">
              Demo
            </a>

            {/* Authentication UI */}
            {isLoading ? (
              <div className="animate-pulse flex space-x-2">
                <div className="h-9 w-16 bg-gray-200 rounded"></div>
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              /* Logged In State */
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Logged Out State */
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/auth?mode=login'}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth?mode=signup'}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <a href="/features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="/pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="/demo" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Demo
              </a>
              
              {!isLoading && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-3 py-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.first_name || user.email?.split('@')[0]}
                          </span>
                        </div>
                      </div>
                      <a href="/dashboard" className="block px-3 py-2 text-primary-600 font-medium">
                        Dashboard
                      </a>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <a href="/auth?mode=login" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        Sign In
                      </a>
                      <a href="/auth?mode=signup" className="block px-3 py-2 bg-primary-600 text-white rounded-lg text-center font-medium">
                        Get Started
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Admin Quick Actions Bar - Only show for logged-in admin/business owners */}
      {user && (user.user_metadata?.role === 'business_owner' || user.user_metadata?.role === 'admin') && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-primary-800">Quick Actions</h3>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.location.href = '/staff/schedule'}
                  className="flex items-center space-x-2 text-sm text-primary-700 hover:text-primary-800 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>Manage Shifts</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/settings/business'}
                  className="flex items-center space-x-2 text-sm text-primary-700 hover:text-primary-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Business Settings</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/staff/add'}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}