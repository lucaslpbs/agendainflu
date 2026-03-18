import { NextRequest } from 'next/server'
import { verifyJWT, type JWTPayload } from './jwt'

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const header = req.headers.get('authorization') || ''
    const cookieToken = req.cookies.get('auth-token')?.value || ''
    const token = header.replace('Bearer ', '').trim() || cookieToken
    if (!token) return null
    return await verifyJWT(token)
  } catch {
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getAuthUser(req)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireInfluencer(req: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(req)
  if (user.role !== 'influencer' && user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}

export async function requireAdmin(req: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(req)
  if (user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}
