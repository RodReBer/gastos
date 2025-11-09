"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Upload, Camera, X } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ocrService } from "@/lib/services/ocr-service-gpt4"
import { FILE_CONFIG } from "@/lib/constants"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    notes: "",
    is_recurring: false,
    recurrence_interval: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
  })

  const handleFileSelect = async (file: File) => {
    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "El archivo es muy grande (máximo 5MB)",
        variant: "destructive",
      })
      return
    }

    if (!FILE_CONFIG.ACCEPTED_FORMATS.includes(file.type)) {
      toast({
        title: "Error",
        description: "Formato inválido. Usa PNG, JPG o WEBP",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setUploadedFile(file)

    try {
      // Show preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      // Run OCR
      const result = await ocrService.extractFromImage(file)

      // Fill form with OCR results
      if (result.vendor) {
        setFormData((prev) => ({ ...prev, description: result.vendor || "" }))
      }
      if (result.amount) {
        setFormData((prev) => ({ ...prev, amount: result.amount?.toString() || "" }))
      }
      if (result.date) {
        const parsedDate = new Date(result.date)
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate)
        }
      }
      if (result.category) {
        setFormData((prev) => ({ ...prev, category: result.category || "other" }))
      }

      toast({
        title: "Escaneo completado",
        description: "Revisa los datos extraídos y ajusta si es necesario",
      })
    } catch (error: any) {
      toast({
        title: "Error al escanear",
        description: error.message,
        variant: "destructive",
      })
      setPreview(null)
      setUploadedFile(null)
    } finally {
      setIsScanning(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const clearFile = () => {
    setPreview(null)
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }


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
      {/* Tabs para Manual / Escanear */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="scan">Escanear / Subir</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-4">
          {/* Contenido del formulario manual (original) */}
        </TabsContent>

        <TabsContent value="scan" className="space-y-4 mt-4">
          {/* Opción de escanear/subir archivo */}
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {preview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 rounded-lg mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {isScanning && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">
                        Escaneando factura...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">
                      Subir factura o recibo
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Sube una imagen y extraeremos los datos automáticamente
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = fileInputRef.current
                        if (input) {
                          input.setAttribute("capture", "environment")
                          input.click()
                        }
                      }}
                      disabled={isScanning}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG o WEBP (máx. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Formulario común (se muestra siempre después de escanear o en manual) */}
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
