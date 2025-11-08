"use client"

import { ScannerForm } from "@/components/invoices/scanner-form"
import { useRouter } from "next/navigation"

export default function ScanInvoicePage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl">
      <ScannerForm
        onSuccess={() => {
          router.push("/dashboard/invoices")
        }}
      />
    </div>
  )
}
