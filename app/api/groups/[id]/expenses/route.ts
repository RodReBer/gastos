import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/groups/[id]/expenses - Listar gastos del grupo
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

    // Obtener gastos del grupo con información del pagador
    const { data: expenses, error } = await (supabase as any)
      .from("group_expenses")
      .select(`
        *,
        paid_by_user:users!group_expenses_paid_by_fkey (
          id,
          email,
          name
        ),
        invoice:invoices (
          id,
          vendor_name,
          amount
        )
      `)
      .eq("group_id", groupId)
      .order("expense_date", { ascending: false })

    if (error) throw error

    // Para cada gasto, obtener las divisiones
    const expensesWithSplits = await Promise.all(
      (expenses || []).map(async (expense: any) => {
        const { data: splits } = await (supabase as any)
          .from("expense_splits")
          .select(`
            *,
            user:users (
              id,
              email,
              name
            )
          `)
          .eq("expense_id", expense.id)

        return {
          ...expense,
          splits: splits || [],
        }
      })
    )

    return NextResponse.json(expensesWithSplits)
  } catch (error: any) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/groups/[id]/expenses - Crear nuevo gasto
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
    const body = await req.json()
    const {
      description,
      amount,
      expense_date,
      category,
      is_recurring,
      recurrence_interval,
      recurrence_day,
      invoice_id,
      notes,
    } = body

    if (!description || !amount || !expense_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

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

    // Obtener información del grupo
    const { data: group } = await (supabase as any)
      .from("expense_groups")
      .select("*")
      .eq("id", groupId)
      .single()

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Calcular next_occurrence si es recurrente
    let next_occurrence = null
    if (is_recurring && recurrence_interval) {
      const expenseDate = new Date(expense_date)
      switch (recurrence_interval) {
        case "daily":
          expenseDate.setDate(expenseDate.getDate() + 1)
          break
        case "weekly":
          expenseDate.setDate(expenseDate.getDate() + 7)
          break
        case "monthly":
          expenseDate.setMonth(expenseDate.getMonth() + 1)
          break
        case "yearly":
          expenseDate.setFullYear(expenseDate.getFullYear() + 1)
          break
      }
      next_occurrence = expenseDate.toISOString().split("T")[0]
    }

    // Crear el gasto
    const { data: expense, error: expenseError } = await (supabase as any)
      .from("group_expenses")
      .insert({
        group_id: groupId,
        paid_by: userId,
        description,
        amount,
        currency: group.currency,
        expense_date,
        category: category || null,
        is_recurring: is_recurring || false,
        recurrence_interval: recurrence_interval || null,
        recurrence_day: recurrence_day || null,
        next_occurrence,
        invoice_id: invoice_id || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (expenseError) throw expenseError

    // Obtener todos los miembros del grupo
    const { data: members } = await (supabase as any)
      .from("group_members")
      .select("user_id, monthly_income")
      .eq("group_id", groupId)

    if (!members || members.length === 0) {
      throw new Error("No members found in group")
    }

    // Calcular la división según el método del grupo
    // IMPORTANTE: El que pagó NO debe nada, los demás le deben su parte
    let splits: Array<{ user_id: string; amount_owed: number }> = []

    console.log('[Group Expense] Split method:', group.split_method)
    console.log('[Group Expense] Members with income:', members.map((m: any) => ({
      user_id: m.user_id,
      monthly_income: m.monthly_income
    })))

    if (group.split_method === "equal") {
      // División igual entre TODOS los miembros (incluyendo el que pagó)
      const amountPerPerson = amount / members.length
      splits = members.map((member: any) => ({
        user_id: member.user_id,
        amount_owed: amountPerPerson,
      }))
    } else if (group.split_method === "proportional") {
      // División proporcional según ingresos
      const totalIncome = members.reduce(
        (sum: number, m: any) => sum + (parseFloat(m.monthly_income) || 0),
        0
      )

      console.log('[Group Expense] Total income:', totalIncome)

      if (totalIncome === 0) {
        // Si no hay ingresos configurados, dividir igual
        console.log('[Group Expense] No income configured, falling back to equal split')
        const amountPerPerson = amount / members.length
        splits = members.map((member: any) => ({
          user_id: member.user_id,
          amount_owed: amountPerPerson,
        }))
      } else {
        // Dividir proporcionalmente
        splits = members.map((member: any) => {
          const memberIncome = parseFloat(member.monthly_income) || 0
          const proportion = memberIncome / totalIncome
          const amountOwed = amount * proportion
          console.log(`[Group Expense] Member ${member.user_id}: income=${memberIncome}, proportion=${proportion}, owes=${amountOwed}`)
          return {
            user_id: member.user_id,
            amount_owed: amountOwed,
          }
        })
      }
    } else {
      // Default to equal if method is not recognized
      const amountPerPerson = amount / members.length
      splits = members.map((member: any) => ({
        user_id: member.user_id,
        amount_owed: amountPerPerson,
      }))
    }

    // Insertar las divisiones
    // El que pagó tiene is_paid=true (ya cubrió su parte pagando el total)
    // Los demás tienen is_paid=false (le deben al que pagó)
    const { error: splitsError } = await (supabase as any)
      .from("expense_splits")
      .insert(
        splits.map((split) => ({
          expense_id: expense.id,
          user_id: split.user_id,
          amount_owed: split.amount_owed,
          is_paid: split.user_id === userId, // Solo el que pagó ya está cubierto
          paid_at: split.user_id === userId ? new Date().toISOString() : null,
        }))
      )

    if (splitsError) throw splitsError

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
