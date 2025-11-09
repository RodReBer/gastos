import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// POST /api/invitations/[id]/reject - Rechazar una invitación
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
      .select("email")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userEmail = (userData as any).email

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

    // Actualizar la invitación como rechazada
    const { error: updateError } = await (supabase as any)
      .from("group_invitations")
      .update({
        status: "rejected",
        responded_at: new Date().toISOString(),
      })
      .eq("id", invitationId)

    if (updateError) throw updateError

    return NextResponse.json(
      { message: "Invitation rejected successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error rejecting invitation:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
