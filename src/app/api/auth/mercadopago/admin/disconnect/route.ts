import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)

    await db
      .from('platform_mp_config' as any)
      .update({
        mp_access_token: null,
        mp_refresh_token: null,
        mp_user_id: null,
        mp_token_expires_at: null,
        mp_connected_at: null,
        mp_connected: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', true)

    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
