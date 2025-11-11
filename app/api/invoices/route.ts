import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { invoiceService } from "@/lib/services/invoice-service"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(req, 'api')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase.from("users").select("id").eq("auth0_id", session.user.sub).single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const invoices = await invoiceService.getInvoices((userData as any).id)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("[v0] Get invoices error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(req, 'api')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()

    // Get or create user
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    let userId = (userData as any)?.id

    if (!userId) {
      const { data: newUser } = await supabase
        .from("users")
        .insert([
          {
            auth0_id: session.user.sub,
            email: session.user.email,
            name: session.user.name,
          },
        ] as any)
        .select("id")
        .single()

      userId = (newUser as any)?.id
    }

    const body = await req.json()
    const invoice = await invoiceService.createInvoice(userId, body)

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("[v0] Create invoice error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
