import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/services/payment-service"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase.from("users").select("id").eq("auth0_id", session.user.sub).single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const payments = await paymentService.getPayments((userData as any).id)
    return NextResponse.json(payments)
  } catch (error) {
    console.error("[v0] Get payments error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase.from("users").select("id").eq("auth0_id", session.user.sub).single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await req.json()
    const payment = await paymentService.createPayment((userData as any).id, body)

    // Si el pago tiene un invoice_id, verificar si se pagó en su totalidad
    if (body.invoice_id && body.status === 'completed') {
      // Obtener la factura
      const { data: invoice } = await supabase
        .from('invoices')
        .select('amount')
        .eq('id', body.invoice_id)
        .single()

      if (invoice) {
        // Obtener todos los pagos completados para esta factura
        const { data: allPayments } = await supabase
          .from('payments')
          .select('amount_paid')
          .eq('invoice_id', body.invoice_id)
          .eq('status', 'completed')

        const totalPaid = (allPayments as any)?.reduce((sum: number, p: any) => sum + p.amount_paid, 0) || 0

        // Si el total pagado es igual o mayor al monto de la factura, marcarla como pagada
        if (totalPaid >= (invoice as any).amount) {
          await supabase
            .from('invoices')
            .update({ status: 'paid' } as any)
            .eq('id', body.invoice_id)
        } else if (totalPaid > 0) {
          // Si hay un pago parcial, marcar como partial
          await supabase
            .from('invoices')
            .update({ status: 'partial' } as any)
            .eq('id', body.invoice_id)
        }
      }
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("[v0] Create payment error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
