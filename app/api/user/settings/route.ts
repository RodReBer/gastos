import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()

    // Get user settings
    const { data: userData } = await supabase
      .from("users")
      .select("language, currency")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ 
      language: (userData as any).language || "es",
      currency: (userData as any).currency || "UYU"
    })
  } catch (error) {
    console.error("[v0] Get settings error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { language, currency } = await req.json()
    const supabase = getSupabaseAdminClient()

    // Update user settings
    const { error } = await (supabase
      .from("users")
      .update({ language, currency } as any) as any)
      .eq("auth0_id", session.user.sub)

    if (error) throw error

    return NextResponse.json({ success: true, language, currency })
  } catch (error) {
    console.error("[v0] Update settings error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
