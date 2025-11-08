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

    // Obtener todas las facturas del usuario con categorías
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("amount, category, currency")
      .eq("user_id", session.user.sub)
      .eq("status", "pending")

    if (error) throw error

    // Agrupar por categoría
    const categoryTotals: Record<string, number> = {}
    
    invoices?.forEach((invoice: any) => {
      const category = invoice.category || "other"
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += parseFloat(invoice.amount) || 0
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
