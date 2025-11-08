"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import type { Invoice } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useSWR("/api/invoices", fetcher)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Manage your invoices and track payments</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/invoices/scan">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Scan Invoice
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Invoice
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>All your invoices in one place</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-600">Loading...</p>
          ) : invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Vendor</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice: Invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{invoice.vendor_name}</td>
                      <td className="py-3 px-4 text-slate-900">
                        ${invoice.amount.toFixed(2)} {invoice.currency}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(invoice.invoice_date)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "partial"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Button variant="sm" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No invoices yet. Create one to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
