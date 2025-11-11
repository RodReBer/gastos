"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"
import type { Invoice } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useSWR("/api/invoices", fetcher)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  const filteredAndSortedInvoices = useMemo(() => {
    if (!invoices) return []
    
    let filtered = [...invoices]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((invoice: Invoice) => 
        invoice.vendor_name.toLowerCase().includes(query) ||
        invoice.invoice_number?.toLowerCase().includes(query) ||
        invoice.amount.toString().includes(query)
      )
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice: Invoice) => invoice.status === statusFilter)
    }
    
    filtered.sort((a: Invoice, b: Invoice) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
        case "date-asc":
          return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime()
        case "amount-desc":
          return b.amount - a.amount
        case "amount-asc":
          return a.amount - b.amount
        case "vendor":
          return a.vendor_name.localeCompare(b.vendor_name)
        default:
          return 0
      }
    })
    
    return filtered
  }, [invoices, searchQuery, statusFilter, sortBy])

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

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por proveedor, número o monto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
                <SelectItem value="amount-desc">Monto (mayor a menor)</SelectItem>
                <SelectItem value="amount-asc">Monto (menor a mayor)</SelectItem>
                <SelectItem value="vendor">Proveedor (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Facturas Recientes</CardTitle>
          <CardDescription className="text-xs md:text-sm">Todas tus facturas en un solo lugar</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-600">Cargando...</p>
          ) : filteredAndSortedInvoices && filteredAndSortedInvoices.length > 0 ? (
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
                    {filteredAndSortedInvoices.map((invoice: Invoice) => (
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
                {filteredAndSortedInvoices.map((invoice: Invoice) => (
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
          ) : invoices && invoices.length > 0 ? (
            <p className="text-slate-600 text-sm">No se encontraron facturas con los filtros aplicados.</p>
          ) : (
            <p className="text-slate-600 text-sm">No hay facturas. Crea una para empezar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
