"use client"

import { useState } from "react"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportSummary } from "@/components/reports/report-summary"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const queryString = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : ""

  const { data: reportData, isLoading } = useSWR(dateRange ? `/api/reports/summary${queryString}` : null, fetcher)

  const handleExport = async (format: "csv" | "json", range: { start: string; end: string }) => {
    setDateRange(range)
    setIsExporting(true)

    try {
      const response = await fetch(`/api/reports/export?start=${range.start}&end=${range.end}&format=${format}`)

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice-report-${range.start}-to-${range.end}.${format === "csv" ? "csv" : "json"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">Analyze your invoice and payment data</p>
      </div>

      <ReportFilters onExport={handleExport} isLoading={isExporting} />

      {reportData && <ReportSummary data={reportData} />}

      {!reportData && !isLoading && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">Select a date range to generate a report</p>
        </div>
      )}
    </div>
  )
}
