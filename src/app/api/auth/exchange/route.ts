/**
 * POST /api/auth/exchange
 * Troca um Supabase access_token por um JWT próprio com role.
 * Chamado pelo AuthContext após login com Supabase.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signJWT } from '@/lib/jwt'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const { supabase_token } = await req.json()
    if (!supabase_token) {
      return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })
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

    // Buscar role
    const { data: roleRow } = await db
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = (roleRow?.role as 'admin' | 'influencer' | 'client') || 'client'

    // Buscar influencer_id se for influencer
    let influencer_id: string | undefined
    if (role === 'influencer' || role === 'admin') {
      const { data: inf } = await db
        .from('influencers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      influencer_id = inf?.id
    }

    const token = await signJWT({
      user_id: user.id,
      role,
      influencer_id,
      email: user.email,
    })

    const res = NextResponse.json({
      token,
      role,
      influencer_id,
      user: {
        id: user.id,
        email: user.email,
        role,
        influencer_id,
      },
    })

    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return res
  } catch (e) {
    return apiError(e)
  }
}
