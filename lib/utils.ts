import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fetcher para SWR
export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include', // Incluir cookies
  })
  
  if (!res.ok) {
    const error: any = new Error('An error occurred while fetching the data.')
    
    try {
      error.info = await res.json()
    } catch {
      error.info = { error: 'Failed to parse error response' }
    }
    
    error.status = res.status
    throw error
  }
  
  return res.json()
}
