# BookingDetailDialog.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/panel/BookingDetailDialog.tsx`

## O que faz
Modal de detalhes de agendamento usado nas páginas de Agendamentos e Calendário. Exibe todas as informações do booking em três seções: dados do cliente (nome, e-mail, WhatsApp, empresa), dados do serviço (tipo, formato, data, valor, status) e detalhes do pedido (descrição do produto, link do negócio, Kit Mídia com thumbnails de imagens, observações).

## Como acessar / Como usar
```tsx
import BookingDetailDialog from "@/components/panel/BookingDetailDialog"
<BookingDetailDialog booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
```

## Estado atual (Lovable)
- Recebe booking tipado como `Tables<"bookings"> & { clients, services }`
- Exibe imagens do Kit Mídia parseando `material_url` (separado por vírgula)
- Link WhatsApp pré-formatado com `wa.me/` + número limpo
- Status com badge colorido por tipo
- Não faz nenhuma chamada de API (read-only)

## Props
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| booking | `BookingWithRelations \| null` | Sim | Dados do agendamento a exibir |
| onClose | `() => void` | Sim | Callback ao fechar o modal |

## Dependências
- `src/components/ui/dialog.tsx`
- `src/integrations/supabase/types.ts` (Tables)
- `date-fns` com locale `ptBR`
- `lucide-react`

## Observações para o dev
`material_url` é armazenado como string com múltiplas URLs separadas por vírgula — uma solução frágil. Para implementação real, usar array JSON ou tabela separada `booking_files`. Verificar se `material_url.split(",")` causa problemas com URLs que contêm vírgulas.
