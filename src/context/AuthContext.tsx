"use client"

import { useContext, useState, ReactNode, useEffect } from "react"
import { AuthContext } from "./AuthContextObject"
import { userAPI } from "@/api/user"

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // 🔁 Verifica sessione all'avvio (COOKIE)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await userAPI.getMe() // GET /auth/me
        setUser(res.data)
        console.log("authcontext User authenticated:", res.data)
        setIsAuthenticated(true)
      } catch (err) {
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // 🔐 Login → cookie già settato dal backend
  const login = async () => {
    await userAPI.addDevice()
    const res = await userAPI.getMe()
    console.log("Login successful, user data:", res)
    setUser(res)
    setIsAuthenticated(true)
  }

  // 🚪 Logout → cancella cookie lato server
  const logout = async () => {
    await userAPI.logout()
    setUser(null)
    setIsAuthenticated(false)
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

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}