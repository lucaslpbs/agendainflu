/**
 * POST /api/auth/register/influencer
 * Chamado APÓS supabase.auth.signUp no cliente.
 * Cria o perfil de influencer e insere o role.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, nome, username: rawUsername, whatsapp, bio, nicho, seguidores, instagram, foto_url, email } = body

    if (!user_id || !nome || !whatsapp) {
      return NextResponse.json({ error: 'user_id, nome e whatsapp são obrigatórios' }, { status: 400 })
    }

    // Sanitizar username
    const username = (rawUsername || nome)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9._]/g, '')
      + Math.floor(Math.random() * 100)

    // Verificar unicidade do username
    const { data: existing } = await db
      .from('influencers')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'CONFLICT: Username já em uso' }, { status: 409 })
    }

    // Criar perfil de influencer
    const { data: inf, error: infError } = await db
      .from('influencers')
      .insert({
        user_id,
        username,
        nome,
        bio: bio || null,
        nicho: nicho || null,
        seguidores: seguidores || null,
        foto_url: foto_url || null,
        instagram: instagram || null,
        whatsapp,
        status: 'em_analise',
      })
      .select('id')
      .single()

    if (infError) throw infError

    // Inserir role
    await db.from('user_roles').insert({ user_id, role: 'influencer' })

    // Notificar admin via WhatsApp
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    await sendWhatsApp(
      process.env.NEXT_PUBLIC_SUPPORT_WA || '',
      `🔔 Nova influenciadora cadastrada!\nNome: ${nome}\nUsername: @${username}\nWhatsApp: ${whatsapp}\nAcesse: ${appUrl}/admin/influenciadoras`
    )

    return NextResponse.json(
      { message: 'Cadastro recebido! Aguarde análise da equipe.', influencer_id: inf.id },
      { status: 201 }
    )
  } catch (e) {
    return apiError(e)
  }
}
