# Middleware

> **Status:** `Implementado`
> **Caminho:** `src/middleware.ts`
> **Runtime:** `Edge (Next.js)`

## O que faz

Intercepta requisições para rotas protegidas e verifica o JWT armazenado no cookie `auth-token`. Redireciona para `/login` caso o token seja inválido ou ausente. Aplica regras de autorização por role antes de permitir acesso às rotas de cada área.

## Rotas interceptadas (matcher)

```
/painel/:path*
/cliente/:path*
/admin/:path*
/agendar/:path*
```

## Rotas explicitamente liberadas

| Padrão | Tipo |
|--------|------|
| `/api/**` | API Routes (têm auth própria) |
| `/`, `/login`, `/cadastro-influenciadora`, `/cadastro-cliente`, `/lista-espera` | Páginas públicas exatas |
| `/[a-z0-9._-]+` (regex) | Perfis públicos `/{username}` |
| `/agendar/**` | Página de agendamento público |
| `/lista-espera/**` | Sub-rotas de lista de espera |

> **Nota:** `/agendar/**` aparece no matcher mas também no bloco de liberação — o middleware permite o acesso sem verificação de token.

## Fluxo de decisão

```
Requisição entra
       │
       ├─ pathname começa com /api/  → NextResponse.next()
       ├─ pathname em PUBLIC_PATHS   → NextResponse.next()
       ├─ pathname bate regex pública → NextResponse.next()
       │
       └─ rota protegida
              │
              ├─ cookie auth-token ausente → redirect /login
              │
              └─ token presente
                     │
                     ├─ verifyJWT() lança erro → delete cookie + redirect /login
                     │
                     └─ token válido (payload.role disponível)
                            │
                            ├─ /painel + role ≠ influencer/admin → redirect /cliente
                            ├─ /admin  + role ≠ admin            → redirect /
                            ├─ /cliente + role ≠ client/admin    → redirect /painel
                            └─ tudo ok → NextResponse.next()
```

## Regras de autorização por área

| Prefixo | Roles permitidos | Redirect se não autorizado |
|---------|-----------------|---------------------------|
| `/painel` | `influencer`, `admin` | `/cliente` |
| `/admin` | `admin` | `/` |
| `/cliente` | `client`, `admin` | `/painel` |

## Dependências

- `verifyJWT` de `src/lib/jwt.ts` (compatível com Edge Runtime — usa `jose`)
- Cookie `auth-token` (httpOnly, setado por `/api/auth/exchange`)
