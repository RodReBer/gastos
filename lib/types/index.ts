// Domain Models - GRASP Responsibility
export interface User {
  id: string
  auth0_id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  vendor_name: string
  amount: number
  currency: string
  invoice_date: string
  invoice_number: string | null
  image_url: string | null
  extracted_text: string | null
  description: string | null
  status: InvoiceStatus
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  user_id: string
  payment_date: string
  payment_type: PaymentType
  amount_paid: number
  status: PaymentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  changes: Record<string, any> | null
  created_at: string
}

export type InvoiceStatus = "pending" | "partial" | "paid"
export type PaymentType = "cash" | "card" | "transfer" | "check" | "other"
export type PaymentStatus = "pending" | "completed" | "failed"
