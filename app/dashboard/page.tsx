"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CategoryChart } from "@/components/charts/category-chart"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, mutate } = useSWR("/api/dashboard/stats", fetcher)
  const { data: categoryData } = useSWR("/api/dashboard/categories", fetcher)
  const [income, setIncome] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSaveIncome = async () => {
    if (!income || parseFloat(income) <= 0) return
    
    setSaving(true)
    try {
      await fetch("/api/user/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_income: parseFloat(income) }),
      })
      mutate()
      setIncome("")
    } catch (error) {
      console.error("Error saving income:", error)
    } finally {
      setSaving(false)
    }
  }

  const getRecommendation = () => {
    if (!stats?.monthly_income || stats.monthly_income === 0) {
      return {
        message: "💡 Configura tu ingreso mensual para obtener recomendaciones personalizadas",
        type: "info"
      }
    }

    const percentage = parseFloat(stats.percentage_used)
    
    if (percentage < 50) {
      return {
        message: `✅ ¡Excelente! Has usado solo el ${percentage.toFixed(1)}% de tu presupuesto. Vas muy bien.`,
        type: "success"
      }
    } else if (percentage < 80) {
      return {
        message: `⚠️ Has usado el ${percentage.toFixed(1)}% de tu presupuesto. Ten cuidado con los gastos.`,
        type: "warning"
      }
    } else if (percentage < 100) {
      return {
        message: `🚨 Has usado el ${percentage.toFixed(1)}% de tu presupuesto. Reduce gastos urgentemente.`,
        type: "danger"
      }
    } else {
      return {
        message: `❌ Has excedido tu presupuesto en $${Math.abs(parseFloat(stats.remaining_budget)).toFixed(2)}. Revisa tus gastos.`,
        type: "danger"
      }
    }
  }

  const recommendation = stats ? getRecommendation() : null

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bienvenido, {user?.name || user?.email}</h1>
        <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">Panel de control de tus finanzas</p>
      </div>

      {/* Configurar Ingreso */}
      {(!stats?.monthly_income || stats.monthly_income === 0) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
              Configura tu ingreso mensual
            </CardTitle>
            <CardDescription className="text-sm">Ingresa cuánto ganas al mes para obtener recomendaciones</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="income">Ingreso Mensual ($)</Label>
              <Input
                id="income"
                type="number"
                placeholder="3000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveIncome} disabled={saving} className="sm:mt-6">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recomendación */}
      {recommendation && stats?.monthly_income > 0 && (
        <Alert className={
          recommendation.type === 'success' ? 'border-green-200 bg-green-50' :
          recommendation.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          recommendation.type === 'danger' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'
        }>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium text-sm">
            {recommendation.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
              Ingreso Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">${stats?.monthly_income?.toFixed(2) || "0.00"}</div>
            {stats?.monthly_income > 0 && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs mt-1"
                onClick={() => {
                  const newIncome = prompt("Nuevo ingreso mensual:", stats.monthly_income)
                  if (newIncome) {
                    fetch("/api/user/income", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ monthly_income: parseFloat(newIncome) }),
                    }).then(() => mutate())
                  }
                }}
              >
                Editar
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600 flex items-center gap-2">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
              Gastos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">${stats?.current_month_expenses || "0.00"}</div>
            <p className="text-xs text-slate-500 mt-1">{stats?.percentage_used}% usado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600 flex items-center gap-2">
              {parseFloat(stats?.remaining_budget || "0") >= 0 ? (
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
              )}
              Disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${parseFloat(stats?.remaining_budget || "0") >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats?.remaining_budget || "0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Total Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats?.total_invoices || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Todas</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats?.monthly_income > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uso del Presupuesto Mensual</CardTitle>
            <CardDescription>
              ${stats?.current_month_expenses || "0.00"} de ${stats?.monthly_income?.toFixed(2) || "0.00"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={parseFloat(stats?.percentage_used || "0")} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de Categorías - NUEVO */}
        <CategoryChart 
          data={categoryData?.data}
          title="Gastos por Categoría"
          description="Distribución de tus gastos este mes"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Gastos Mensuales (últimos 6 meses)</CardTitle>
            <CardDescription className="text-xs md:text-sm">Comparación de ingresos vs gastos</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.monthly_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" fill="#22c55e" name="Ingreso" />
                <Bar dataKey="expenses" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Gastos Diarios (últimos 30 días)</CardTitle>
            <CardDescription className="text-xs md:text-sm">Tendencia de tus gastos</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.daily_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Gasto" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Acciones Rápidas</CardTitle>
            <CardDescription className="text-xs md:text-sm">Gestiona tus facturas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            <Link href="/dashboard/invoices/new" className="block">
              <Button className="w-full">Agregar Factura</Button>
            </Link>
            <Link href="/dashboard/invoices/scan" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                Escanear Factura
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Resumen</CardTitle>
            <CardDescription className="text-xs md:text-sm">Tus números del mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Facturas pendientes:</span>
              <span className="font-medium">{stats?.pending_payments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total pagado:</span>
              <span className="font-medium">${stats?.total_paid || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total gastos:</span>
              <span className="font-medium">${stats?.total_expenses || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
