import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now >= entry.resetAt) store.delete(key)
  })
}, 5 * 60 * 1000)

/**
 * In-memory sliding-window rate limiter.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 */
export function rateLimit(
  req: NextRequest,
  opts: { key: string; limit: number; windowMs: number }
): NextResponse | null {
  const now = Date.now()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const storeKey = `${opts.key}:${ip}`

  const entry = store.get(storeKey)

  if (!entry || now >= entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + opts.windowMs })
    return null
  }

  entry.count++

  if (entry.count > opts.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  return null
}
