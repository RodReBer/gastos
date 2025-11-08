// Report Service - SOLID Single Responsibility
import type { Invoice, Payment } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

interface ReportSummary {
  total_invoices: number
  total_invoice_amount: number
  pending_amount: number
  paid_amount: number
  partial_amount: number
  total_payments: number
  payment_by_type: Record<string, number>
  monthly_summary: Record<string, number>
}

class ReportService {
  async generateSummary(userId: string, startDate?: string, endDate?: string): Promise<ReportSummary> {
    const supabase = getSupabaseAdminClient()

    let invoicesQuery = supabase.from("invoices").select("*").eq("user_id", userId)

    if (startDate) {
      invoicesQuery = invoicesQuery.gte("invoice_date", startDate)
    }
    if (endDate) {
      invoicesQuery = invoicesQuery.lte("invoice_date", endDate)
    }

    const { data: invoices } = await invoicesQuery
    const { data: payments } = await supabase.from("payments").select("*").eq("user_id", userId)

    const summary: ReportSummary = {
      total_invoices: invoices?.length || 0,
      total_invoice_amount: (invoices as any)?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0,
      pending_amount:
        (invoices as any)?.filter((inv: any) => inv.status === "pending").reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0,
      paid_amount: (invoices as any)?.filter((inv: any) => inv.status === "paid").reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0,
      partial_amount:
        (invoices as any)?.filter((inv: any) => inv.status === "partial").reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0,
      total_payments: payments?.length || 0,
      payment_by_type: this.groupPaymentsByType((payments as any) || []),
      monthly_summary: this.generateMonthlySummary((invoices as any) || []),
    }

    return summary
  }

  private groupPaymentsByType(payments: Payment[]): Record<string, number> {
    return payments.reduce(
      (acc, payment) => {
        acc[payment.payment_type] = (acc[payment.payment_type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private generateMonthlySummary(invoices: Invoice[]): Record<string, number> {
    return invoices.reduce(
      (acc, invoice) => {
        const date = new Date(invoice.invoice_date)
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        acc[month] = (acc[month] || 0) + invoice.amount
        return acc
      },
      {} as Record<string, number>,
    )
  }
}

export const reportService = new ReportService()
