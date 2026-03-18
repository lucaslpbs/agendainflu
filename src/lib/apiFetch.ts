/**
 * Helper para fetch autenticado com o JWT proprio.
 * Lê o token de localStorage e inclui no header Authorization.
 */
export async function apiFetch(url: string, init?: RequestInit) {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('agenda-token')
    : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> || {}),
  }

  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(url, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Erro ' + res.status)
  }

  return res.json()
}
