import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET - Listar grupos del usuario
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Obtener grupos donde el usuario es miembro
    const { data: memberships, error: memberError } = await supabase
      .from("group_members")
      .select(`
        *,
        expense_groups (*)
      `)
      .eq("user_id", session.user.sub)

    if (memberError) throw memberError

    // Formatear respuesta
    const groups = memberships?.map((m: any) => ({
      ...m.expense_groups,
      role: m.role,
      member_id: m.id
    })) || []

    return NextResponse.json({ success: true, groups })
  } catch (error) {
    console.error("[Groups API] Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo grupo
export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, currency, split_method } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

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

    // Crear el grupo
    const { data: group, error: groupError } = await supabase
      .from("expense_groups")
      // @ts-expect-error - Supabase type inference issue
      .insert({
        name,
        description: description || null,
        created_by: userId,
        currency: currency || "UYU",
        split_method: split_method || "equal",
      })
      .select()
      .single()

    if (groupError) throw groupError

    const groupId = (group as any).id

    // Agregar al creador como admin del grupo
    const { error: memberError } = await supabase
      .from("group_members")
      // @ts-expect-error - Supabase type inference issue
      .insert({
        group_id: groupId,
        user_id: userId,
        role: "admin",
        monthly_income: 0,
      })

    if (memberError) throw memberError

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error("[Groups API] Create error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
