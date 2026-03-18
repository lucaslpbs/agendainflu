# auth.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/auth.ts`
> **Usado em:** Todos os arquivos de API routes que requerem autenticação

## O que faz

Fornece helpers para extrair e validar o JWT da requisição nas API Routes. Suporta token tanto no header `Authorization: Bearer <token>` quanto no cookie `auth-token` (httpOnly). Também expõe funções de guarda (`require*`) que lançam erros padronizados quando o usuário não tem a permissão necessária.

## Funções exportadas

### `getAuthUser(req)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `req` | `NextRequest` | Requisição Next.js |

**Retorna:** `Promise<JWTPayload | null>` — payload do token ou `null` se não autenticado/token inválido

**Exemplo:**
```typescript
const auth = await getAuthUser(req)
if (auth) {
  // usuário autenticado, mas rota pode ser pública
}
```

---

### `requireAuth(req)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `req` | `NextRequest` | Requisição Next.js |

**Retorna:** `Promise<JWTPayload>` — lança `Error('UNAUTHORIZED')` se não autenticado

---

### `requireInfluencer(req)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `req` | `NextRequest` | Requisição Next.js |

**Retorna:** `Promise<JWTPayload>` — lança `Error('UNAUTHORIZED')` se não autenticado, `Error('FORBIDDEN')` se role não for `influencer` nem `admin`

---

### `requireAdmin(req)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `req` | `NextRequest` | Requisição Next.js |

**Retorna:** `Promise<JWTPayload>` — lança `Error('FORBIDDEN')` se role não for `admin`

## Variáveis de ambiente necessárias

Depende indiretamente de `JWT_SECRET` via `verifyJWT`.

## Observações

- A função prioriza o header `Authorization` sobre o cookie. Se ambos estiverem presentes, usa o header.
- Os erros lançados (`UNAUTHORIZED`, `FORBIDDEN`) são capturados pela função `apiError` de `src/lib/errors.ts` e mapeados para os status HTTP corretos (401, 403).
- `requireInfluencer` permite que admins também acessem rotas de influencer (role `admin` passa pelo guard).
