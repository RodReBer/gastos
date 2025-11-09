import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/groups/[id] - Obtener detalles de un grupo
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const groupId = params.id

    // Obtener el ID del usuario desde la tabla users
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth0_id", session.user.sub)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userData as any).id

    // Verificar que el usuario es miembro del grupo
    const { data: membership } = await (supabase as any)
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      )
    }

    // Obtener información del grupo
    const { data: group, error: groupError } = await (supabase as any)
      .from("expense_groups")
      .select("*")
      .eq("id", groupId)
      .single()

    if (groupError) throw groupError
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Obtener conteo de miembros
    const { count } = await (supabase as any)
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)

    return NextResponse.json({
      ...group,
      role: membership.role,
      member_count: count || 0,
    })
  } catch (error: any) {
    console.error("Error fetching group:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
