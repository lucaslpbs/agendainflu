/**
 * POST /api/auth/register/influencer
 * Chamado APÓS supabase.auth.signUp no cliente.
 * Cria o perfil de influencer e insere o role.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'
import { registerInfluencerSchema } from '@/lib/schemas'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { key: 'auth-register', limit: 3, windowMs: 60_000 })
  if (rl) return rl

  try {
    const body = await req.json()
    const parsed = registerInfluencerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }
    const { user_id, nome, username: rawUsername, whatsapp, bio, nicho, seguidores, instagram, foto_url, email } = parsed.data

    // Prioridade: instagram handle > rawUsername > nome
    const instagramHandle = instagram
      ? instagram.replace('@', '').toLowerCase().replace(/[^a-z0-9._]/g, '')
      : null

    const baseUsername = instagramHandle || rawUsername || nome
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9._]/g, '')

    let username = baseUsername
    const { data: existingBase } = await db
      .from('influencers')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existingBase) {
      username = baseUsername + Math.floor(Math.random() * 100)
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
    try {
      await sendWhatsApp(
        process.env.NEXT_PUBLIC_SUPPORT_WA || '',
        `🔔 Nova influenciadora cadastrada!\nNome: ${nome}\nUsername: @${username}\nWhatsApp: ${whatsapp}\nAcesse: ${appUrl}/admin/influenciadoras`
      )
    } catch (waErr) {
      console.error('WhatsApp notification failed (register influencer):', waErr)
    }

    return NextResponse.json(
      { message: 'Cadastro recebido! Aguarde análise da equipe.', influencer_id: inf.id },
      { status: 201 }
    )
  } catch (e) {
    return apiError(e)
  }
}
