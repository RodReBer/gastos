"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FILE_CONFIG, API_ROUTES } from "@/lib/constants"
import { ocrService } from "@/lib/services/ocr-service-gpt4"
import { Spinner } from "@/components/ui/spinner"

const scannerSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  invoice_date: z.string().min(1, "Invoice date is required"),
  invoice_number: z.string().optional(),
  extracted_text: z.string().optional(),
})

type ScannerFormData = z.infer<typeof scannerSchema>

interface ScannerFormProps {
  onSuccess?: () => void
}

export function ScannerForm({ onSuccess }: ScannerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<ScannerFormData>({
    resolver: zodResolver(scannerSchema),
    defaultValues: {
      vendor_name: "",
      amount: undefined,
      invoice_date: "",
    },
  })

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
      setError("File is too large (max 5MB)")
      return
    }

    if (!FILE_CONFIG.ACCEPTED_FORMATS.includes(file.type)) {
      setError("Invalid file format. Please use PNG, JPG, or WEBP")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      // Show preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      console.log('[Scanner] Starting OCR for file:', file.name)
      
      // Run OCR
      const result = await ocrService.extractFromImage(file)
      
      console.log('[Scanner] OCR completed:', result)

      form.setValue("extracted_text", result.text)
      if (result.vendor) form.setValue("vendor_name", result.vendor)
      if (result.amount) form.setValue("amount", result.amount)
      if (result.date) form.setValue("invoice_date", result.date)
      if (result.invoiceNumber) form.setValue("invoice_number", result.invoiceNumber)
      
      // Show success message
      if (result.confidence < 0.5) {
        setError("⚠️ Low confidence scan. Please verify the extracted data.")
      }
    } catch (err) {
      console.error('[Scanner] OCR error:', err)
      setError(err instanceof Error ? err.message : "Failed to scan document. Please try with a clearer image.")
    } finally {
      setIsScanning(false)
    }
  }

  async function onSubmit(data: ScannerFormData) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.INVOICES.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          currency: "USD",
        }),
      })

      if (!response.ok) throw new Error("Failed to create invoice")
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Invoice</CardTitle>
        <CardDescription>Upload an invoice image for automatic data extraction</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload */}
            <FormItem>
              <FormLabel>Upload Invoice Image</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    disabled={isScanning}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {isScanning ? (
                      <div className="flex flex-col items-center gap-2">
                        <Spinner />
                        <p className="text-sm text-slate-600">Scanning document...</p>
                        <p className="text-xs text-slate-400">This may take a few seconds</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Click to upload or take photo</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (max 5MB)</p>
                        <p className="text-xs text-slate-400 mt-1">📱 Mobile: Use camera to scan invoice</p>
                      </div>
                    )}
                  </label>
                </div>
              </FormControl>
            </FormItem>

            {/* Preview */}
            {preview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview</p>
                <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-48 rounded-lg" />
              </div>
            )}

            {/* Extracted Fields */}
            <FormField
              control={form.control}
              name="vendor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Extracted from scan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="extracted_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extracted Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full OCR text" {...field} className="min-h-32" />
                  </FormControl>
                </FormItem>
              )}
            />

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Invoice"}
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
