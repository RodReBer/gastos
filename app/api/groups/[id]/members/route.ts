import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/groups/[id]/members - Obtener miembros del grupo
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { id: groupId } = await params

    // Obtener el ID del usuario
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

    // Obtener todos los miembros con sus datos
    const { data: members, error } = await (supabase as any)
      .from("group_members")
      .select(`
        id,
        role,
        monthly_income,
        joined_at,
        user:users (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true })

    if (error) throw error

    return NextResponse.json(members || [])
  } catch (error: any) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
