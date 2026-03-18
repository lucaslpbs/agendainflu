# painel/layout.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/layout.tsx`

## O que faz
Layout compartilhado para todas as rotas `/painel/*`. Envolve as páginas com `ProtectedLayout` sem `requiredRole`, o que garante que apenas usuários autenticados podem acessar. O layout visual (sidebar, header) é fornecido pelo `PanelLayout` que fica dentro de cada view.

## Como acessar / Como usar
Aplicado automaticamente pelo Next.js para todas as rotas dentro de `painel/`. Não há verificação de role `influencer` — qualquer usuário autenticado pode acessar tecnicamente.

## Estado atual (Lovable)
- Proteção de autenticação via `ProtectedLayout`
- Redireciona para `/login` se não autenticado
- Sem verificação específica de role `influencer`

## O que ainda não está implementado
- Verificação de role `influencer` (qualquer usuário logado pode acessar `/painel`)
- Redirecionamento inteligente: se influencer com status `rejeitada`, mostrar aviso especial

## Dependências
- `src/components/ProtectedLayout.tsx`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
Adicionar `requiredRole="influencer"` no `ProtectedLayout` para segurança real. Atualmente um cliente ou admin poderia acessar `/painel` sem ser redirecionado.
