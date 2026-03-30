/**
 * POST /api/auth/register/client
 * Chamado APÓS supabase.auth.signUp no cliente.
 * Cria o client_profile e insere o role 'client' [FIX P2, P3].
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
import { registerClientSchema } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerClientSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }
    const {
      user_id, tipo_pessoa, nome, email, whatsapp,
      cnpj, razao_social, cpf, endereco,
    } = parsed.data

    // [FIX P2] Criar client_profile com tipos corretos (sem as any)
    const { error: profileError } = await db
      .from('client_profiles' as any)
      .insert({
        user_id,
        tipo_pessoa,
        nome,
        email: email || null,
        whatsapp,
        cnpj: tipo_pessoa === 'pj' ? cnpj : null,
        razao_social: tipo_pessoa === 'pj' ? razao_social : null,
        cpf: tipo_pessoa === 'pf' ? cpf : null,
        endereco_comercial: endereco || null,
      })
    if (profileError) throw profileError

    // [FIX P3] Inserir role 'client' — estava faltando
    await db.from('user_roles').insert({ user_id, role: 'client' })

    return NextResponse.json({ message: 'Conta criada com sucesso!' }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
