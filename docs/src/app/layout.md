# layout.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/layout.tsx`

## O que faz
Layout raiz do Next.js 14 App Router. Envolve toda a aplicação com os metadados HTML globais (`<html lang="pt-BR">`, `<body>`) e o componente `Providers` que injeta todos os providers globais (QueryClient, Tooltip, Toaster, Sonner, AuthProvider).

Importa `globals.css` que contém as variáveis CSS do tema (cores, tipografia), as diretivas do Tailwind e os utilitários customizados (`gradient-gold`, `gradient-rosa`, `shadow-rosa`).

## Como acessar / Como usar
Aplicado automaticamente pelo Next.js em todas as rotas. Não é acessado diretamente.

## Estado atual (Lovable)
- Metadata com título e descrição fixos
- Fontes carregadas via Google Fonts (import no `globals.css`)
- Providers globais funcionais: React Query, Supabase Auth, Toast

## O que ainda não está implementado
- Fontes não usam `next/font/google` (carregadas via CSS `@import` — menos performático)
- Sem Open Graph dinâmico
- Sem suporte a temas (dark mode desabilitado no provider)

## Chamadas de API existentes
Nenhuma diretamente — delegado ao `AuthProvider` dentro de `Providers`.

## Dependências
- `src/components/Providers.tsx`
- `src/app/globals.css`

## Observações para o dev
As fontes Playfair Display e DM Sans são carregadas com `@import url()` no globals.css. Para produção, migrar para `next/font/google` para melhor performance (evita FOUC e melhora Core Web Vitals).
