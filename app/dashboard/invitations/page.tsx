"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Users, Calendar } from "lucide-react"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/utils"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

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

export default function InvitationsPage() {
  const { data: invitations, error, isLoading } = useSWR<Invitation[]>(
    "/api/invitations",
    fetcher
  )
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleResponse = async (invitationId: string, action: "accept" | "reject") => {
    setProcessingId(invitationId)
    
    try {
      const response = await fetch(`/api/invitations/${invitationId}/${action}`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al procesar la invitación")
      }

      toast({
        title: action === "accept" ? "Invitación aceptada" : "Invitación rechazada",
        description:
          action === "accept"
            ? "Te has unido al grupo exitosamente"
            : "Has rechazado la invitación",
      })

      // Revalidar la lista de invitaciones
      mutate("/api/invitations")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Invitaciones</h1>
          <p className="text-muted-foreground">Cargando invitaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Invitaciones</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error al cargar las invitaciones</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Invitaciones a Grupos</h1>
          <p className="text-muted-foreground">
            Gestiona las invitaciones que has recibido para unirte a grupos de gastos
          </p>
        </div>

        {!invitations || invitations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes invitaciones pendientes</h3>
                <p className="text-muted-foreground">
                  Cuando alguien te invite a un grupo, las invitaciones aparecerán aquí
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {invitation.expense_groups.name}
                      </CardTitle>
                      <CardDescription>
                        Invitado por{" "}
                        {invitation.invited_by_user.name || invitation.invited_by_user.email}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      <Users className="h-3 w-3 mr-1" />
                      Grupo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {invitation.expense_groups.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {invitation.expense_groups.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Invitado el{" "}
                        {new Date(invitation.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Moneda: {invitation.expense_groups.currency}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleResponse(invitation.id, "accept")}
                      disabled={processingId === invitation.id}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aceptar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleResponse(invitation.id, "reject")}
                      disabled={processingId === invitation.id}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
