import { NextResponse } from 'next/server'

export function apiError(error: unknown) {
  const msg = error instanceof Error ? error.message : 'Erro interno'

  const map: Record<string, [number, string]> = {
    'UNAUTHORIZED': [401, 'Não autenticado'],
    'FORBIDDEN':    [403, 'Sem permissão'],
    'NOT_FOUND':    [404, msg.replace('NOT_FOUND: ', '')],
    'CONFLICT':     [409, msg.replace('CONFLICT: ', '')],
    'VALIDATION':   [400, msg.replace('VALIDATION: ', '')],
  }

  for (const [key, [status, message]] of Object.entries(map)) {
    if (msg.startsWith(key)) {
      return NextResponse.json({ error: message }, { status })
    }
  }

  console.error('[API Error]', error)
  return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
}
