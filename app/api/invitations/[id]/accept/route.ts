import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// POST /api/invitations/[id]/accept - Aceptar una invitación
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
    const { id: invitationId } = await params

    // Obtener el usuario actual
    const { data: userData } = await supabase
      .from("users")
      .select("id, email, monthly_income")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userData as any).id
    const userEmail = (userData as any).email
    const userMonthlyIncome = parseFloat((userData as any).monthly_income || 0)

    // Obtener la invitación
    const { data: invitation } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("id", invitationId)
      .single()

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    const inv = invitation as any

    // Verificar que la invitación es para este usuario
    if (inv.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation is not for you" },
        { status: 403 }
      )
    }

    // Verificar que la invitación está pendiente
    if (inv.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation has already been processed" },
        { status: 400 }
      )
    }

    // Verificar que el usuario no es ya miembro
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", inv.group_id)
      .eq("user_id", userId)
      .single()

    if (existingMember) {
      // Actualizar la invitación como aceptada
      await (supabase as any)
        .from("group_invitations")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
        })
        .eq("id", invitationId)

      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      )
    }

    // Agregar al usuario como miembro del grupo
    const { error: memberError } = await (supabase as any)
      .from("group_members")
      .insert({
        group_id: inv.group_id,
        user_id: userId,
        role: "member",
        monthly_income: userMonthlyIncome, // Usar el ingreso del usuario
      })

    if (memberError) throw memberError

    // Actualizar la invitación
    const { error: updateError } = await (supabase as any)
      .from("group_invitations")
      .update({
        status: "accepted",
        responded_at: new Date().toISOString(),
      })
      .eq("id", invitationId)

    if (updateError) throw updateError

    return NextResponse.json(
      { message: "Invitation accepted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
