# painel/agendamentos/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/agendamentos/page.tsx`

## O que faz
Gerenciamento de agendamentos da influenciadora em `/painel/agendamentos`. Lista todos os bookings agrupados por data (Hoje / Amanhã / data formatada), com filtro por status. Permite confirmar, cancelar ou concluir agendamentos pendentes. Exibe modal de detalhe ao clicar em um agendamento.

## Como acessar / Como usar
`http://localhost:3000/painel/agendamentos`

## Estado atual (Lovable)
- Dados reais do Supabase com joins em `clients` e `services`
- Agrupamento por data usando `useMemo` com `date-fns`
- Ações de status: `confirmado`, `cancelado`, `concluido`
- Botão WhatsApp para contato direto com cliente
- `BookingDetailDialog` para visualização detalhada
- Atualização otimista: muda status local antes de confirmar no banco

## O que ainda não está implementado
- Notificação automática ao cliente quando status muda
- Paginação (carrega todos os bookings de uma vez)
- Filtro por data/período
- Rejeitar com motivo (campo observações no update)

## Chamadas de API existentes
1. `supabase.from("bookings").select("*, clients(*), services(*)").eq("influencer_id", influencer.id)` — com filtro de status opcional
2. `supabase.from("bookings").update({ status }).eq("id", id)` — atualização de status

## Dependências
- `src/views/panel/AgendamentosPage.tsx`
- `src/components/panel/PanelLayout.tsx`
- `src/components/panel/BookingDetailDialog.tsx`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
A query ordena por `data_agendada ascending` — agendamentos futuros aparecem primeiro. O agrupamento por data é feito no cliente via `useMemo`. Para grandes volumes, fazer aggregation no banco ou usar cursor-based pagination.
