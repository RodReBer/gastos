"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import type { Invoice } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye } from "lucide-react"

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useSWR("/api/invoices", fetcher)

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Facturas</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Gestiona tus facturas y pagos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/invoices/scan" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Escanear
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Facturas Recientes</CardTitle>
          <CardDescription className="text-xs md:text-sm">Todas tus facturas en un solo lugar</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-600">Cargando...</p>
          ) : invoices && invoices.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Proveedor</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Monto</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice: Invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900">{invoice.vendor_name}</td>
                        <td className="py-3 px-4 text-slate-900">
                          ${invoice.amount.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(invoice.invoice_date)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "partial"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {invoice.status === "paid" ? "Pagada" : invoice.status === "partial" ? "Parcial" : "Pendiente"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
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
                {invoices.map((invoice: Invoice) => (
                  <Card key={invoice.id} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{invoice.vendor_name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(invoice.invoice_date)}</p>
                        </div>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "partial"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {invoice.status === "paid" ? "Pagada" : invoice.status === "partial" ? "Parcial" : "Pendiente"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-slate-900">
                          ${invoice.amount.toFixed(2)} {invoice.currency}
                        </span>
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
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
            <p className="text-slate-600 text-sm">No hay facturas. Crea una para empezar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
