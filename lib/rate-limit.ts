import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

const RATE_LIMITS = {
  default: { requests: 100, window: 60 * 1000 },
  ocr: { requests: 10, window: 60 * 1000 },
  api: { requests: 50, window: 60 * 1000 },
}

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `${ip}-${request.nextUrl.pathname}`
}

function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

export function rateLimit(
  request: NextRequest,
  limitType: keyof typeof RATE_LIMITS = 'default'
): NextResponse | null {
  cleanupExpiredEntries()
  
  const clientId = getClientId(request)
  const limit = RATE_LIMITS[limitType]
  const now = Date.now()
  
  const clientData = rateLimitStore.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + limit.window,
    })
    return null
  }
  
  if (clientData.count >= limit.requests) {
    const retryAfter = Math.ceil((clientData.resetTime - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
        },
      }
    )
  }
  
  clientData.count++
  return null
}
