# AuthContext

> **Status:** `Implementado`
> **Tipo:** `contexto React`
> **Caminho:** `src/contexts/AuthContext.tsx`
> **Client Component:** `sim`

## O que faz

Contexto global de autenticação da aplicação. Mantém a sessão Supabase, troca o token Supabase por um JWT próprio com role, armazena o token em `localStorage` e expõe o estado de autenticação para todos os componentes via hook `useAuth()`.

## Interface exposta (`AuthContextType`)

```ts
interface AuthContextType {
  user: User | null;           // Objeto de usuário Supabase
  session: Session | null;     // Sessão Supabase completa
  loading: boolean;            // true enquanto carrega auth
  roles: UserRole[];           // ["admin"] | ["influencer"] | ["client"] | []
  influencer: Tables<"influencers"> | null; // Dados da influencer (se role = influencer ou admin)
  isAdmin: boolean;            // atalho: roles.includes("admin")
  isInfluencer: boolean;       // atalho: roles.includes("influencer")
  apiToken: string | null;     // JWT próprio para chamadas à API
  signOut: () => Promise<void>;
  refreshInfluencer: () => Promise<void>; // Recarrega dados da influencer do Supabase
}
```

## Hook de acesso

```ts
import { useAuth } from "@/contexts/AuthContext";
const { user, isInfluencer, apiToken, signOut } = useAuth();
```

## Fluxo de autenticação

```
1. Componente monta → supabase.auth.getSession()
        │
        ▼
2. handleSession(session)
        │
        ├─ session nula → limpa estado → loading=false
        │
        └─ session válida
              │
              ▼
        3. POST /api/auth/exchange (supabase_token → JWT próprio)
              │
              ├─ sucesso → role extraído → localStorage["agenda-token"] = token
              │            → se role = influencer/admin → busca influencer no Supabase
              │
              └─ falha (fallback) → busca roles direto em user_roles (Supabase client)
              │
              ▼
        4. loading = false
```

## Armazenamento do token

| Onde | Chave | Uso |
|------|-------|-----|
| `localStorage` | `agenda-token` | Lido por `apiFetch` para incluir `Authorization: Bearer` nas chamadas à API |
| Cookie `auth-token` (httpOnly) | — | Setado pelo endpoint `/api/auth/exchange` (servidor); lido pelo middleware Edge |

## Eventos Supabase monitorados

`supabase.auth.onAuthStateChange` → chama `handleSession` a cada mudança de estado (login, logout, refresh de token, magic link).

## Logout (`signOut`)

1. `POST /api/auth/logout` — limpa o cookie `auth-token` no servidor
2. `localStorage.removeItem('agenda-token')`
3. `supabase.auth.signOut()`
4. Limpa todo o estado local (user, session, roles, influencer, apiToken)

## Onde é usado

- `src/components/Providers.tsx` — `<AuthProvider>` envolve toda a aplicação
- `useAuth()` em: `Navbar`, `PanelLayout`, `ProtectedLayout`, `AdminPages`, `ClientPages` e views de painel
