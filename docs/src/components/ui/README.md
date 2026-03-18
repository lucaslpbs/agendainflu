# components/ui/ — Biblioteca shadcn/ui

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/ui/`

## O que faz
Coleção de 49 componentes UI gerados pelo shadcn/ui — primitivos Radix UI estilizados com Tailwind CSS e variantes CVA (class-variance-authority). São componentes de baixo nível usados como building blocks em toda a aplicação.

## Lista de componentes

| Componente | Usado em | Notas |
|-----------|---------|-------|
| `button.tsx` | Todo o app | Variantes: `default`, `destructive`, `outline`, `ghost`, `link`, `hero` (custom), `gold` (custom) |
| `dialog.tsx` | BookingDetailDialog, ServicosPage | Modal acessível via Radix |
| `calendar.tsx` | CalendarioPage (UI) | react-day-picker |
| `card.tsx` | Dashboard, Perfil | Container semântico |
| `badge.tsx` | Status labels | — |
| `input.tsx` | Formulários | — |
| `textarea.tsx` | Formulários | — |
| `select.tsx` | Formulários (nicho, status) | Radix Select |
| `tabs.tsx` | AdminPages | — |
| `table.tsx` | Admin (agendamentos, clientes) | — |
| `accordion.tsx` | FAQ | — |
| `sheet.tsx` | Mobile sidebar | — |
| `sonner.tsx` | Toasts (via Sonner) | Wrapper do Sonner |
| `toaster.tsx` | Toasts (shadcn) | Sistema legado |
| `tooltip.tsx` | Toda a app (provider) | — |
| `avatar.tsx` | Navbar, PanelLayout | — |
| `skeleton.tsx` | Loading states | — |
| `switch.tsx` | ServicosPage (ativo/inativo) | — |
| `separator.tsx` | Layouts | — |
| `scroll-area.tsx` | Listas longas | — |
| `popover.tsx` | Date pickers | — |
| `label.tsx` | Formulários | — |
| `checkbox.tsx` | AdminInfluenciadoras checklist | — |
| `form.tsx` | React Hook Form wrapper | — |
| `progress.tsx` | — | Instalado, não usado ainda |
| `carousel.tsx` | — | Instalado, não usado ainda |
| `chart.tsx` | — | Wrapper recharts (shadcn) — não usado (recharts usado diretamente) |

## Variantes customizadas do Button
Além das variantes padrão do shadcn, o projeto tem:
- `hero`: gradiente rosa (`gradient-rosa`) — CTA principal
- `gold`: gradiente dourado (`gradient-gold`) — CTA WhatsApp/destaque

## Observações para o dev
Não modificar estes arquivos diretamente — usar `npx shadcn-ui@latest add [component]` para adicionar novos ou atualizar. Modificações de estilo devem ser feitas via `tailwind.config.ts` e variáveis CSS em `globals.css`.
