"use client"

import { useState } from "react"
import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, UserPlus, Plus, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetcher } from "@/lib/utils/fetcher"
import type { ExpenseGroup, GroupMember } from "@/lib/types"

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // Fetch group data
  const { data: group, isLoading } = useSWR<ExpenseGroup>(
    `/api/groups/${resolvedParams.id}`,
    fetcher
  )

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)

    try {
      const response = await fetch(`/api/groups/${resolvedParams.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al enviar invitación")
      }

      toast({
        title: "Invitación enviada",
        description: `Se envió una invitación a ${inviteEmail}`,
      })

      setInviteEmail("")
      setInviteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">Grupo no encontrado</p>
            <Link href="/dashboard/groups">
              <Button className="mt-4" variant="outline">
                Volver a Grupos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/groups">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Grupos
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-gray-600 mt-1">{group.description}</p>
            )}
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">
                {group.split_method === "equal"
                  ? "División 50-50"
                  : "División Proporcional"}
              </Badge>
              <Badge variant="outline">{group.currency}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invitar Miembro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invitar Miembro al Grupo</DialogTitle>
                  <DialogDescription>
                    Ingresá el email de la persona que querés invitar
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInviteDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isInviting || !inviteEmail}
                      className="flex-1"
                    >
                      {isInviting ? "Enviando..." : "Enviar Invitación"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.member_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {group.currency} 0
            </div>
            <p className="text-xs text-muted-foreground">Próximamente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {group.currency} 0
            </div>
            <p className="text-xs text-muted-foreground">Próximamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Miembros */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del Grupo</CardTitle>
          <CardDescription>
            Personas que forman parte de este grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Cargando miembros... (próximamente)
          </div>
        </CardContent>
      </Card>

      {/* Gastos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gastos Compartidos</CardTitle>
              <CardDescription>
                Gastos del grupo y división entre miembros
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Gasto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            No hay gastos registrados todavía. (próximamente)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
