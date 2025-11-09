"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useSettings } from "@/lib/contexts/settings-context"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/utils"

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { language, currency, setLanguage, setCurrency, isLoading: settingsLoading } = useSettings()
  const [saving, setSaving] = useState(false)
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const { toast } = useToast()

  // Obtener datos del usuario incluyendo monthly_income
  const { data: userData, error: userError } = useSWR(
    user ? "/api/user" : null,
    fetcher
  )

  useEffect(() => {
    if (userData?.monthly_income !== undefined) {
      setMonthlyIncome(userData.monthly_income.toString())
    }
  }, [userData])

  const handleSaveIncome = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          monthly_income: parseFloat(monthlyIncome) || 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to update income")

      // Actualizar los datos en SWR
      mutate("/api/user")

      toast({
        title: "Ingreso actualizado",
        description: "Tu ingreso mensual se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error saving income:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el ingreso mensual",
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
            <CardDescription>Detalles de tu cuenta desde Auth0</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={user?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>ID de Usuario</Label>
              <Input value={user?.sub || ""} disabled className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Financiera</CardTitle>
            <CardDescription>
              Tu ingreso mensual se usa para calcular divisiones proporcionales en grupos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-income">Ingreso Mensual ({currency})</Label>
              <div className="flex gap-2">
                <Input
                  id="monthly-income"
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Ej: 100000"
                />
                <Button onClick={handleSaveIncome} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Este valor se usa para dividir gastos proporcionalmente en grupos.
                Si no lo configuras, los gastos se dividirán en partes iguales.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>Personaliza tu experiencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Moneda Predeterminada</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UYU">🇺🇾 Peso Uruguayo (UYU)</SelectItem>
                  <SelectItem value="USD">🇺🇸 Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                  <SelectItem value="MXN">🇲🇽 Peso Mexicano (MXN)</SelectItem>
                  <SelectItem value="ARS">🇦🇷 Peso Argentino (ARS)</SelectItem>
                  <SelectItem value="BRL">🇧🇷 Real Brasileño (BRL)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Los cambios se guardan automáticamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
