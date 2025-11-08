import { getSession } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")
    const format = searchParams.get("format") || "csv"

    const supabase = getSupabaseAdminClient()

    // Get user ID
    const { data: userData } = await supabase.from("users").select("id").eq("auth0_id", session.user.sub).single()

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Fetch data
    let invoicesQuery = supabase.from("invoices").select("*").eq("user_id", (userData as any).id)

    if (startDate) invoicesQuery = invoicesQuery.gte("invoice_date", startDate)
    if (endDate) invoicesQuery = invoicesQuery.lte("invoice_date", endDate)

    const { data: invoices } = await invoicesQuery
    const { data: payments } = await supabase.from("payments").select("*").eq("user_id", (userData as any).id)

    // Format data for export
    const exportData = invoices || []

    // Create response
    const content = format === "csv" ? generateCSV(exportData) : JSON.stringify(exportData, null, 2)

    const mimeType = format === "csv" ? "text/csv" : "application/json"
    const filename = `invoices-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "json"}`

    return new NextResponse(content, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value
      })
      .join(","),
  )

  return [headers.join(","), ...rows].join("\n")
}
