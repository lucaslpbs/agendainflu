import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { generateBookingCode } from '@/lib/booking-code'
import { sendWhatsApp } from '@/lib/wa'
import { format, addDays } from 'date-fns'
import { createBookingSchema } from '@/lib/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const rl = rateLimit(req, { key: `bookings:${auth.user_id}`, limit: 5, windowMs: 60_000 })
    if (rl) return rl
    const body = await req.json()
    const parsed = createBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { influencer_id, service_id, data_agendada, descricao_produto, link_negocio, material_url, observacoes } = parsed.data

    const materialUrls: string[] = Array.isArray(material_url) ? material_url : []
    const minDate = format(addDays(new Date(), 2), 'yyyy-MM-dd')
    if (data_agendada < minDate) {
      return NextResponse.json({ error: 'Agendamento minimo com 2 dias de antecedencia' }, { status: 400 })
    }

    // Fetch client profile and influencer info in parallel (combines lookups)
    const [cpResult, infResult] = await Promise.all([
      db.from('client_profiles' as any)
        .select('whatsapp, nome, razao_social')
        .eq('user_id', auth.user_id)
        .maybeSingle(),
      db.from('influencers')
        .select('nome, whatsapp, username')
        .eq('id', influencer_id)
        .maybeSingle(),
    ])

    const cp = cpResult.data
    const inf = infResult.data
    const clientWa: string = (cp as any)?.whatsapp || ''

    // Atomic client upsert via RPC — prevents duplicate clients from concurrent requests
    const { data: clientResult, error: clientErr } = await db.rpc('upsert_booking_client', {
      p_influencer_id: influencer_id,
      p_user_id: auth.user_id,
      p_nome: (cp as any)?.nome || auth.email?.split('@')[0] || 'Cliente',
      p_whatsapp: clientWa,
      p_email: auth.email || '',
      p_empresa: (cp as any)?.razao_social || null,
      p_status: 'espera',
      p_origem: 'site',
    })
    if (clientErr) throw clientErr

    const clientRow = clientResult as { id: string; nome: string; empresa: string; status: string }
    const client_id = clientRow.id

    const codigo_confirmacao = await generateBookingCode()

    // Atomic booking creation via RPC — prevents overbooking with row-level locking
    const { data: bookingResult, error: bkErr } = await db.rpc('create_booking_atomic', {
      p_influencer_id: influencer_id,
      p_client_id: client_id,
      p_service_id: service_id,
      p_data_agendada: data_agendada,
      p_codigo_confirmacao: codigo_confirmacao,
      p_descricao_produto: descricao_produto || null,
      p_link_negocio: link_negocio || null,
      p_material_url: materialUrls.length > 0 ? materialUrls : null,
      p_observacoes: observacoes || null,
      p_status: clientRow.status === 'ativo' ? 'confirmado' : 'pendente',
    })

    if (bkErr) {
      if (bkErr.message?.includes('DATE_UNAVAILABLE')) {
        return NextResponse.json({ error: 'Data nao disponivel para este servico' }, { status: 409 })
      }
      if (bkErr.message?.includes('NOT_FOUND')) {
        return NextResponse.json({ error: 'NOT_FOUND: Servico nao encontrado' }, { status: 404 })
      }
      throw bkErr
    }

    const booking = bookingResult as {
      id: string; codigo_confirmacao: string; status: string; data_agendada: string;
      service_tipo: string; service_formato: string; service_preco: number;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const clientNome = clientRow.nome || (cp as any)?.nome || 'Cliente'
    const clientEmpresa = clientRow.empresa || (cp as any)?.razao_social || ''
    const dataFormatada = new Date(data_agendada + 'T12:00:00').toLocaleDateString('pt-BR')
    const valorFormatado = 'R$ ' + Number(booking.service_preco).toFixed(2)

    try {
      await Promise.all([
        clientWa ? sendWhatsApp(clientWa, 'Pedido recebido, ' + clientNome + '! Agendamento com ' + inf?.nome + ' registrado. Data: ' + dataFormatada + ' | Servico: ' + booking.service_tipo + ' | Valor: ' + valorFormatado + ' | Codigo: ' + codigo_confirmacao) : Promise.resolve(false),
        inf?.whatsapp ? sendWhatsApp(inf.whatsapp, 'Novo agendamento! ' + clientNome + ' | ' + clientEmpresa + ' | ' + booking.service_tipo + ' | ' + dataFormatada + ' | ' + valorFormatado + ' | ' + appUrl + '/painel/agendamentos') : Promise.resolve(false),
      ])
    } catch (waErr) {
      console.error('WhatsApp notification failed (booking creation):', waErr)
    }

    try {
      const webhookUrl = process.env.N8N_WEBHOOK_NOVO_AGENDAMENTO
      if (webhookUrl && inf?.whatsapp) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento: 'novo_agendamento',
            influencer_nome: inf.nome,
            influencer_whatsapp: inf.whatsapp,
            cliente_nome: clientNome,
            cliente_empresa: clientEmpresa,
            servico_tipo: booking.service_tipo,
            data_agendada: dataFormatada,
            valor: valorFormatado,
            codigo: codigo_confirmacao,
          }),
        })
      }
    } catch (waErr) {
      console.error('[notify] novo_agendamento:', waErr)
    }

    const wa_link = inf?.whatsapp
      ? 'https://wa.me/' + inf.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent('Ola ' + inf.nome + '! Codigo: ' + codigo_confirmacao)
      : null

    return NextResponse.json({
      booking: {
        id: booking.id,
        codigo_confirmacao: booking.codigo_confirmacao,
        status: booking.status,
        data_agendada: booking.data_agendada,
      },
      wa_link,
      mensagens_enviadas: true,
    }, { status: 201 })
  } catch (e) {
    console.error('[POST /api/bookings] Error:', e)
    return apiError(e)
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer nao encontrado' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')

    const pagination = parsePagination(req, { sort: 'data_agendada', order: 'asc' })
    const offset = (pagination.page - 1) * pagination.limit

    let countQuery = db
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('influencer_id', auth.influencer_id)

    let dataQuery = db
      .from('bookings')
      .select('*, clients(*), services(*)')
      .eq('influencer_id', auth.influencer_id)
      .order(pagination.sort || 'data_agendada', { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    if (status) {
      countQuery = countQuery.eq('status', status as any)
      dataQuery = dataQuery.eq('status', status as any)
    }
    if (data_inicio) {
      countQuery = countQuery.gte('data_agendada', data_inicio)
      dataQuery = dataQuery.gte('data_agendada', data_inicio)
    }
    if (data_fim) {
      countQuery = countQuery.lte('data_agendada', data_fim)
      dataQuery = dataQuery.lte('data_agendada', data_fim)
    }

    const [countRes, dataRes] = await Promise.all([countQuery, dataQuery])
    if (dataRes.error) throw dataRes.error

    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}
