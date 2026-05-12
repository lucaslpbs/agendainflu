import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { key: 'auth-logout', limit: 10, windowMs: 60_000 })
  if (rl) return rl
  const res = NextResponse.json({ ok: true })
  res.cookies.set('auth-token', '', { maxAge: 0, path: '/' })
  return res
}
