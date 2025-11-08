"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import type { Payment } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default function PaymentsPage() {
  const { data: payments, isLoading } = useSWR("/api/payments", fetcher)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">Track all your payments</p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All recorded payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-600">Loading...</p>
          ) : payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: Payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900 capitalize">{payment.payment_type}</td>
                      <td className="py-3 px-4 text-slate-900">${payment.amount_paid.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(payment.payment_date)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No payments recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
