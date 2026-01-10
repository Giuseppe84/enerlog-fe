"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, router])

  // Mostra null o loader mentre controlla l'autenticazione
  if (!isAuthenticated) return null

  return (
    <div className="flex">
      {/* sidebar, navbar, ecc */}
      {children}
    </div>
  )
}