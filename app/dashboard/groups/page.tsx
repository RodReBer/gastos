"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Plus, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetcher } from "@/lib/utils/fetcher"
import type { ExpenseGroup } from "@/lib/types"

export default function GroupsPage() {
  const { data: groups, isLoading } = useSWR<ExpenseGroup[]>("/api/groups", fetcher)
  const { data: invitations } = useSWR("/api/invitations", fetcher)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Grupos de Gastos</h1>
          <p className="text-gray-600 mt-1">
            Comparte y divide gastos con otras personas
          </p>
        </div>
        <Link href="/dashboard/groups/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Crear Grupo
          </Button>
        </Link>
      </div>

      {/* Invitaciones pendientes */}
      {invitations && invitations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600">
                {invitations.length}
              </Badge>
              Invitaciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((invitation: any) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div>
                    <p className="font-medium">{invitation.expense_groups?.name}</p>
                    <p className="text-sm text-gray-500">
                      Invitado por {invitation.invited_by_user?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await fetch(`/api/invitations/${invitation.id}/accept`, {
                          method: "POST",
                        })
                        window.location.reload()
                      }}
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await fetch(`/api/invitations/${invitation.id}/reject`, {
                          method: "POST",
                        })
                        window.location.reload()
                      }}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de grupos */}
      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tenés grupos todavía</h3>
            <p className="text-gray-500 text-center mb-4">
              Creá un grupo para empezar a compartir gastos con otras personas
            </p>
            <Link href="/dashboard/groups/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear tu Primer Grupo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription className="line-clamp-2">
                      {group.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2 h-4 w-4" />
                      <span>
                        {group.member_count || 0} miembro
                        {group.member_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Moneda: {group.currency}</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {group.split_method === "equal"
                        ? "División 50-50"
                        : "División Proporcional"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
