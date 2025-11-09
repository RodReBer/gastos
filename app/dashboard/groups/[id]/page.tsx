"use client"

import { useState } from "react"
import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, UserPlus, Plus, Users, DollarSign, CheckCircle, XCircle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetcher } from "@/lib/utils/fetcher"
import { ExpenseForm } from "@/components/groups/expense-form"
import type { ExpenseGroup, GroupExpense } from "@/lib/types"

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
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)

  // Fetch group data
  const { data: group, isLoading, mutate } = useSWR<ExpenseGroup>(
    `/api/groups/${resolvedParams.id}`,
    fetcher
  )

  // Fetch expenses
  const { data: expenses, mutate: mutateExpenses } = useSWR<GroupExpense[]>(
    `/api/groups/${resolvedParams.id}/expenses`,
    fetcher
  )

  // Calculate totals
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const myBalance = expenses?.reduce((sum, exp) => {
    const mySplit = exp.splits?.find((s: any) => !s.is_paid)
    return sum + (mySplit?.amount_owed || 0)
  }, 0) || 0

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
      mutate() // Refresh group data
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
              {group.currency} {totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${myBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {group.currency} {Math.abs(myBalance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {myBalance > 0 ? 'Debés' : myBalance < 0 ? 'Te deben' : 'Estás al día'}
            </p>
          </CardContent>
        </Card>
      </div>

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
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Gasto Compartido</DialogTitle>
                  <DialogDescription>
                    El gasto se dividirá automáticamente entre los miembros del grupo
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm
                  groupId={resolvedParams.id}
                  currency={group.currency}
                  onSuccess={() => {
                    setExpenseDialogOpen(false)
                    mutateExpenses()
                    mutate()
                  }}
                  onCancel={() => setExpenseDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay gastos registrados todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{expense.description}</h4>
                      {expense.is_recurring && (
                        <Badge variant="secondary" className="text-xs">
                          📅 Recurrente
                        </Badge>
                      )}
                      {expense.category && (
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Pagado por: {(expense as any).paid_by_user?.email || 'Usuario'}</span>
                      <span>•</span>
                      <span>{format(new Date(expense.expense_date), "PPP", { locale: es })}</span>
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                    )}
                    {/* División */}
                    <div className="mt-3 space-y-1">
                      {expense.splits?.map((split: any) => (
                        <div key={split.id} className="flex items-center gap-2 text-xs">
                          {split.is_paid ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span className="text-gray-600">
                            {split.user?.email}: {group.currency} {split.amount_owed.toFixed(2)}
                            {split.is_paid && " ✓"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {group.currency} {expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            {group.member_count} miembro{group.member_count !== 1 ? 's' : ''} en el grupo
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
