import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { paymentService } from "@/lib/services/payment-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("user_id", (userData as any).id)
      .single()

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("[v0] Get payment error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const payment = await paymentService.updatePayment(id, (userData as any).id, body)
    return NextResponse.json(payment)
  } catch (error) {
    console.error("[v0] Update payment error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await paymentService.deletePayment(id, (userData as any).id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete payment error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
