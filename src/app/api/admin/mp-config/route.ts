import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { data } = await db
      .from('platform_mp_config' as any)
      .select('mp_connected, mp_user_id, mp_connected_at, mp_token_expires_at')
      .eq('id', true)
      .maybeSingle()

    return NextResponse.json(data || { mp_connected: false })
  } catch (e) {
    return apiError(e)
  }
}
