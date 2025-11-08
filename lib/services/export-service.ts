// Export Service - SOLID Single Responsibility Pattern
import type { Invoice, Payment } from "@/lib/types"

class ExportService {
  // Export to CSV format
  exportToCSV(data: any[], filename: string): void {
    const headers = Object.keys(data[0] || {})
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    this.downloadFile(csv, filename, "text/csv")
  }

  // Export to JSON format
  exportToJSON(data: any[], filename: string): void {
    const json = JSON.stringify(data, null, 2)
    this.downloadFile(json, filename, "application/json")
  }

  // Generate PDF report
  generateInvoiceReport(invoices: Invoice[], payments: Payment[], dateRange: { start: string; end: string }): string {
    let report = `INVOICE REPORT\n`
    report += `Generated: ${new Date().toLocaleDateString()}\n`
    report += `Period: ${dateRange.start} to ${dateRange.end}\n\n`

    report += `=== INVOICES ===\n`
    report += `Total Invoices: ${invoices.length}\n`
    report += `Total Amount: $${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}\n\n`

    invoices.forEach((invoice) => {
      report += `Vendor: ${invoice.vendor_name}\n`
      report += `Amount: $${invoice.amount} ${invoice.currency}\n`
      report += `Date: ${invoice.invoice_date}\n`
      report += `Status: ${invoice.status}\n\n`
    })

    report += `\n=== PAYMENTS ===\n`
    report += `Total Payments: ${payments.length}\n`
    report += `Total Paid: $${payments.reduce((sum, pay) => sum + pay.amount_paid, 0).toFixed(2)}\n\n`

    payments.forEach((payment) => {
      report += `Type: ${payment.payment_type}\n`
      report += `Amount: $${payment.amount_paid}\n`
      report += `Date: ${payment.payment_date}\n`
      report += `Status: ${payment.status}\n\n`
    })

    return report
  }

  // Private helper to download file
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const exportService = new ExportService()
