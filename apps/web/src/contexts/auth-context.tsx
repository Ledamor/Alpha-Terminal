import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token on mount
    const storedToken = localStorage.getItem('alpha_token')
    if (storedToken) {
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('alpha_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('alpha_token')
    setToken(null)
  }

  if (isLoading) {
    return null // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
