'use client'

import { useEffect, useState, ReactNode } from 'react'
import { AuthContext, User } from './AuthContextObject'
import { userAPI } from '@/api/user'


export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isAuthenticated = !!user

  // 🔥 CHECK SESSIONE ALL’AVVIO (refresh / reload)
  useEffect(() => {
    const loadUser = async () => {
      try {
        //console.log('ddd');
        const res = await userAPI.getMe() // GET /auth/me
        setUser(res)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // 🔐 Login: il backend ha già settato il cookie
  const login = async () => {
    try {
      console.log('ddd')
      const res = await userAPI.getMe()
      setUser(res)
    } catch {
      setUser(null)
    }
  }

  // 🚪 Logout
  const logout = async () => {
    try {
      await  userAPI.logout()
    } catch {}
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}