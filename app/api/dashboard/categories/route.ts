import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Primero obtener el UUID del usuario desde auth0_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (user as any).id

    // Obtener todas las facturas del usuario con categorías
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("amount, category, currency")
      .eq("user_id", userId)
      .eq("status", "pending")

    if (invoicesError) throw invoicesError

    // Obtener gastos de grupos (splits que debe pagar este usuario)
    const { data: groupExpenses, error: groupError } = await (supabase as any)
      .from("expense_splits")
      .select(`
        amount_owed,
        expense:group_expenses (
          category,
          currency
        )
      `)
      .eq("user_id", userId)

    if (groupError) throw groupError

    // Agrupar por categoría
    const categoryTotals: Record<string, number> = {}
    
    // Agregar facturas individuales
    invoices?.forEach((invoice: any) => {
      const category = invoice.category || "other"
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += parseFloat(invoice.amount) || 0
    })

    // Agregar gastos de grupos
    groupExpenses?.forEach((split: any) => {
      const category = split.expense?.category || "other"
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += parseFloat(split.amount_owed) || 0
    })

    // Convertir a array para la gráfica
    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }))

    return NextResponse.json({
      success: true,
      data: categoryData,
      total: categoryData.reduce((sum, item) => sum + item.value, 0),
    })
  } catch (error) {
    console.error("[Category Stats] Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
