import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DatabaseTest() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testTables = async () => {
    setLoading(true)
    const tests = {
      users: null,
      businesses: null,
      staff_members: null,
      auth_user: null
    }

    try {
      // Test public.users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      tests.users = { data: users, error: usersError?.message }

      // Test businesses table
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select('*')
        .limit(1)
      tests.businesses = { data: businesses, error: businessesError?.message }

      // Test staff_members table
      const { data: staff, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .limit(1)
      tests.staff_members = { data: staff, error: staffError?.message }

      // Test auth user
      const { data: authData, error: authError } = await supabase.auth.getUser()
      tests.auth_user = { data: authData, error: authError?.message }

    } catch (error) {
      console.error('Database test error:', error)
    }

    setResults(tests)
    setLoading(false)
  }

  const testRegistration = async () => {
    setLoading(true)
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = 'testpass123'
      
      console.log('Testing registration with:', testEmail)
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User',
            business_name: 'Test Business',
            phone: '+61 400 000 000'
          }
        }
      })

      setResults({
        registration_test: {
          data,
          error: error?.message,
          user_id: data?.user?.id
        }
      })
    } catch (error) {
      setResults({
        registration_test: {
          error: error.message
        }
      })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Database Testing</h3>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={testTables}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Table Access'}
        </button>
        
        <button
          onClick={testRegistration}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <h4 className="font-medium">Results:</h4>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}