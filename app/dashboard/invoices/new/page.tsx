"use client"

import { InvoiceForm } from "@/components/invoices/invoice-form"
import { useRouter } from "next/navigation"

export default function NewInvoicePage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl">
      <InvoiceForm
        onSuccess={() => {
          router.push("/dashboard/invoices")
        }}
      />
    </div>
  )
}
