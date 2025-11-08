"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportSummaryProps {
  data: {
    total_invoices: number
    total_invoice_amount: number
    pending_amount: number
    paid_amount: number
    partial_amount: number
    total_payments: number
    payment_by_type: Record<string, number>
    monthly_summary: Record<string, number>
  }
}

export function ReportSummary({ data }: ReportSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.total_invoices}</p>
            <p className="text-xs text-slate-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${data.total_invoice_amount.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-1">Invoice total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${data.paid_amount.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">${data.pending_amount.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-1">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Breakdown</CardTitle>
          <CardDescription>Distribution of your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Paid</span>
              <span className="text-sm font-bold text-green-600">${data.paid_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Partial</span>
              <span className="text-sm font-bold text-blue-600">${data.partial_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Pending</span>
              <span className="text-sm font-bold text-orange-600">${data.pending_amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Types */}
      {Object.keys(data.payment_by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments by Type</CardTitle>
            <CardDescription>How you paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.payment_by_type).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown */}
      {Object.keys(data.monthly_summary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>Invoice amounts by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.monthly_summary)
                .sort()
                .map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{month}</span>
                    <span className="text-sm font-bold text-slate-900">${(amount as number).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
