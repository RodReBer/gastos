// Blob Storage Service - SOLID Single Responsibility
import { put } from "@vercel/blob"

class BlobService {
  async uploadInvoiceImage(file: File, userId: string): Promise<string> {
    try {
      const filename = `invoices/${userId}/${Date.now()}-${file.name}`

      const blob = await put(filename, file, {
        access: "private",
      })

      return blob.url
    } catch (error) {
      console.error("[v0] Blob upload error:", error)
      throw error
    }
  }

  async deleteInvoiceImage(url: string): Promise<void> {
    try {
      // Vercel Blob delete logic if needed
      console.log("[v0] Deleting blob:", url)
    } catch (error) {
      console.error("[v0] Blob delete error:", error)
      throw error
    }
  }
}

export const blobService = new BlobService()
