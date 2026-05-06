import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { timingSafeEqual } from 'crypto'

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    // Compare against self to avoid timing leak on length mismatch
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || !cronSecret || !timingSafeCompare(cronSecret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: influencers } = await (db as any)
    .from('influencers')
    .select('id, instagram_user_id, instagram_access_token, instagram_token_expires_at')
    .eq('instagram_connected', true)

  if (!influencers?.length) {
    return NextResponse.json({ updated: 0, message: 'Nenhum influencer conectado' })
  }

  let updated = 0
  const errors: string[] = []
  const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)

  for (const inf of influencers) {
    const record = inf as any
    if (!record.instagram_user_id || !record.instagram_access_token) continue

    try {
      // Fetch current followers count
      const followersController = new AbortController()
      const followersTimeout = setTimeout(() => followersController.abort(), 10_000)
      const res = await fetch(
        `https://graph.instagram.com/${record.instagram_user_id}?` +
          new URLSearchParams({ fields: 'followers_count', access_token: record.instagram_access_token }),
        { signal: followersController.signal }
      )
      clearTimeout(followersTimeout)
      const data = await res.json()

      if (data.error) {
        if (data.error.code === 190) {
          await db.from('influencers').update({ instagram_connected: false } as any).eq('id', record.id)
        }
        errors.push(`${record.id}: ${data.error.message}`)
        continue
      }

      const patch: Record<string, unknown> = {
        instagram_followers_count: data.followers_count,
        instagram_followers_updated_at: new Date().toISOString(),
      }

      // Renew token if expiring within 10 days
      if (record.instagram_token_expires_at && new Date(record.instagram_token_expires_at) < tenDaysFromNow) {
        const refreshController = new AbortController()
        const refreshTimeout = setTimeout(() => refreshController.abort(), 10_000)
        const refreshRes = await fetch(
          'https://graph.instagram.com/refresh_access_token?' +
            new URLSearchParams({
              grant_type: 'ig_refresh_token',
              access_token: record.instagram_access_token,
            }),
          { signal: refreshController.signal }
        )
        clearTimeout(refreshTimeout)
        const refreshData = await refreshRes.json()
        if (!refreshData.error && refreshData.access_token) {
          patch.instagram_access_token = refreshData.access_token
          patch.instagram_token_expires_at = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      await db.from('influencers').update(patch as any).eq('id', record.id)
      updated++
    } catch (err) {
      errors.push(`${record.id}: ${String(err)}`)
    }
  }

  return NextResponse.json({ updated, total: influencers.length, errors })
}
