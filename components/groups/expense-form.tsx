"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ExpenseFormProps {
  groupId: string
  currency: string
  onSuccess?: () => void
  onCancel?: () => void
}

const CATEGORIES = [
  { value: "food", label: "🍔 Comida" },
  { value: "transport", label: "🚗 Transporte" },
  { value: "entertainment", label: "🎬 Entretenimiento" },
  { value: "utilities", label: "💡 Servicios" },
  { value: "health", label: "⚕️ Salud" },
  { value: "home", label: "🏠 Casa" },
  { value: "education", label: "📚 Educación" },
  { value: "shopping", label: "🛍️ Compras" },
  { value: "tech", label: "💻 Tecnología" },
  { value: "other", label: "📦 Otro" },
]

export function ExpenseForm({ groupId, currency, onSuccess, onCancel }: ExpenseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    notes: "",
    is_recurring: false,
    recurrence_interval: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          expense_date: format(date, "yyyy-MM-dd"),
          category: formData.category,
          notes: formData.notes || null,
          is_recurring: formData.is_recurring,
          recurrence_interval: formData.is_recurring
            ? formData.recurrence_interval
            : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear el gasto")
      }

      toast({
        title: "Gasto agregado",
        description: "El gasto fue registrado exitosamente",
      })

      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: "other",
        notes: "",
        is_recurring: false,
        recurrence_interval: "monthly",
      })
      setDate(new Date())

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Input
          id="description"
          placeholder="Ej: Supermercado, Nafta, Cena, etc."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      {/* Monto */}
      <div className="space-y-2">
        <Label htmlFor="amount">
          Monto ({currency}) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          required
        />
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <Label>Fecha del Gasto</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Categoría */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gasto recurrente */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="recurring">Gasto Recurrente</Label>
          <p className="text-sm text-muted-foreground">
            El gasto se repetirá automáticamente
          </p>
        </div>
        <Switch
          id="recurring"
          checked={formData.is_recurring}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_recurring: checked })
          }
        />
      </div>

      {/* Intervalo de recurrencia */}
      {formData.is_recurring && (
        <div className="space-y-2">
          <Label htmlFor="interval">Frecuencia</Label>
          <Select
            value={formData.recurrence_interval}
            onValueChange={(value: any) =>
              setFormData({ ...formData, recurrence_interval: value })
            }
          >
            <SelectTrigger id="interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Información adicional..."
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          rows={3}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !formData.description || !formData.amount}
          className="flex-1"
        >
          {isSubmitting ? "Guardando..." : "Agregar Gasto"}
        </Button>
      </div>
    </form>
  )
}
