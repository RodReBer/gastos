// OCR Service con Google Gemini - 100% GRATIS y super preciso
import { GoogleGenerativeAI } from "@google/generative-ai"

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export interface OCRResult {
  text: string
  confidence: number
  vendor?: string
  amount?: number
  date?: string
  invoiceNumber?: string
}

class OCRService {
  /**
   * Extrae información de una factura usando Gemini Vision (GRATIS!)
   * @param imageFile - Archivo de imagen (JPEG, PNG, WEBP)
   * @returns Datos extraídos de la factura
   */
  async extractFromImage(imageFile: File): Promise<OCRResult> {
    try {
      console.log('[OCR Gemini] 🚀 Iniciando análisis de imagen...')
      console.log('[OCR Gemini] 📄 Archivo:', imageFile.name, imageFile.type, imageFile.size)

      // Convertir File a formato que Gemini entiende
      const imageData = await this.fileToBase64(imageFile)
      
      // Usar Gemini 1.5 Flash (el más rápido y GRATIS)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `Eres un experto en procesar facturas y recibos. Analiza esta imagen y extrae la información en formato JSON.

Campos requeridos:
- vendor: Nombre del comercio/proveedor (string)
- amount: Monto total a pagar - SOLO EL NÚMERO, sin símbolos (number)
- date: Fecha en formato YYYY-MM-DD (string)
- invoiceNumber: Número de factura/recibo (string)
- description: Breve descripción de productos/servicios (string, máximo 150 caracteres)
- currency: Código de moneda (UYU, USD, EUR, ARS, BRL, etc.)

Reglas importantes:
- Para amount, extrae SOLO el total final a pagar (el número más grande)
- Si ves $, asume UYU (pesos uruguayos)
- Si ves U$S o US$, usa USD
- Si ves €, usa EUR
- Si un campo no está visible, usa un valor vacío "" o 0
- Responde SOLO con JSON válido, sin markdown, sin explicaciones

Ejemplo de respuesta esperada:
{
  "vendor": "Supermercado Ta-Ta",
  "amount": 1250.50,
  "date": "2025-11-08",
  "invoiceNumber": "FAC-00123",
  "description": "Compra de alimentos y productos de limpieza",
  "currency": "UYU"
}`

      // Analizar imagen
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: imageFile.type,
          },
        },
      ])

      const response = await result.response
      const text = response.text()
      
      console.log('[OCR Gemini] ✅ Respuesta recibida:', text.substring(0, 200))

      // Parsear JSON (limpiar si viene con markdown ```json```)
      let jsonString = text.trim()
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      const extracted = JSON.parse(jsonString)

      // Construir resultado
      const ocrResult: OCRResult = {
        text: `📄 Factura de ${extracted.vendor || 'Proveedor'}
📅 Fecha: ${extracted.date || 'N/A'}
🔢 Número: ${extracted.invoiceNumber || 'N/A'}
💰 Monto: ${extracted.currency || ''} ${extracted.amount || 0}
📝 ${extracted.description || ''}`,
        confidence: 0.95, // Gemini es muy preciso
        vendor: extracted.vendor || "",
        amount: parseFloat(extracted.amount) || 0,
        date: extracted.date || new Date().toISOString().split('T')[0],
        invoiceNumber: extracted.invoiceNumber || "",
      }

      console.log('[OCR Gemini] 🎉 Datos extraídos exitosamente:', ocrResult)
      return ocrResult

    } catch (error) {
      console.error('[OCR Gemini] ❌ Error:', error)
      
      // Si falla, dar un resultado por defecto
      return {
        text: "⚠️ Error al procesar la imagen. Por favor, verifica que sea una factura clara y vuelve a intentar.",
        confidence: 0,
        vendor: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: "",
      }
    }
  }

  /**
   * Convierte File a string base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Extraer solo la parte base64 (sin el prefijo data:image/...)
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  /**
   * Análisis simple de imagen (descripción general)
   */
  async analyzeImage(imageFile: File): Promise<string> {
    try {
      const imageData = await this.fileToBase64(imageFile)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent([
        "Describe brevemente qué ves en esta factura o recibo en español:",
        {
          inlineData: {
            data: imageData,
            mimeType: imageFile.type,
          },
        },
      ])

      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error al analizar imagen:", error)
      return "Error al procesar la imagen"
    }
  }
}

export const ocrService = new OCRService()
