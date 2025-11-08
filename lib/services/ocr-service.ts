// OCR Service - SOLID Single Responsibility Pattern
import Tesseract from "tesseract.js"
import { OCR_CONFIG } from "@/lib/constants"

interface OCRResult {
  text: string
  confidence: number
  vendor?: string
  amount?: number
  date?: string
  invoiceNumber?: string
}

class OCRService {
  async extractFromImage(imageFile: File): Promise<OCRResult> {
    try {
      console.log('[OCR] Starting OCR process...')
      console.log('[OCR] File:', imageFile.name, imageFile.type, imageFile.size)
      
      const reader = new FileReader()

      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const imageData = e.target?.result as string
            console.log('[OCR] Image loaded, starting Tesseract...')

            const result = await Tesseract.recognize(imageData, 'eng+spa', {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`)
                }
              },
            })

            const text = result.data.text
            const confidence = result.data.confidence / 100

            console.log('[OCR] Text extracted:', text.substring(0, 200) + '...')
            console.log('[OCR] Confidence:', confidence)

            // Extract vendor name (first non-empty line, usually the business name)
            const lines = text.split('\n').filter(line => line.trim().length > 3)
            const vendor = lines[0]?.trim().substring(0, 100) // Limit to 100 chars

            // Extract amount - looks for patterns like: $123.45, 123.45, $1,234.56
            const amountPatterns = [
              /(?:total|amount|subtotal|balance)[\s:]*[$€£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
              /[$€£]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/g,
              /\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/g
            ]
            
            let amount: number | undefined
            for (const pattern of amountPatterns) {
              const matches = text.match(pattern)
              if (matches && matches.length > 0) {
                // Get the last match (usually the total)
                const lastMatch = matches[matches.length - 1]
                const numberMatch = lastMatch.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/)
                if (numberMatch) {
                  amount = parseFloat(numberMatch[1].replace(/,/g, ''))
                  break
                }
              }
            }

            // Extract date - multiple formats
            const datePatterns = [
              /(?:date|fecha)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi,
              /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g,
              /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/g,
              /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi
            ]
            
            let date: string | undefined
            for (const pattern of datePatterns) {
              const match = text.match(pattern)
              if (match) {
                date = match[0].replace(/^(date|fecha)[\s:]*/gi, '').trim()
                break
              }
            }

            // Extract invoice number
            const invoicePatterns = [
              /(?:invoice|factura|#)[\s#:]*([A-Z0-9-]+)/gi,
              /(?:no|num|number)[\s.#:]*([A-Z0-9-]+)/gi
            ]
            
            let invoiceNumber: string | undefined
            for (const pattern of invoicePatterns) {
              const match = text.match(pattern)
              if (match && match[0]) {
                invoiceNumber = match[0].replace(/^(invoice|factura|no|num|number)[\s.#:]*/gi, '').trim()
                if (invoiceNumber.length > 3 && invoiceNumber.length < 50) {
                  break
                }
              }
            }

            console.log('[OCR] Extracted - Vendor:', vendor, 'Amount:', amount, 'Date:', date, 'Invoice#:', invoiceNumber)

            resolve({
              text: `Vendor: ${vendor || 'N/A'}\nAmount: ${amount || 'N/A'}\nDate: ${date || 'N/A'}\nInvoice: ${invoiceNumber || 'N/A'}`,
              confidence,
              amount,
              date,
              vendor,
              invoiceNumber,
            })
          } catch (error) {
            console.error('[OCR] Recognition error:', error)
            reject(new Error('Failed to scan document. Please try again.'))
          }
        }

        reader.onerror = () => {
          console.error('[OCR] File read error')
          reject(new Error("Failed to read file"))
        }
        
        reader.readAsDataURL(imageFile)
      })
    } catch (error) {
      console.error("[OCR] Error:", error)
      throw new Error('OCR processing failed. Please try again.')
    }
  }
}

export const ocrService = new OCRService()
