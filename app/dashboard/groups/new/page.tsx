"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NewGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "UYU",
    split_method: "equal" as "equal" | "proportional",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear el grupo")
      }

      const group = await response.json()

      toast({
        title: "Grupo creado",
        description: "El grupo fue creado exitosamente",
      })

      router.push(`/dashboard/groups/${group.id}`)
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

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard/groups">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Grupos
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Crear Nuevo Grupo</h1>
          <p className="text-gray-600 mt-1">
            Configurá un grupo para compartir gastos con otras personas
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Grupo</CardTitle>
            <CardDescription>
              Completá los datos básicos del grupo. Después podrás invitar miembros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre del Grupo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Gastos de Casa, Viaje a Brasil, etc."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el propósito del grupo..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Moneda */}
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
                    <SelectItem value="UYU">UYU - Peso Uruguayo</SelectItem>
                    <SelectItem value="USD">USD - Dólar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                    <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Método de división */}
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
                      <div>
                        <div className="font-medium">División Igual (50-50)</div>
                        <div className="text-sm text-gray-500">
                          Todos pagan lo mismo
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="proportional">
                      <div>
                        <div className="font-medium">División Proporcional</div>
                        <div className="text-sm text-gray-500">
                          Según los ingresos de cada miembro
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {formData.split_method === "equal"
                    ? "Los gastos se dividirán en partes iguales entre todos los miembros."
                    : "Los gastos se dividirán proporcionalmente según los ingresos mensuales de cada miembro."}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name}
                  className="flex-1"
                >
                  {isSubmitting ? "Creando..." : "Crear Grupo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
