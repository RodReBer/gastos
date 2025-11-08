"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import type { Invoice } from "@/lib/types"

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/invoices/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch invoice")
        }
        const data = await response.json()
        setInvoice(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchInvoice()
    }
  }, [params.id])

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete invoice")

      router.push("/dashboard/invoices")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete invoice")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Invoice not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/invoices")}>Back to Invoices</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "partial":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
          <p className="text-muted-foreground">
            {invoice.invoice_number || `Invoice #${invoice.id.substring(0, 8)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${params.id}/edit`)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Information</CardTitle>
            <Badge className={getStatusColor(invoice.status)}>{invoice.status.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Vendor Name</h3>
              <p className="text-lg font-medium mt-1">{invoice.vendor_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
              <p className="text-lg font-medium mt-1">{invoice.invoice_number || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className="text-lg font-medium mt-1">
                {invoice.currency} {invoice.amount.toFixed(2)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Invoice Date</h3>
              <p className="text-lg font-medium mt-1">
                {new Date(invoice.invoice_date).toLocaleDateString()}
              </p>
            </div>

            {(invoice as any).due_date && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                <p className="text-lg font-medium mt-1">
                  {new Date((invoice as any).due_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="text-lg font-medium mt-1">
                {new Date(invoice.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {invoice.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-base mt-2 whitespace-pre-wrap">{invoice.description}</p>
            </div>
          )}

          {(invoice as any).attachment_url && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachment</h3>
              <a
                href={(invoice as any).attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View attachment
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/invoices")}>
          Back to Invoices
        </Button>
      </div>
    </div>
  )
}
