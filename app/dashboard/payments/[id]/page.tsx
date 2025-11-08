"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import type { Payment } from "@/lib/types"

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPayment() {
      try {
        const response = await fetch(`/api/payments/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch payment")
        }
        const data = await response.json()
        setPayment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPayment()
    }
  }, [params.id])

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this payment?")) return

    try {
      const response = await fetch(`/api/payments/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete payment")

      router.push("/dashboard/payments")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete payment")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Payment not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/payments")}>Back to Payments</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-muted-foreground">Payment #{payment.id.substring(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/payments/${params.id}/edit`)}>
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
            <CardTitle>Payment Information</CardTitle>
            <Badge className={getStatusColor(payment.status)}>{payment.status.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className="text-lg font-medium mt-1">
                {(payment as any).currency || 'USD'} {(payment as any).amount?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Type</h3>
              <p className="text-lg font-medium mt-1 capitalize">{payment.payment_type}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Date</h3>
              <p className="text-lg font-medium mt-1">
                {new Date(payment.payment_date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="text-lg font-medium mt-1">
                {new Date(payment.created_at).toLocaleString()}
              </p>
            </div>

            {payment.invoice_id && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Invoice ID</h3>
                <p className="text-lg font-medium mt-1">{payment.invoice_id}</p>
              </div>
            )}

            {(payment as any).reference_number && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reference Number</h3>
                <p className="text-lg font-medium mt-1">{(payment as any).reference_number}</p>
              </div>
            )}
          </div>

          {payment.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-base mt-2 whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/payments")}>
          Back to Payments
        </Button>
      </div>
    </div>
  )
}
