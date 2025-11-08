// Application Constants - SOLID Single Responsibility
export const PAYMENT_TYPES = {
  CASH: "cash",
  CARD: "card",
  TRANSFER: "transfer",
  CHECK: "check",
  OTHER: "other",
} as const

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: "payment_types.cash",
  card: "payment_types.card",
  transfer: "payment_types.transfer",
  check: "payment_types.check",
  other: "payment_types.other",
}

export const INVOICE_STATUSES = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
} as const

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: "invoice_statuses.pending",
  partial: "invoice_statuses.partial",
  paid: "invoice_statuses.paid",
}

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "payment_statuses.pending",
  completed: "payment_statuses.completed",
  failed: "payment_statuses.failed",
}

export const CURRENCIES = {
  UYU: "UYU",
  USD: "USD",
  EUR: "EUR",
  MXN: "MXN",
  COP: "COP",
  ARS: "ARS",
  BRL: "BRL",
} as const

export const OCR_CONFIG = {
  MIN_CONFIDENCE: 0.5,
  TIMEOUT: 30000, // 30 seconds
  LANGUAGES: ["eng", "spa"], // English and Spanish
}

export const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FORMATS: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
}

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CALLBACK: "/api/auth/callback",
  },
  INVOICES: {
    LIST: "/api/invoices",
    CREATE: "/api/invoices",
    GET: (id: string) => `/api/invoices/${id}`,
    UPDATE: (id: string) => `/api/invoices/${id}`,
    DELETE: (id: string) => `/api/invoices/${id}`,
    UPLOAD: "/api/invoices/upload",
  },
  PAYMENTS: {
    LIST: "/api/payments",
    CREATE: "/api/payments",
    GET: (id: string) => `/api/payments/${id}`,
    UPDATE: (id: string) => `/api/payments/${id}`,
    DELETE: (id: string) => `/api/payments/${id}`,
  },
  REPORTS: {
    EXPORT: "/api/reports/export",
    SUMMARY: "/api/reports/summary",
  },
} as const
