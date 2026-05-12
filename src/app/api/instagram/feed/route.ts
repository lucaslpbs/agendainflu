import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const influencerId = url.searchParams.get('influencer_id')

  if (!influencerId) {
    return NextResponse.json({ error: 'influencer_id obrigatório' }, { status: 400 })
  }

  const { data: inf } = await db
    .from('influencers')
    .select('instagram_user_id, instagram_access_token, instagram_connected')
    .eq('id', influencerId)
    .maybeSingle()

  if (!inf?.instagram_connected || !inf?.instagram_access_token) {
    return NextResponse.json({ posts: [], connected: false })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const mediaRes = await fetch(
      `https://graph.instagram.com/${inf.instagram_user_id}/media?` +
        new URLSearchParams({
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          limit: '12',
          access_token: inf.instagram_access_token,
        }),
      { signal: controller.signal }
    )
    clearTimeout(timeout)
    const mediaData = await mediaRes.json()

    if (mediaData.error) {
      // Token expired — mark disconnected so we don't keep trying
      if (mediaData.error.code === 190) {
        await db
          .from('influencers')
          .update({ instagram_connected: false })
          .eq('id', influencerId)
      }
      return NextResponse.json({ posts: [], connected: false, error: mediaData.error.message })
    }

    return NextResponse.json(
      { posts: mediaData.data ?? [], connected: true },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    )
  } catch (err) {
    console.error('[Instagram Feed]', err)
    return NextResponse.json({ posts: [], connected: false })
  }
}
