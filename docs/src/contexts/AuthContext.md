# AuthContext.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `store`
> **Caminho:** `src/contexts/AuthContext.tsx`

## O que faz
Context React de autenticação global. Gerencia sessão do usuário via Supabase Auth, carrega roles do usuário da tabela `user_roles`, carrega dados da influenciadora vinculada ao usuário (se houver), e expõe helpers de estado (`isAdmin`, `isInfluencer`) e actions (`signOut`, `refreshInfluencer`).

## Como acessar / Como usar
```tsx
// Envolver app em src/components/Providers.tsx
<AuthProvider>{children}</AuthProvider>

// Consumir em qualquer "use client" component
import { useAuth } from "@/contexts/AuthContext"
const { user, influencer, isAdmin, signOut } = useAuth()
```

## Estado atual (Lovable)
- `getSession()` na montagem para restaurar sessão persistida
- `onAuthStateChange()` para login/logout em tempo real
- `fetchRoles()`: busca roles da tabela `user_roles`
- `fetchInfluencer()`: busca perfil da tabela `influencers` por `user_id`
- `refreshInfluencer()`: força re-fetch do perfil (usado após edição no PerfilPage)
- `signOut()`: limpa Supabase auth + limpa estado local

## O que ainda não está implementado
- Cache de roles (atualmente rebusca a cada mudança de auth state)
- Tratamento de erro quando `user_roles` não tem registro (usuário sem role)
- `refreshRoles()` equivalente ao `refreshInfluencer`
- Supabase Realtime para atualização do status da influenciadora em tempo real

## Chamadas de API existentes
1. `supabase.auth.getSession()` — restaurar sessão
2. `supabase.auth.onAuthStateChange()` — listener de mudanças
3. `supabase.from("user_roles").select("role").eq("user_id", userId)` — carregar roles
4. `supabase.from("influencers").select("*").eq("user_id", userId).maybeSingle()` — dados da influencer
5. `supabase.auth.signOut()` — logout

## Dependências
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts` (Tables)
- `@supabase/supabase-js` (User, Session)

## Observações para o dev
A tabela `user_roles` é a fonte de verdade para roles. Verificar se há trigger no Supabase que insere automaticamente role `influencer` após insert em `influencers`, e role `client` após insert em `client_profiles`. Sem esse trigger, novos usuários ficam sem role e `isAdmin`/`isInfluencer` retornam `false`.
