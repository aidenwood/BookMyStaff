import React, { useEffect, ReactNode } from 'react'
import { useAuthStore } from '../../lib/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'business_owner' | 'staff' | 'admin'
  redirectTo?: string
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/login',
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    const currentPath = window.location.pathname + window.location.search
    const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
    window.location.href = loginUrl
    return null
  }

  // Check role permissions
  if (requiredRole) {
    const hasPermission = user.role === requiredRole || user.role === 'admin' || user.role === 'business_owner'
    
    if (!hasPermission) {
      return (
        fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn btn-secondary"
              >
                Go Back
              </button>
            </div>
          </div>
        )
      )
    }
  }

  return <>{children}</>
}

// Hook for checking authentication status
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`
    }
  }, [isAuthenticated, isLoading])

  return { user, isAuthenticated, isLoading }
}

// Component for staff-only routes
export function StaffRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="staff" {...props}>
      {children}
    </ProtectedRoute>
  )
}

// Component for business owner routes
export function OwnerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="business_owner" {...props}>
      {children}
    </ProtectedRoute>
  )
}

// Component for admin routes
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" {...props}>
      {children}
    </ProtectedRoute>
  )
}