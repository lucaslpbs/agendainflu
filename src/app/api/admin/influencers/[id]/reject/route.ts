import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(req)
    const { motivo } = await req.json()

    if (!motivo) return NextResponse.json({ error: 'Motivo obrigatorio' }, { status: 400 })

    const { data: inf, error } = await db
      .from('influencers')
      .update({ status: 'rejeitada', observacoes_admin: motivo })
      .eq('id', params.id)
      .select('nome, whatsapp')
      .single()

    if (error) throw error

    await db.from('influencer_analysis' as any).upsert({
      influencer_id: params.id,
      notas: motivo,
      aprovado_por: auth.user_id,
      resultado: 'rejeitado',
      data_analise: new Date().toISOString(),
    } as any, { onConflict: 'influencer_id' })

    const supportWa = process.env.NEXT_PUBLIC_SUPPORT_WA || ''
    if (inf?.whatsapp) {
      await sendWhatsApp(inf.whatsapp, 'Ola, ' + inf.nome + '. Sua solicitacao foi analisada. Motivo: ' + motivo + '. Duvidas? Fale conosco: ' + supportWa)
    }

    return NextResponse.json({ rejected: true })
  } catch (e) {
    return apiError(e)
  }
}
