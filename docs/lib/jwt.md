# jwt.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/jwt.ts`
> **Usado em:** `src/lib/auth.ts`, `src/app/api/auth/exchange/route.ts`, `src/middleware.ts`

## O que faz

Fornece funções para assinar e verificar JWTs próprios da aplicação usando o algoritmo HS256. Os tokens carregam informações de papel (role) do usuário e são separados dos tokens do Supabase Auth, permitindo que as API Routes verifiquem permissões sem depender do SDK Supabase no servidor.

## Funções exportadas

### `signJWT(payload)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `payload` | `Omit<JWTPayload, 'iat' \| 'exp'>` | Dados do usuário: `user_id`, `role`, `influencer_id?`, `email?` |

**Retorna:** `Promise<string>` — token JWT assinado, válido por 7 dias

**Exemplo:**
```typescript
const token = await signJWT({
  user_id: 'uuid-do-usuario',
  role: 'influencer',
  influencer_id: 'uuid-da-influencer',
  email: 'user@example.com',
})
```

---

### `verifyJWT(token)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `token` | `string` | JWT a ser verificado |

**Retorna:** `Promise<JWTPayload>` — payload decodificado

**Exemplo:**
```typescript
const payload = await verifyJWT(token)
console.log(payload.role) // 'influencer'
```

## Interface `JWTPayload`

```typescript
interface JWTPayload {
  user_id: string
  role: 'admin' | 'influencer' | 'client'
  influencer_id?: string
  email?: string
  iat?: number
  exp?: number
}
```

## Variáveis de ambiente necessárias

| Variável | Tipo | Descrição |
|---------|------|-----------|
| `JWT_SECRET` | `string` | Segredo HMAC para assinar/verificar tokens |

## Observações

- Se `JWT_SECRET` não estiver definida, `signJWT` e `verifyJWT` lançam `Error('JWT_SECRET não configurada')` imediatamente.
- O campo `influencer_id` só é preenchido quando o role é `influencer` ou `admin`.
- Usa a biblioteca `jose` (não `jsonwebtoken`) por compatibilidade com o Edge Runtime do Next.js.
