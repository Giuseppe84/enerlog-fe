'use client'

import { useContext, useState, ReactNode, useEffect } from 'react'
import { AuthContext, AuthContextType, User } from './AuthContextObject'
import { settingsAPI } from '@/api/settings'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Controlla token memorizzato all'avvio
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
      // Qui puoi fetchare i dati dell'utente dal backend usando il token
      fetchUserData(storedToken)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch user')
      const data: User = await res.json()
      setUser(data)
    } catch (err) {
      console.error(err)
      logout()
    }
  }

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setIsAuthenticated(true)
    await settingsAPI.addDevice() // come nel tuo vecchio progetto
    await fetchUserData(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}