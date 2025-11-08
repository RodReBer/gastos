import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { reportService } from "@/lib/services/report-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase.from("users").select("id").eq("auth0_id", session.user.sub).single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const summary = await reportService.generateSummary((userData as any).id, startDate || undefined, endDate || undefined)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[v0] Report summary error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
