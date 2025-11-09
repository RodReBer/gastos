import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/invitations - Obtener invitaciones pendientes del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Obtener el email del usuario actual
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userEmail = (userData as any).email

    // Obtener invitaciones pendientes
    const { data: invitations, error } = await supabase
      .from("group_invitations")
      .select(
        `
        *,
        expense_groups (
          id,
          name,
          description,
          currency
        ),
        invited_by_user:users!group_invitations_invited_by_fkey (
          id,
          email,
          name
        )
      `
      )
      .eq("email", userEmail)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(invitations || [], { status: 200 })
  } catch (error: any) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
