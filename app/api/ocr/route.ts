// API Route para OCR con Gemini (server-side)
import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSession } from "@/lib/auth/session"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[OCR API] 🚀 Procesando archivo:", file.name, file.type, file.size)

    // Convertir a base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Usar Gemini 2.5 Flash (modelo actual con visión)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    })

    const prompt = `Eres un experto en procesar facturas y recibos. Analiza esta imagen y extrae la información en formato JSON.

Campos requeridos:
- vendor: Nombre del comercio/proveedor (string)
- amount: Monto total a pagar - SOLO EL NÚMERO, sin símbolos (number)
- date: Fecha en formato YYYY-MM-DD (string)
- invoiceNumber: Número de factura/recibo (string)
- description: Breve descripción de productos/servicios (string, máximo 150 caracteres)
- currency: Código de moneda (UYU, USD, EUR, ARS, BRL, etc.)
- category: Categoría principal del gasto (string)
- items: Array de productos/servicios con {name, quantity, unit_price, category}

Categorías válidas: food, tech, transport, entertainment, health, clothing, home, services, utilities, education, other

Reglas importantes:
- Para amount, extrae SOLO el total final a pagar (el número más grande)
- Si ves $, asume UYU (pesos uruguayos)
- Si ves U$S o US$, usa USD
- Si ves €, usa EUR
- Categoriza según el tipo de establecimiento y productos
- Extrae todos los items/productos visibles con sus cantidades y precios
- Si un campo no está visible, usa un valor vacío "" o 0
- Responde SOLO con JSON válido, sin markdown, sin explicaciones

Ejemplo de respuesta esperada:
{
  "vendor": "Supermercado Ta-Ta",
  "amount": 1250.50,
  "date": "2025-11-08",
  "invoiceNumber": "FAC-00123",
  "description": "Compra de alimentos y productos de limpieza",
  "currency": "UYU",
  "category": "food",
  "items": [
    {"name": "Pan integral", "quantity": 2, "unit_price": 120, "category": "food"},
    {"name": "Leche", "quantity": 1, "unit_price": 180, "category": "food"},
    {"name": "Detergente", "quantity": 1, "unit_price": 250, "category": "home"}
  ]
}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    console.log("[OCR API] ✅ Respuesta de Gemini:", text.substring(0, 200))

    // Parsear JSON
    let jsonString = text.trim()
    jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    const extracted = JSON.parse(jsonString)

    // Retornar resultado
    return NextResponse.json({
      success: true,
      data: {
        text: `📄 Factura de ${extracted.vendor || "Proveedor"}
 Fecha: ${extracted.date || "N/A"}
 Número: ${extracted.invoiceNumber || "N/A"}
 Monto: ${extracted.currency || ""} ${extracted.amount || 0}
 Categoría: ${extracted.category || "other"}
 ${extracted.description || ""}${extracted.items && extracted.items.length > 0 ? `\n\n Items (${extracted.items.length}):` + extracted.items.map((item: any) => `\n  • ${item.name} (x${item.quantity || 1}) - ${item.unit_price || 0}`).join('') : ''}`,
        confidence: 0.95,
        vendor: extracted.vendor || "",
        amount: parseFloat(extracted.amount) || 0,
        date: extracted.date || new Date().toISOString().split("T")[0],
        invoiceNumber: extracted.invoiceNumber || "",
        category: extracted.category || "other",
        items: extracted.items || [],
      },
    })
  } catch (error) {
    console.error("[OCR API] ❌ Error:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
