"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fetcher } from "@/lib/utils/fetcher"
import Link from "next/link"

export default function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch group data
  const { data: group, isLoading } = useSWR(
    `/api/groups/${resolvedParams.id}`,
    fetcher
  )

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "UYU",
    split_method: "equal" as "equal" | "proportional",
  })

  // Update form when group data loads
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        currency: group.currency || "UYU",
        split_method: group.split_method || "equal",
      })
    }
  }, [group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar el grupo")
      }

      toast({
        title: "Grupo actualizado",
        description: "Los cambios fueron guardados exitosamente",
      })

      router.push(`/dashboard/groups/${resolvedParams.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  if (!group || group.role !== "admin") {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No tenés permisos para editar este grupo</p>
            <Link href={`/dashboard/groups/${resolvedParams.id}`}>
              <Button className="mt-4" variant="outline">
                Volver al Grupo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href={`/dashboard/groups/${resolvedParams.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Grupo
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Editar Grupo</h1>
          <p className="text-gray-600 mt-1">
            Modificá la configuración del grupo
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Grupo</CardTitle>
            <CardDescription>
              Los cambios afectarán a todos los miembros del grupo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Casa Compartida, Viaje, etc."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descripción del propósito del grupo"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UYU">🇺🇾 Pesos Uruguayos (UYU)</SelectItem>
                    <SelectItem value="USD">🇺🇸 Dólares (USD)</SelectItem>
                    <SelectItem value="EUR">🇪🇺 Euros (EUR)</SelectItem>
                    <SelectItem value="ARS">🇦🇷 Pesos Argentinos (ARS)</SelectItem>
                    <SelectItem value="BRL">🇧🇷 Reales (BRL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="split_method">Método de División</Label>
                <Select
                  value={formData.split_method}
                  onValueChange={(value: "equal" | "proportional") =>
                    setFormData({ ...formData, split_method: value })
                  }
                >
                  <SelectTrigger id="split_method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">
                      División Igualitaria (50-50)
                    </SelectItem>
                    <SelectItem value="proportional">
                      División Proporcional (según ingresos)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {formData.split_method === "equal"
                    ? "Los gastos se dividen en partes iguales entre todos los miembros"
                    : "Los gastos se dividen proporcionalmente según los ingresos mensuales de cada miembro"}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/groups/${resolvedParams.id}`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name}
                  className="flex-1"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
