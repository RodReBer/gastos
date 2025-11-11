"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAYMENT_TYPES, API_ROUTES, PAYMENT_STATUSES } from "@/lib/constants"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import type { Invoice } from "@/lib/types"

const paymentSchema = z.object({
  invoice_id: z.string().min(1, "Invoice is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_type: z.string().min(1, "Payment type is required"),
  amount_paid: z.coerce.number().min(0, "Amount must be positive"),
  status: z.string(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  invoiceId?: string
  onSuccess?: () => void
}

export function PaymentForm({ invoiceId, onSuccess }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: invoices } = useSWR("/api/invoices", fetcher)

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoice_id: invoiceId || "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_type: PAYMENT_TYPES.CARD,
      status: PAYMENT_STATUSES.COMPLETED,
    },
  })

  async function onSubmit(data: PaymentFormData) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.PAYMENTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create payment")

      form.reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedInvoice = invoices?.find((inv: Invoice) => inv.id === form.watch("invoice_id"))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
        <CardDescription>Add a payment to an invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="invoice_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an invoice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {invoices?.map((invoice: Invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.vendor_name} - ${invoice.amount} ({invoice.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedInvoice && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-900">
                  <strong>Invoice Amount:</strong> ${selectedInvoice.amount} {selectedInvoice.currency}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>{selectedInvoice && `Invoice total: $${selectedInvoice.amount}`}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Recording..." : "Record Payment"}
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
