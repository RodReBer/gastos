import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { invoiceService } from "@/lib/services/invoice-service"

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

    const invoice = await invoiceService.getInvoice(id, (userData as any).id)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("[v0] Get invoice error:", error)
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

    const invoice = await invoiceService.updateInvoice(id, (userData as any).id, body)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("[v0] Update invoice error:", error)
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

    await invoiceService.deleteInvoice(id, (userData as any).id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete invoice error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
