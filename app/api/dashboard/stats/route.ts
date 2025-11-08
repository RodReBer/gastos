import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Get user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, monthly_income")
      .eq("auth0_id", session.user.sub)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userData as any).id
    const monthlyIncome = (userData as any).monthly_income || 0

    // Get all invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("invoice_date", { ascending: true })

    // Get all payments
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")

    const totalPaid = payments?.reduce((sum: number, p: any) => sum + p.amount_paid, 0) || 0
    const totalInvoices = invoices?.reduce((sum: number, i: any) => sum + i.amount, 0) || 0

    // Calcular gastos por mes (últimos 6 meses)
    const monthlyExpenses: Record<string, number> = {}
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyExpenses[monthKey] = 0
    }

    invoices?.forEach((inv: any) => {
      const date = new Date(inv.invoice_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyExpenses[monthKey] !== undefined) {
        monthlyExpenses[monthKey] += inv.amount
      }
    })

    // Calcular gastos por día (últimos 30 días)
    const dailyExpenses: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      dailyExpenses[dayKey] = 0
    }

    invoices?.forEach((inv: any) => {
      const dayKey = inv.invoice_date
      if (dailyExpenses[dayKey] !== undefined) {
        dailyExpenses[dayKey] += inv.amount
      }
    })

    // Convertir a arrays para las gráficas
    const monthlyData = Object.entries(monthlyExpenses).map(([month, amount]) => ({
      month,
      expenses: amount,
      income: monthlyIncome,
      balance: monthlyIncome - amount
    }))

    const dailyData = Object.entries(dailyExpenses).map(([date, amount]) => ({
      date,
      amount
    }))

    // Calcular el mes actual
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentMonthExpenses = monthlyExpenses[currentMonth] || 0
    const remainingBudget = monthlyIncome - currentMonthExpenses
    const percentageUsed = monthlyIncome > 0 ? (currentMonthExpenses / monthlyIncome) * 100 : 0

    return NextResponse.json({
      total_invoices: invoices?.length || 0,
      pending_payments: invoices?.filter((i: any) => i.status === 'pending').length || 0,
      total_paid: totalPaid.toFixed(2),
      total_expenses: totalInvoices.toFixed(2),
      monthly_income: monthlyIncome,
      current_month_expenses: currentMonthExpenses.toFixed(2),
      remaining_budget: remainingBudget.toFixed(2),
      percentage_used: percentageUsed.toFixed(1),
      monthly_data: monthlyData,
      daily_data: dailyData.slice(-30),
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
