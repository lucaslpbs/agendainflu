import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(req)
    const body = await req.json()
    const { checklist, notas } = body

    const checklistValues = Object.values(checklist || {})
    if (checklistValues.length === 0 || checklistValues.some(v => !v)) {
      return NextResponse.json({ error: 'Checklist incompleto — todos os itens devem ser marcados' }, { status: 400 })
    }

    const { data: inf, error } = await db
      .from('influencers')
      .update({ status: 'ativa', aprovado_em: new Date().toISOString() })
      .eq('id', params.id)
      .select('nome, whatsapp')
      .single()

    if (error) throw error

    await db.from('influencer_analysis' as any).upsert({
      influencer_id: params.id,
      checklist: checklist,
      notas: notas || null,
      aprovado_por: auth.user_id,
      resultado: 'aprovado',
      data_analise: new Date().toISOString(),
    } as any, { onConflict: 'influencer_id' })

    try {
      const webhookUrl = process.env.N8N_WEBHOOK_INFLUENCER_APROVADO
      if (webhookUrl && inf?.whatsapp) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento: 'influencer_aprovado',
            nome: inf.nome,
            whatsapp: inf.whatsapp,
          }),
        })
      }
    } catch (waErr) {
      console.error('[notify] influencer_aprovado:', waErr)
    }

    return NextResponse.json({ approved: true })
  } catch (e) {
    return apiError(e)
  }
}
