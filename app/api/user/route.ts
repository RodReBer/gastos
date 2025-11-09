import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/user - Obtener información del usuario actual
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Obtener datos del usuario
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, monthly_income, created_at, updated_at")
      .eq("auth0_id", session.user.sub)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[User API] GET error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// PATCH /api/user - Actualizar información del usuario
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = await req.json()
    const { monthly_income, name, avatar_url } = body

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

    // Preparar datos a actualizar
    const updateData: any = {}
    if (monthly_income !== undefined) updateData.monthly_income = monthly_income
    if (name !== undefined) updateData.name = name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Actualizar el usuario
    const { data: updatedUser, error: updateError } = await (supabase as any)
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (updateError) throw updateError

    // Si se actualizó monthly_income, también actualizar group_members
    if (monthly_income !== undefined) {
      const { error: groupMembersError } = await (supabase as any)
        .from("group_members")
        .update({ monthly_income })
        .eq("user_id", userId)

      if (groupMembersError) {
        console.error("Error updating group_members income:", groupMembersError)
        // No lanzar error, solo log
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[User API] PATCH error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
