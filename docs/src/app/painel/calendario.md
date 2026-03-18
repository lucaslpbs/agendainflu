# painel/calendario/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/calendario/page.tsx`

## O que faz
Visão de calendário mensal para a influenciadora em `/painel/calendario`. Mostra dias do mês com indicadores coloridos de agendamentos por status. Permite bloquear/desbloquear dias e configurar limite máximo de agendamentos por dia. Ao clicar num dia, exibe os agendamentos daquele dia com ações de status.

## Como acessar / Como usar
`http://localhost:3000/painel/calendario`

## Estado atual (Lovable)
- Calendário gerado com `eachDayOfInterval` do `date-fns`
- Cores dos dias: vermelho = cancelado, verde = confirmado/concluído, amarelo = pendente
- Bloqueio de dias via tabela `availability` — **read/write funcional**
- Limite de bookings por dia lido de `availability.max_bookings`
- Navegação por mês (anterior/próximo)
- Detalhe do dia com lista de agendamentos e ações de status

## O que ainda não está implementado
- Sincronização com Google Calendar
- Bloqueio por período (range de datas)
- Feriados automáticos
- Visualização semanal

## Chamadas de API existentes
1. `supabase.from("bookings").select("*, clients(*), services(*)").eq("influencer_id", influencer.id)` — todos os bookings
2. `supabase.from("availability").select("*").eq("influencer_id", influencer.id)` — disponibilidade configurada
3. `supabase.from("availability").upsert({...})` — bloquear/desbloquear dia
4. `supabase.from("bookings").update({ status }).eq("id", id)` — atualizar status

## Dependências
- `src/views/panel/CalendarioPage.tsx`
- `src/components/panel/PanelLayout.tsx`
- `src/components/panel/BookingDetailDialog.tsx`

## Observações para o dev
A tabela `availability` usa `upsert` com `influencer_id + data` como chave composta. Verificar se a constraint `UNIQUE(influencer_id, data)` existe no banco. O campo `max_bookings` padrão é implicitamente ilimitado quando não há registro.
