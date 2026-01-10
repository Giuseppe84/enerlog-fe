'use client'

import { useAuth } from '@/context/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">You are not logged in.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="destructive" onClick={logout}>
          Logout
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card esempio: utente */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Name:</strong> {user?.name || '—'}</p>
          <p><strong>Email:</strong> {user?.email || '—'}</p>
        </Card>

        {/* Card esempio: statistiche placeholder */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Stats</h2>
          <p>Active tasks: 12</p>
          <p>Pending approvals: 5</p>
        </Card>

        {/* Card esempio: azioni rapide */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
          <Button className="mb-2 w-full">Create New Task</Button>
          <Button className="w-full">View Reports</Button>
        </Card>
      </div>
    </div>
  )
}