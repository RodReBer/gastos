"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, CreditCard, BarChart3, Settings, X } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FileText },
  { href: "/dashboard/invoices", label: "Facturas", icon: FileText },
  { href: "/dashboard/payments", label: "Pagos", icon: CreditCard },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Close button for mobile */}
        <div className="md:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-slate-800"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg md:text-xl font-bold">Gestor de Gastos</h1>
          <p className="text-xs text-slate-400 mt-1">Control Financiero</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm md:text-base",
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800",
                )}
              >
                <Icon size={18} className="md:w-5 md:h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
