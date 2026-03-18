# Providers

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/Providers.tsx`
> **Client Component:** `sim`

## O que faz

Componente raiz de providers que envolve toda a aplicação. Configura o `QueryClientProvider` (React Query), `TooltipProvider` (shadcn), `Sonner` (notificações toast) e `AuthProvider` (contexto de autenticação). É importado pelo layout raiz `src/app/layout.tsx`.

## Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `children` | `React.ReactNode` | Sim | — | Conteúdo da aplicação |

## Exemplo de uso

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Comportamentos especiais

- `QueryClient` é criado via `useState` para garantir uma instância por ciclo de render
- O `Sonner` renderiza o container de toasts globalmente (acessível via `toast()` de `sonner`)
- Hierarquia de providers: QueryClient → Tooltip → Sonner → Auth
