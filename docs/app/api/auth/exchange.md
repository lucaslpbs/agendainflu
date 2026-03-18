# POST /api/auth/exchange

> **Status:** `Implementado`
> **Auth:** `Pública`
> **Arquivo:** `src/app/api/auth/exchange/route.ts`

## O que faz

Troca um Supabase `access_token` por um JWT próprio da aplicação que contém o `role` do usuário (`admin`, `influencer` ou `client`). É o endpoint central do fluxo de autenticação: após o login via Supabase, o frontend chama este endpoint para obter o token com permissões. O token resultante é armazenado em cookie httpOnly e em `localStorage`.

## Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "supabase_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Response (sucesso)

**Status:** `200`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "user@example.com",
    "role": "influencer",
    "influencer_id": "uuid-da-influencer"
  }
}
```

Além do JSON, define o cookie httpOnly:
```
Set-Cookie: auth-token=<token>; HttpOnly; SameSite=Lax; Max-Age=604800
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `supabase_token` não enviado | `"Token obrigatório"` |
| 401 | Token Supabase inválido ou expirado | `"Token inválido"` |
| 500 | Erro interno | `"Erro interno do servidor"` |

## Regras de negócio aplicadas

1. Valida o token Supabase chamando `anonClient.auth.getUser(token)`
2. Busca o role em `user_roles` pelo `user_id`
3. Se não tiver role cadastrado, assume `'client'` como padrão
4. Se role for `influencer` ou `admin`, busca o `influencer_id` na tabela `influencers`
5. Assina JWT próprio com `user_id`, `role`, `influencer_id?`, `email` — válido por 7 dias
6. Define cookie httpOnly (secure em produção, SameSite=Lax)

## Exemplo de uso no frontend

```typescript
// No AuthContext, após obter a sessão Supabase
const res = await fetch('/api/auth/exchange', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ supabase_token: session.access_token }),
})
const { token, user } = await res.json()
localStorage.setItem('agenda-token', token)
```
