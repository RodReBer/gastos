import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id, monthly_income")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ monthly_income: (userData as any).monthly_income || 0 })
  } catch (error) {
    console.error("[v0] Get income error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { monthly_income } = await req.json()
    const supabase = getSupabaseAdminClient()

    // Update user income
    const { error } = await supabase
      .from("users")
      // @ts-expect-error - Supabase admin client type inference issue
      .update({ monthly_income })
      .eq("auth0_id", session.user.sub)

    if (error) throw error

    return NextResponse.json({ success: true, monthly_income })
  } catch (error) {
    console.error("[v0] Update income error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
