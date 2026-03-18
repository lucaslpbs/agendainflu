# painel/page.tsx (Dashboard)

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/page.tsx`

## O que faz
Dashboard principal da influenciadora em `/painel`. Exibe estatísticas agregadas (total de agendamentos, pendentes, clientes ativos, receita total), gráfico de barras de agendamentos por mês (últimos 6 meses), gráfico de pizza por status, visão diária com navegação por mês e lista dos últimos 5 agendamentos.

## Como acessar / Como usar
`http://localhost:3000/painel` — requer autenticação.

## Estado atual (Lovable)
- Todos os dados são **reais do Supabase** — busca bookings, clientes e waitlist da influenciadora logada
- Alertas de status: banner amarelo para `em_analise`, banner vermelho para `suspensa`
- Receita calculada somando serviços com status `confirmado` ou `concluido`
- Visão diária com drill-down por dia (bookings do dia, clientes, valores)
- Gráfico mensal com recharts (BarChart + PieChart)

## O que ainda não está implementado
- Exportação de relatórios
- Filtros de período no gráfico mensal
- Comparativo com período anterior (MoM)
- Métricas de conversão (cliques no perfil vs. agendamentos)

## Chamadas de API existentes
1. `supabase.from("bookings").select("*, clients(*), services(*)").eq("influencer_id", influencer.id)`
2. `supabase.from("clients").select("id").eq("influencer_id", influencer.id).eq("status", "ativo")`
3. `supabase.from("waitlist").select("id").eq("influencer_id", influencer.id).eq("status", "aguardando")`

## Dependências
- `src/views/panel/Dashboard.tsx`
- `src/components/panel/PanelLayout.tsx`
- `src/contexts/AuthContext.tsx`
- `recharts` (BarChart, PieChart, Cell, Tooltip, etc.)
- `date-fns` com locale `ptBR`

## Observações para o dev
O dashboard faz 3 queries paralelas com `Promise.all` no `useEffect`. Para grandes volumes de dados, considerar paginação ou agregação no banco. O `codigo_confirmacao` aparece como `"TEMP"` nos bookings gerados pelo wizard — filtrar ou tratar visualmente.
