// Invoice Service - SOLID Single Responsibility, GRASP Responsibility
import type { Invoice } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

class InvoiceService {
  async getInvoices(userId: string): Promise<Invoice[]> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getInvoice(id: string, userId: string): Promise<Invoice> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from("invoices").select("*").eq("id", id).eq("user_id", userId).single()

    if (error) throw error
    return data
  }

  async createInvoice(userId: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("invoices")
      .insert([{ user_id: userId, ...invoice }] as any)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateInvoice(id: string, userId: string, updates: Partial<Invoice>): Promise<Invoice> {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("invoices")
      // @ts-expect-error - Supabase admin client type inference issue
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteInvoice(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", userId)

    if (error) throw error
  }
}

export const invoiceService = new InvoiceService()
