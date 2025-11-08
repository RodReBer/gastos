"use client"

import { PaymentForm } from "@/components/payments/payment-form"
import { useRouter } from "next/navigation"

export default function NewPaymentPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl">
      <PaymentForm
        onSuccess={() => {
          router.push("/dashboard/payments")
        }}
      />
    </div>
  )
}
