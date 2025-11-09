import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// POST /api/groups/[id]/expenses/[expenseId]/pay - Marcar split como pagado y registrar el pago
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { id: groupId, expenseId } = await params
    const body = await req.json()
    const { splitId } = body

    // Obtener el ID del usuario
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userData as any).id

    // Verificar que el usuario es miembro del grupo
    const { data: membership } = await (supabase as any)
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      )
    }

    // Obtener información del split y del gasto
    const { data: split, error: splitError } = await (supabase as any)
      .from("expense_splits")
      .select(`
        *,
        expense:group_expenses!inner (
          id,
          description,
          amount,
          group_id,
          paid_by
        )
      `)
      .eq("id", splitId)
      .eq("expense_id", expenseId)
      .single()

    if (splitError || !split) {
      return NextResponse.json({ error: "Split not found" }, { status: 404 })
    }

    if (split.is_paid) {
      return NextResponse.json({ error: "Already paid" }, { status: 400 })
    }

    // Marcar el split como pagado primero
    const { data: updatedSplit, error: updateError } = await (supabase as any)
      .from("expense_splits")
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", splitId)
      .eq("expense_id", expenseId)
      .select()
      .single()

    if (updateError) throw updateError

    // Intentar crear un registro de pago en la tabla payments
    // NOTA: Esto requiere que invoice_id sea nullable en la base de datos
    // Si falla, el split ya está marcado como pagado de todas formas
    let payment = null
    try {
      const { data: paymentData, error: paymentError } = await (supabase as any)
        .from("payments")
        .insert({
          user_id: userId,
          invoice_id: null, // No está asociado a una factura individual
          payment_date: new Date().toISOString().split('T')[0],
          payment_type: "group_expense", // Tipo para gastos de grupo
          amount_paid: split.amount_owed,
          status: "completed",
          notes: `Pago de gasto compartido: ${split.expense.description} (Grupo)`,
        })
        .select()
        .single()

      if (paymentError) {
        console.error("Error creating payment record:", paymentError)
        console.log("⚠️  Split marked as paid, but payment record failed. Run FIX_PAYMENTS_INVOICE_ID.sql to allow null invoice_id")
      } else {
        payment = paymentData
      }
    } catch (err) {
      console.error("Payment creation failed:", err)
    }

    return NextResponse.json({
      split: updatedSplit,
      payment: payment,
      message: payment 
        ? "Pago registrado exitosamente" 
        : "Pago marcado como pagado (sin registro de pago individual)"
    })
  } catch (error: any) {
    console.error("Error marking split as paid:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
