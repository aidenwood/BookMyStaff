import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://nmksjlhbpcunfsuyjusu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta3NqbGhicGN1bmZzdXlqdXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDI2NDksImV4cCI6MjA4MDkxODY0OX0.MSkMVVyx2rqOcgBNIoM2t0l-PSpK3eyyk6HS1q4KjVg'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Service role client for admin operations (server-side only)
// Note: Service role key should be set in production environment
export const supabaseAdmin = import.meta.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      supabaseUrl,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null