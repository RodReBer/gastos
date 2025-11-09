import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// POST /api/groups/[id]/leave - Salir del grupo
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

    // Verificar si hay deudas pendientes
    const { data: unpaidSplits } = await (supabase as any)
      .from("expense_splits")
      .select(`
        *,
        expense:group_expenses!inner(group_id)
      `)
      .eq("user_id", userId)
      .eq("is_paid", false)
      .eq("expense.group_id", groupId)

    if (unpaidSplits && unpaidSplits.length > 0) {
      return NextResponse.json(
        { error: "No podés salir del grupo con deudas pendientes" },
        { status: 400 }
      )
    }

    // Verificar si es el único admin
    const { data: admins } = await (supabase as any)
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("role", "admin")

    if (admins && admins.length === 1 && admins[0].user_id === userId) {
      // Es el único admin, verificar si hay otros miembros
      const { data: members } = await (supabase as any)
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId)

      if (members && members.length > 1) {
        return NextResponse.json(
          { error: "Asigná otro admin antes de salir del grupo" },
          { status: 400 }
        )
      }
    }

    // Eliminar al usuario del grupo
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error leaving group:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
