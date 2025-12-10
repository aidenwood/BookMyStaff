export interface User {
  id: string
  email: string
  name: string
  role: 'business_owner' | 'staff' | 'admin'
  businessId?: string
  avatar?: string
  phone?: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  businessName: string
  phone: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface PasswordReset {
  email: string
  code: string
  newPassword: string
}