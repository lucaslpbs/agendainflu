import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { createReviewSchema } from '@/lib/schemas'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const influencer_id = searchParams.get('influencer_id')

    if (!influencer_id || !UUID_REGEX.test(influencer_id)) {
      return NextResponse.json({ error: 'influencer_id obrigatório e deve ser um UUID válido' }, { status: 400 })
    }

    const { data, error } = await db
      .from('reviews')
      .select('rating, texto, criado_em, clients(nome)')
      .eq('influencer_id', influencer_id)
      .order('criado_em', { ascending: false })

    if (error) throw error

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const body = await req.json()
    const parsed = createReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { booking_id, rating, texto } = parsed.data

    // Verify booking exists, belongs to the authenticated client, and is concluido
    const { data: booking, error: bookingErr } = await db
      .from('bookings')
      .select('id, influencer_id, status, clients!inner(id, user_id)')
      .eq('id', booking_id)
      .maybeSingle()

    if (bookingErr) throw bookingErr

    if (!booking) {
      return NextResponse.json({ error: 'Booking não encontrado' }, { status: 404 })
    }

    const client = Array.isArray(booking.clients) ? booking.clients[0] : booking.clients as { id: string; user_id: string | null } | null

    if (!client || client.user_id !== auth.user_id) {
      return NextResponse.json({ error: 'Sem permissão para avaliar este booking' }, { status: 403 })
    }

    if (booking.status !== 'concluido') {
      return NextResponse.json({ error: 'Só é possível avaliar bookings com status concluído' }, { status: 422 })
    }

    // Check for duplicate review (UNIQUE constraint also protects, but return 409 with clear message)
    const { data: existing } = await db
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Já existe uma avaliação para este booking' }, { status: 409 })
    }

    const { data: review, error: insertErr } = await db
      .from('reviews')
      .insert({
        booking_id,
        client_id: client.id,
        influencer_id: booking.influencer_id,
        rating,
        texto: texto ?? null,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json(review, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
