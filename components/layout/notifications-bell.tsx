"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { fetcher } from "@/lib/utils"
import Link from "next/link"

interface Invitation {
  id: string
  email: string
  status: string
  created_at: string
  expense_groups: {
    id: string
    name: string
    description?: string
    currency: string
  }
  invited_by_user: {
    id: string
    email: string
    name?: string
  }
}

export function NotificationsBell() {
  const { data: invitations, error } = useSWR<Invitation[]>(
    "/api/invitations",
    fetcher,
    {
      refreshInterval: 60000, // Refrescar cada 60 segundos
      revalidateOnFocus: true,
      shouldRetryOnError: false, // No reintentar en caso de error
      dedupingInterval: 5000, // Evitar múltiples llamadas en 5 segundos
      onError: (err) => {
        // Silenciar errores 401 (no autenticado) para evitar spam en consola
        if (err?.status !== 401) {
          console.error("Error loading invitations:", err)
        }
      },
    }
  )

  const pendingCount = invitations?.length || 0
  const hasNotifications = pendingCount > 0

  // No mostrar la campanita si hay error de autenticación
  if (error?.status === 401) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">Notificaciones</h3>
          
          {error && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Error al cargar notificaciones
            </p>
          )}

          {!error && !invitations && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Cargando...
            </p>
          )}

          {!error && invitations && invitations.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No tienes notificaciones
            </p>
          )}

          {!error && invitations && invitations.length > 0 && (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <Link
                  key={invitation.id}
                  href="/dashboard/invitations"
                  className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        Invitación a grupo
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {invitation.invited_by_user.name || invitation.invited_by_user.email} te
                        invitó a <strong>{invitation.expense_groups.name}</strong>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(invitation.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link
                href="/dashboard/invitations"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-2"
              >
                Ver todas las invitaciones
              </Link>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
