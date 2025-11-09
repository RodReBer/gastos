import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/invitations - Obtener invitaciones pendientes del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.user) {
      console.log("[Invitations] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Obtener el email del usuario actual desde Auth0
    const userEmail = session.user.email?.toLowerCase()
    
    if (!userEmail) {
      console.log("[Invitations] No user email found")
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    console.log("[Invitations] Checking invitations for:", userEmail)

    // También intentar obtener el email de la tabla users
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("auth0_id", session.user.sub)
      .single()

    const dbEmail = (userData as any)?.email?.toLowerCase()
    console.log("[Invitations] DB email:", dbEmail)

    // Buscar invitaciones por ambos emails (Auth0 y DB)
    const emailsToCheck = [userEmail]
    if (dbEmail && dbEmail !== userEmail) {
      emailsToCheck.push(dbEmail)
    }

    console.log("[Invitations] Searching for emails:", emailsToCheck)

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
      .in("email", emailsToCheck)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Invitations] Database error:", error)
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      )
    }

    console.log("[Invitations] Found:", invitations?.length || 0, "invitations")

    return NextResponse.json(invitations || [], { status: 200 })
  } catch (error: any) {
    console.error("[Invitations] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
