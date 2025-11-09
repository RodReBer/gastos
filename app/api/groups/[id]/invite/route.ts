import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// POST /api/groups/[id]/invite - Enviar invitación a un grupo
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const { id: groupId } = await params

    // Verificar que el usuario sea miembro del grupo
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userData as any).id

    const { data: membership } = await supabase
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

    // Verificar si el email ya tiene una invitación pendiente
    const { data: existingInvitation } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("group_id", groupId)
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: "This user already has a pending invitation" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya es miembro
    const { data: invitedUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (invitedUser) {
      const invitedUserId = (invitedUser as any).id

      const { data: existingMember } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", invitedUserId)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { error: "This user is already a member of this group" },
          { status: 400 }
        )
      }
    }

    // Crear la invitación
    const { data: invitation, error: invitationError } = await (
      supabase as any
    )
      .from("group_invitations")
      .insert({
        group_id: groupId,
        invited_by: userId,
        email: email.toLowerCase(),
        status: "pending",
      })
      .select()
      .single()

    if (invitationError) throw invitationError

    // TODO: Enviar email de notificación

    return NextResponse.json(invitation, { status: 201 })
  } catch (error: any) {
    console.error("Error sending invitation:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
