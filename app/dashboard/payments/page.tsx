"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import type { Payment } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye } from "lucide-react"

export default function PaymentsPage() {
  const { data: payments, isLoading } = useSWR("/api/payments", fetcher)

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Pagos</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Seguimiento de todos tus pagos</p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Pago
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Historial de Pagos</CardTitle>
          <CardDescription className="text-xs md:text-sm">Todos los pagos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-600">Cargando...</p>
          ) : payments && payments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Monto</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment: Payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900 capitalize">{payment.payment_type}</td>
                        <td className="py-3 px-4 text-slate-900">${payment.amount_paid.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(payment.payment_date)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {payment.status === "completed" ? "Completado" : payment.status === "pending" ? "Pendiente" : "Fallido"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/payments/${payment.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {payments.map((payment: Payment) => (
                  <Card key={payment.id} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 capitalize">{payment.payment_type}</h3>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(payment.payment_date)}</p>
                        </div>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {payment.status === "completed" ? "Completado" : payment.status === "pending" ? "Pendiente" : "Fallido"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-slate-900">
                          ${payment.amount_paid.toFixed(2)}
                        </span>
                        <Link href={`/dashboard/payments/${payment.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-600 text-sm">No hay pagos registrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
