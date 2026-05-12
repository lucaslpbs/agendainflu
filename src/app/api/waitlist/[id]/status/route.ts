import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const { status, motivo } = await req.json()
    if (!status) return NextResponse.json({ error: 'status obrigatorio' }, { status: 400 })
    if (status === 'rejeitado' && !motivo) {
      return NextResponse.json({ error: 'Motivo obrigatorio para rejeicao' }, { status: 400 })
    }

    const { data: item } = await db
      .from('waitlist')
      .select('*')
      .eq('id', params.id)
      .eq('influencer_id', auth.influencer_id)
      .maybeSingle()

    if (!item) return NextResponse.json({ error: 'NOT_FOUND: Item nao encontrado' }, { status: 404 })

    await db
      .from('waitlist')
      .update({ status: status as any })
      .eq('id', params.id)

    let client_created = false
    if (status === 'aprovado') {
      await db
        .from('clients')
        .upsert({
          influencer_id: auth.influencer_id,
          nome: item.nome,
          whatsapp: item.whatsapp,
          email: item.email || null,
          empresa: item.empresa || null,
          status: 'ativo',
          origem: 'site',
        }, { onConflict: 'influencer_id,whatsapp' })
      client_created = true

      const { data: inf } = await db
        .from('influencers')
        .select('nome, username')
        .eq('id', auth.influencer_id)
        .maybeSingle()

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      try {
        await sendWhatsApp(item.whatsapp, 'Boa noticia, ' + item.nome + '! Voce foi aprovado(a) para agendar com ' + (inf?.nome || 'a influenciadora') + '! Acesse: ' + appUrl + '/' + (inf?.username || ''))
      } catch (waErr) {
        console.error('WhatsApp notification failed (waitlist approval):', waErr)
      }
    }

    return NextResponse.json({ updated: true, client_created })
  } catch (e) {
    return apiError(e)
  }
}
