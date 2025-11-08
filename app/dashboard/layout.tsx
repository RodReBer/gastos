"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Sidebar } from "@/components/layout/sidebar"
import type { ReactNode } from "react"
import { useState } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNav onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto">
            <div className="p-0 md:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
