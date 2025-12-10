# PR V2.4: Staff Authentication & Portal Base

**Branch**: `feature/v2-staff-auth`  
**Base**: `feature/v2-core-infrastructure`  
**Estimated Time**: 3-4 days

## Summary
Implement authentication system and base infrastructure for the staff portal, including protected routes and role-based access control.

## Changes

### 1. Authentication Dependencies
**File**: `package.json`
```json
{
  "dependencies": {
    "@auth0/auth0-react": "^2.2.4",
    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

### 2. Authentication Store
**New File**: `src/lib/authStore.ts`
```typescript
import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'staff' | 'admin'
  regions: string[]
  avatar?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const { user, token } = await response.json()
        localStorage.setItem('staffToken', token)
        set({ user, isAuthenticated: true, isLoading: false })
        return true
      } else {
        set({ isLoading: false })
        return false
      }
    } catch (error) {
      set({ isLoading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('staffToken')
    set({ user: null, isAuthenticated: false })
    window.location.href = '/staff/login'
  },

  checkAuth: async () => {
    const token = localStorage.getItem('staffToken')
    if (!token) {
      set({ isLoading: false })
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const user = await response.json()
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        localStorage.removeItem('staffToken')
        set({ isLoading: false })
      }
    } catch (error) {
      localStorage.removeItem('staffToken')
      set({ isLoading: false })
    }
  },

  updateUser: (updates) => {
    const currentUser = get().user
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } })
    }
  }
}))
```

### 3. Authentication API Routes
**New File**: `src/pages/api/auth/login.ts`
```typescript
import type { APIRoute } from 'astro'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock staff database - replace with real database
const STAFF_USERS = [
  {
    id: '1',
    email: 'inspector1@rebuildrelief.com.au',
    password: '$2a$10$...',  // bcrypt hashed password
    name: 'John Smith',
    role: 'staff',
    regions: ['Brisbane North', 'Brisbane South']
  },
  {
    id: '2',
    email: 'admin@rebuildrelief.com.au',
    password: '$2a$10$...',
    name: 'Admin User',
    role: 'admin',
    regions: ['All Regions']
  }
]

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json()

    const user = STAFF_USERS.find(u => u.email === email)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    return new Response(JSON.stringify({ 
      user: userWithoutPassword, 
      token 
    }))
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Login failed' }), { status: 500 })
  }
}
```

**New File**: `src/pages/api/auth/verify.ts`
```typescript
import type { APIRoute } from 'astro'
import jwt from 'jsonwebtoken'

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any

    const user = STAFF_USERS.find(u => u.id === decoded.userId)
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user
    return new Response(JSON.stringify(userWithoutPassword))
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
  }
}
```

### 4. Staff Login Page
**New File**: `src/pages/staff/login.astro`
```astro
---
// Astro component for staff login page
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staff Login - Rebuild Relief</title>
  <link rel="stylesheet" href="/styles/staff.css">
</head>
<body>
  <div id="staff-login-root"></div>
  <script type="module">
    import { createRoot } from 'react-dom/client'
    import StaffLogin from '../../components/Staff/StaffLogin.tsx'
    
    const root = createRoot(document.getElementById('staff-login-root'))
    root.render(<StaffLogin />)
  </script>
</body>
</html>
```

### 5. Staff Login Component
**New File**: `src/components/Staff/StaffLogin.tsx`
```typescript
import { useState } from 'react'
import { useAuthStore } from '../../lib/authStore'

export default function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = await login(email, password)
    
    if (success) {
      window.location.href = '/staff/dashboard'
    } else {
      setError('Invalid email or password')
    }
    
    setLoading(false)
  }

  return (
    <div className="staff-login-container">
      <div className="login-card">
        <div className="company-logo">
          <h1>Rebuild Relief</h1>
          <p>Staff Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@rebuildrelief.com.au"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/staff/forgot-password">Forgot your password?</a>
        </div>
      </div>
    </div>
  )
}
```

### 6. Protected Route Component
**New File**: `src/components/Staff/ProtectedRoute.tsx`
```typescript
import { useEffect } from 'react'
import { useAuthStore } from '../../lib/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'staff' | 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    window.location.href = '/staff/login'
    return null
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  return <>{children}</>
}
```

### 7. Staff Dashboard Layout
**New File**: `src/components/Staff/StaffLayout.tsx`
```typescript
import { useAuthStore } from '../../lib/authStore'

interface StaffLayoutProps {
  children: React.ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, logout } = useAuthStore()

  return (
    <div className="staff-layout">
      <nav className="staff-nav">
        <div className="nav-brand">
          <h2>Rebuild Relief Staff</h2>
        </div>
        <div className="nav-links">
          <a href="/staff/dashboard">Dashboard</a>
          <a href="/staff/availability">My Availability</a>
          <a href="/staff/bookings">My Bookings</a>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <main className="staff-content">
        {children}
      </main>
    </div>
  )
}
```

### 8. Staff Portal Styling
**New File**: `src/styles/staff.css`
```css
.staff-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.company-logo {
  text-align: center;
  margin-bottom: 30px;
}

.company-logo h1 {
  color: #333;
  margin-bottom: 5px;
}

.login-form .form-group {
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.login-form input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.login-form input:focus {
  outline: none;
  border-color: #4ECDC4;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: #4ECDC4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover {
  background: #45B7D1;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.staff-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.staff-nav {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 15px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #4ECDC4;
}

.staff-content {
  flex: 1;
  padding: 30px;
  background: #f8f9fa;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4ECDC4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Testing
- [ ] Staff login functionality works
- [ ] JWT token authentication secure
- [ ] Protected routes redirect unauthorized users
- [ ] User roles and permissions enforced
- [ ] Session management works correctly
- [ ] Responsive design on mobile devices

## Security Considerations
- [ ] Passwords properly hashed with bcrypt
- [ ] JWT tokens have reasonable expiration
- [ ] API routes validate authentication headers
- [ ] No sensitive data exposed in client-side code
- [ ] CORS policies configured correctly

## Next Steps
- Move to PR V2.5: Staff Availability Management
- Implement calendar-based availability setting