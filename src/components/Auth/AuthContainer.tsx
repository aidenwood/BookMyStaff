import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

interface AuthContainerProps {
  initialMode?: 'login' | 'signup'
  redirectTo?: string
}

export default function AuthContainer({ 
  initialMode = 'login', 
  redirectTo = '/' 
}: AuthContainerProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="w-full">
      {mode === 'login' ? (
        <LoginForm 
          onToggleMode={toggleMode}
          redirectTo={redirectTo}
        />
      ) : (
        <SignupForm 
          onToggleMode={toggleMode}
          redirectTo={redirectTo}
        />
      )}
    </div>
  )
}