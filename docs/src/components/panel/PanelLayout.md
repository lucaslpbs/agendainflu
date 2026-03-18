# PanelLayout.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/panel/PanelLayout.tsx`

## O que faz
Layout visual da área da influenciadora com sidebar responsiva. Exibe navegação lateral com 7 itens (Dashboard, Calendário, Agendamentos, Serviços, Clientes, Lista de Espera, Perfil), destaque do item ativo por pathname, avatar da influenciadora com nome e username, e botão de logout. Em mobile, a sidebar é um drawer deslizante com overlay.

## Como acessar / Como usar
```tsx
// Dentro de qualquer view de painel
import PanelLayout from "@/components/panel/PanelLayout"
<PanelLayout>{children}</PanelLayout>
```

## Estado atual (Lovable)
- Sidebar fixa em desktop (`lg:static`), drawer em mobile
- Highlight de item ativo via `usePathname()`
- Avatar com inicial do nome da influenciadora
- Logout chama `signOut()` e redireciona para `/`
- Header com título da página atual (lookup no array `menuItems`)

## Props
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| children | `ReactNode` | Sim | Conteúdo da página |

## Dependências
- `src/contexts/AuthContext.tsx` (signOut, influencer)
- `next/link` e `next/navigation` (usePathname, useRouter)
- `src/components/ui/button.tsx`
- `lucide-react`

## Observações para o dev
O `AdminLayout` dentro de `AdminPages.tsx` duplica estrutura idêntica. Refatorar para reutilizar `PanelLayout` ou um `SidebarLayout` genérico que aceite `menuItems` como prop.
