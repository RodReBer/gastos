// OCR Service - Cliente que llama al API de Gemini
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
   * Extrae información de una factura usando Gemini Vision (via API)
   * @param imageFile - Archivo de imagen (JPEG, PNG, WEBP)
   * @returns Datos extraídos de la factura
   */
  async extractFromImage(imageFile: File): Promise<OCRResult> {
    try {
      console.log('[OCR Client] 🚀 Enviando imagen al servidor...')
      console.log('[OCR Client] 📄 Archivo:', imageFile.name, imageFile.type, imageFile.size)

      // Crear FormData con la imagen
      const formData = new FormData()
      formData.append('file', imageFile)

      // Llamar al API endpoint
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || 'Error al procesar imagen')
      }

      const result = await response.json()
      
      console.log('[OCR Client] ✅ Datos recibidos:', result.data)
      return result.data

    } catch (error) {
      console.error('[OCR Client] ❌ Error:', error)
      
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
   * Análisis simple de imagen (descripción general)
   */
  async analyzeImage(imageFile: File): Promise<string> {
    try {
      const result = await this.extractFromImage(imageFile)
      return result.text
    } catch (error) {
      console.error("Error al analizar imagen:", error)
      return "Error al procesar la imagen"
    }
  }
}

export const ocrService = new OCRService()
