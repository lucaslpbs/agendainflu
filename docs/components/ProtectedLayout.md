# ProtectedLayout

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/ProtectedLayout.tsx`
> **Client Component:** `sim`

## O que faz

Guard de rota do lado do cliente. Verifica se o usuário está autenticado e, opcionalmente, se tem o role correto. Redireciona para `/login` se não autenticado, ou para `/` se o role não corresponder. Exibe "Carregando..." enquanto o estado de autenticação está sendo determinado.

## Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `children` | `React.ReactNode` | Sim | — | Conteúdo a proteger |
| `requiredRole` | `'admin' \| 'influencer' \| 'client'` | Não | `undefined` | Role necessário para acessar |

## Exemplo de uso

```tsx
// Layout do painel da influenciadora
export default function PainelLayout({ children }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}

// Layout do admin
export default function AdminLayout({ children }) {
  return <ProtectedLayout requiredRole="admin">{children}</ProtectedLayout>
}
```

## Comportamentos especiais

- Enquanto `loading = true`: renderiza "Carregando..." centralizado
- Se `!user`: `router.push('/login')` e retorna `null`
- Se `requiredRole = 'admin'` e `!isAdmin`: `router.push('/')` e retorna `null`
- O componente também funciona em conjunto com o middleware (`src/middleware.ts`) que redireciona no servidor antes de o JavaScript carregar

## Observações

O middleware do Next.js já faz proteção de rota no servidor para `/painel/**`, `/cliente/**` e `/admin/**`. O `ProtectedLayout` é uma segunda camada de proteção no cliente, necessária porque as páginas usam Client Components.
