import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { key: 'complete-profile', limit: 5, windowMs: 60_000 })
  if (rl) return rl

  try {
    const body = await req.json()
    const { supabase_token, tipo, ...dados } = body

    if (!supabase_token || !tipo) {
      return NextResponse.json(
        { error: 'Token e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar token Supabase
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: { user }, error } = await anonClient.auth.getUser(supabase_token)
    if (error || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar se já tem role (evitar duplicatas)
    const { data: existingRole } = await db
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingRole?.role) {
      return NextResponse.json(
        { error: 'Perfil já cadastrado' },
        { status: 409 }
      )
    }

    if (tipo === 'cliente') {
      const {
        tipo_pessoa, nome, whatsapp,
        cpf, cnpj, razao_social, endereco,
      } = dados

      if (!tipo_pessoa || !nome || !whatsapp) {
        return NextResponse.json(
          { error: 'Nome, WhatsApp e tipo de pessoa são obrigatórios' },
          { status: 400 }
        )
      }

      const { error: profileError } = await db
        .from('client_profiles' as any)
        .insert({
          user_id: user.id,
          tipo_pessoa,
          nome,
          email: user.email || null,
          whatsapp,
          cpf: tipo_pessoa === 'pf' ? cpf : null,
          cnpj: tipo_pessoa === 'pj' ? cnpj : null,
          razao_social: tipo_pessoa === 'pj' ? razao_social : null,
          endereco_comercial: endereco || null,
        })
      if (profileError) throw profileError

      await db.from('user_roles').insert({ user_id: user.id, role: 'client' })

      return NextResponse.json({ ok: true, role: 'client' }, { status: 201 })
    }

    if (tipo === 'influencer') {
      const { nome, whatsapp, instagram, nicho, bio, seguidores, foto_url } = dados

      if (!nome || !whatsapp || !instagram || !nicho) {
        return NextResponse.json(
          { error: 'Nome, WhatsApp, Instagram e nicho são obrigatórios' },
          { status: 400 }
        )
      }

      const username = instagram.replace('@', '').toLowerCase().replace(/[^a-z0-9._]/g, '')

      const { error: infError } = await db
        .from('influencers')
        .insert({
          user_id: user.id,
          nome,
          whatsapp,
          instagram,
          username,
          nicho,
          bio: bio || null,
          seguidores: seguidores ? parseInt(String(seguidores).replace(/\D/g, ''), 10) || null : null,
          foto_url: foto_url || null,
          email: user.email || null,
          status: 'em_analise',
        } as any)
      if (infError) throw infError

      await db.from('user_roles').insert({ user_id: user.id, role: 'influencer' })

      return NextResponse.json({ ok: true, role: 'influencer' }, { status: 201 })
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  } catch (e) {
    return apiError(e)
  }
}
