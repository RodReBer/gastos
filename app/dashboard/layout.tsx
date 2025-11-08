"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Sidebar } from "@/components/layout/sidebar"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNav />
          <main className="flex-1 overflow-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
