import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'
import type { User, AuthState, LoginCredentials, RegisterData } from '../types/auth'
import type { Provider } from '@supabase/supabase-js'

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  loginWithOAuth: (provider: Provider) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  clearError: () => void
  error: string | null
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: null,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (error) {
            set({ 
              error: error.message,
              isLoading: false 
            })
            return false
          }

          if (data.user) {
            const userProfile = await get().fetchUserProfile(data.user.id)
            set({ 
              user: userProfile, 
              token: data.session?.access_token || null,
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            })
            return true
          }

          return false
        } catch (error) {
          set({ 
            error: 'Login failed. Please try again.',
            isLoading: false 
          })
          return false
        }
      },

      loginWithOAuth: async (provider: Provider) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })

          if (error) {
            set({ 
              error: error.message,
              isLoading: false 
            })
            return false
          }

          // OAuth redirects, so we don't set state here
          // State will be set in the callback
          return true
        } catch (error) {
          set({ 
            error: 'OAuth login failed. Please try again.',
            isLoading: false 
          })
          return false
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                name: data.name,
                business_name: data.businessName,
                phone: data.phone
              }
            }
          })

          if (error) {
            set({ 
              error: error.message,
              isLoading: false 
            })
            return false
          }

          if (authData.user) {
            // Create user profile and business
            await get().createUserProfile(authData.user.id, data)
            
            const userProfile = await get().fetchUserProfile(authData.user.id)
            set({ 
              user: userProfile, 
              token: authData.session?.access_token || null,
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            })
            return true
          }

          return false
        } catch (error) {
          set({ 
            error: 'Registration failed. Please try again.',
            isLoading: false 
          })
          return false
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        })
      },

      checkAuth: async () => {
        try {
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            set({ isLoading: false })
            return
          }

          if (data.session?.user) {
            const userProfile = await get().fetchUserProfile(data.session.user.id)
            set({ 
              user: userProfile, 
              token: data.session.access_token,
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            })
          } else {
            set({ 
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false 
            })
          }
        } catch (error) {
          set({ 
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
          })
          return !error
        } catch {
          return false
        }
      },

      updatePassword: async (password: string) => {
        try {
          const { error } = await supabase.auth.updateUser({ password })
          return !error
        } catch {
          return false
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },

      clearError: () => set({ error: null }),

      // Helper functions
      fetchUserProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('staff_members')
            .select(`
              *,
              businesses (*)
            `)
            .eq('user_id', userId)
            .single()

          if (error || !data) {
            // User might not have a staff profile yet, create a basic user object
            const { data: authUser } = await supabase.auth.getUser()
            return {
              id: userId,
              email: authUser.user?.email || '',
              name: authUser.user?.user_metadata?.name || '',
              role: 'business_owner' as const,
              isActive: true,
              createdAt: new Date().toISOString()
            }
          }

          return {
            id: data.user_id,
            email: data.email,
            name: data.name,
            role: data.role as any,
            businessId: data.business_id,
            avatar: data.avatar,
            phone: data.phone,
            isActive: data.is_active,
            createdAt: data.created_at
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          return null
        }
      },

      createUserProfile: async (userId: string, userData: RegisterData) => {
        try {
          // Create user profile first
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: userData.email
            })

          if (userError) throw userError

          // Create business
          const { data: business, error: businessError } = await supabase
            .from('businesses')
            .insert({
              name: userData.businessName,
              email: userData.email,
              phone: userData.phone,
              owner_id: userId
            })
            .select()
            .single()

          if (businessError) throw businessError

          // Create staff member profile
          const { error: profileError } = await supabase
            .from('staff_members')
            .insert({
              user_id: userId,
              business_id: business.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: 'owner'
            })

          if (profileError) throw profileError
        } catch (error) {
          console.error('Error creating user profile:', error)
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Auth listener for real-time updates
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session) {
    store.fetchUserProfile(session.user.id).then((user) => {
      if (user) {
        useAuthStore.setState({
          user,
          token: session.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      }
    })
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }
})