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
  category: string | null
  status: InvoiceStatus
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  name: string
  quantity: number
  unit_price: number
  category: string | null
  created_at: string
}

// Grupos de gastos compartidos
export interface ExpenseGroup {
  id: string
  name: string
  description: string | null
  created_by: string
  currency: string
  split_method: 'equal' | 'proportional'
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  monthly_income: number
  joined_at: string
  user?: User // Populated join
}

export interface GroupInvitation {
  id: string
  group_id: string
  invited_by: string
  invited_email: string
  invited_user_id: string | null
  status: 'pending' | 'accepted' | 'rejected'
  message: string | null
  created_at: string
  updated_at: string
  group?: ExpenseGroup // Populated join
  inviter?: User // Populated join
}

export interface GroupExpense {
  id: string
  group_id: string
  paid_by: string
  description: string
  amount: number
  currency: string
  expense_date: string
  category: string | null
  is_recurring: boolean
  recurrence_interval: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  recurrence_day: number | null
  next_occurrence: string | null
  invoice_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  payer?: User // Populated join
  splits?: ExpenseSplit[] // Populated join
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount_owed: number
  is_paid: boolean
  paid_at: string | null
  created_at: string
  user?: User // Populated join
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
