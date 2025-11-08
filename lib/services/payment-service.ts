// Payment Service - SOLID Single Responsibility
import type { Payment } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

class PaymentService {
  async getPayments(userId: string): Promise<Payment[]> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createPayment(userId: string, payment: Partial<Payment>): Promise<Payment> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("payments")
      .insert([{ user_id: userId, ...payment }] as any)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updatePayment(id: string, userId: string, updates: Partial<Payment>): Promise<Payment> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("payments")
      // @ts-expect-error - Supabase admin client type inference issue
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deletePayment(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from("payments").delete().eq("id", id).eq("user_id", userId)

    if (error) throw error
  }
}

export const paymentService = new PaymentService()
