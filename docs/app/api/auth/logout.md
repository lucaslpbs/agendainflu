# POST /api/auth/logout

> **Status:** `Implementado`
> **Auth:** `Pública`
> **Arquivo:** `src/app/api/auth/logout/route.ts`

## O que faz

Remove o cookie httpOnly `auth-token` do navegador, efetivando o logout no servidor. Chamado pelo método `signOut` do `AuthContext`, que também limpa o `localStorage` e revoga a sessão Supabase.

## Request

**Headers:** Nenhum obrigatório

**Body:** Nenhum

## Response (sucesso)

**Status:** `200`
```json
{ "ok": true }
```

O cookie `auth-token` é definido com `maxAge: 0`, o que instrui o navegador a removê-lo.

## Erros possíveis

Nenhum — a rota sempre retorna 200 (mesmo sem cookie presente).

## Regras de negócio aplicadas

- Não invalida o token JWT em si (JWT é stateless). Apenas remove o cookie do navegador.
- Para invalidação completa, o `AuthContext` também remove o token do `localStorage` e chama `supabase.auth.signOut()`.

## Exemplo de uso no frontend

```typescript
// No AuthContext
const signOut = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  localStorage.removeItem('agenda-token')
  await supabase.auth.signOut()
}
```
