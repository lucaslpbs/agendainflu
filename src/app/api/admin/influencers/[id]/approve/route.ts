import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    if (inf?.whatsapp) {
      await sendWhatsApp(inf.whatsapp, 'Parabens, ' + inf.nome + '! Seu perfil foi APROVADO no AgendaInflu! Acesse seu painel: ' + appUrl + '/painel')
    }

    return NextResponse.json({ approved: true })
  } catch (e) {
    return apiError(e)
  }
}
