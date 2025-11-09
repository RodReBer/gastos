"use client"

import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { NotificationsBell } from "./notifications-bell"

interface DashboardNavProps {
  onMenuClick: () => void
}

export function DashboardNav({ onMenuClick }: DashboardNavProps) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>
        
        <h2 className="text-base md:text-lg font-semibold text-slate-900">Dashboard</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications Bell */}
        <NotificationsBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 cursor-pointer">
            <Avatar className="h-8 w-8 md:h-9 md:w-9">
              <AvatarImage src={(user?.picture as string) || "/placeholder.svg"} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-slate-900 truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/settings">
              <DropdownMenuItem>Configuración</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/api/auth/logout">
              <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
