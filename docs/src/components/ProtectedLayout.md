# ProtectedLayout.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/ProtectedLayout.tsx`

## O que faz
Componente de proteção de rota usado nos layouts de `/painel`, `/cliente` e `/admin`. Verifica o estado de autenticação do `AuthContext` e redireciona para `/login` se não autenticado. Opcionalmente verifica role `admin` para a área administrativa.

## Como acessar / Como usar
```tsx
// Em src/app/painel/layout.tsx
<ProtectedLayout>{children}</ProtectedLayout>

// Em src/app/admin/layout.tsx
<ProtectedLayout requiredRole="admin">{children}</ProtectedLayout>
```

## Estado atual (Lovable)
- Redireciona para `/login` se `!user` (após loading)
- Redireciona para `/` se `requiredRole === "admin"` e `!isAdmin`
- Mostra "Carregando..." durante `loading === true`
- Retorna `null` durante o redirect (evita flash de conteúdo)

## O que ainda não está implementado
- Suporte a roles `influencer` e `client` (apenas `admin` é verificado)
- Loading state customizável por área
- Preservar URL de destino após login (redirect back)

## Props
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| children | `React.ReactNode` | Sim | Conteúdo protegido |
| requiredRole | `'admin' \| 'influencer' \| 'client'` | Não | Role necessário para acessar |

## Dependências
- `src/contexts/AuthContext.tsx`
- `next/navigation` (useRouter)

## Observações para o dev
Atualmente `/painel` aceita qualquer usuário autenticado — adicionar `requiredRole="influencer"` para segurança. O redirect usa `useEffect` com `router.push()`, o que causa um render inicial antes do redirect. Para melhor UX, considerar middleware Next.js para proteção no servidor.
