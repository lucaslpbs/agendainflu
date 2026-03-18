# Providers.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/Providers.tsx`

## O que faz
Componente wrapper `"use client"` que agrega todos os providers globais da aplicação. Renderizado no `src/app/layout.tsx` envolvendo toda a árvore de componentes. Cria um `QueryClient` instanciado com `useState` (padrão Next.js para evitar estado compartilhado entre requests em SSR).

## Como acessar / Como usar
```tsx
// src/app/layout.tsx
import { Providers } from '@/components/Providers'
<Providers>{children}</Providers>
```

## Estado atual (Lovable)
- `QueryClientProvider` para React Query
- `TooltipProvider` do shadcn/ui
- `Toaster` (shadcn/ui) + `Sonner` para notificações toast
- `AuthProvider` do `AuthContext`
- QueryClient criado por instância (sem configuração customizada de stale time)

## O que ainda não está implementado
- Configuração de `staleTime` e `gcTime` no QueryClient
- `ThemeProvider` para dark mode (next-themes está instalado mas não usado)
- Error boundary global

## Props
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| children | `React.ReactNode` | Sim | Árvore de componentes da aplicação |

## Dependências
- `@tanstack/react-query`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/toaster.tsx`
- `src/components/ui/sonner.tsx`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
`next-themes` está instalado como dependência mas não há `ThemeProvider` configurado. Se dark mode for necessário, adicionar aqui. O `QueryClient` usa configurações padrão (staleTime=0, gcTime=5min).
