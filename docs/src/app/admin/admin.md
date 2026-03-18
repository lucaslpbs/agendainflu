# admin/ — Área Administrativa

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/admin/` (layout + 5 páginas)

## O que faz
Área administrativa da plataforma, acessível apenas para usuários com role `admin`. Composta por 5 seções: Dashboard (métricas globais + gráficos), Influenciadoras (aprovação/rejeição de cadastros), Agendamentos (visão de todos os bookings), Clientes (base completa de clientes) e Lista de Espera (gestão global de leads).

## Como acessar / Como usar
`http://localhost:3000/admin` — requer `isAdmin === true` no `ProtectedLayout`.

## Rotas
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/admin` | `AdminDashboard` | Dashboard com stats globais + gráficos |
| `/admin/influenciadoras` | `AdminInfluenciadoras` | Aprovação de cadastros |
| `/admin/agendamentos` | `AdminAgendamentos` | Todos os bookings com filtro |
| `/admin/clientes` | `AdminClientes` | Base de clientes completa |
| `/admin/lista-espera` | `AdminWaitlist` | Leads globais |

## Estado atual (Lovable)
- Todos os dados são reais do Supabase (sem filtro por influenciadora)
- Dashboard: stats de influencers, bookings, clientes, waitlist + gráficos recharts
- Aprovação de influenciadora: checklist + observações + insert em `influencer_analysis`
- Agendamentos: filtro por status + mudança de status via `<select>`
- Layout sidebar compartilhado (`AdminLayout`) com navegação entre seções

## O que ainda não está implementado
- Suspender/banir influenciadora
- Envio de e-mail de aprovação/rejeição automático
- Logs de atividade do admin
- Bulk actions (aprovar múltiplas de uma vez)
- Exportação de relatórios CSV

## Chamadas de API existentes
### AdminDashboard
1. `supabase.from("influencers").select("id, status")`
2. `supabase.from("bookings").select("*, services(preco, tipo), clients(nome), influencers(nome)")`
3. `supabase.from("clients").select("id", { count: "exact" })`
4. `supabase.from("waitlist").select("id", { count: "exact" })`

### AdminInfluenciadoras
5. `supabase.from("influencers").select("*").order("criado_em", desc)`
6. `supabase.from("influencers").update({ status, aprovado_em, observacoes_admin }).eq("id", id)`
7. `supabase.from("influencer_analysis").insert({...})`

### AdminAgendamentos
8. `supabase.from("bookings").select("*, services(...), clients(...), influencers(...)")`
9. `supabase.from("bookings").update({ status }).eq("id", id)`

### AdminClientes
10. `supabase.from("clients").select("*, influencers(*)")`

### AdminWaitlist
11. `supabase.from("waitlist").select("*, influencers(nome, username)")`
12. `supabase.from("waitlist").update({ status }).eq("id", id)`

## Dependências
- `src/views/admin/AdminPages.tsx` (todos os componentes admin num único arquivo)
- `src/app/admin/layout.tsx` → `src/components/ProtectedLayout.tsx`

## Observações para o dev
A tabela `influencer_analysis` é inserida durante aprovação/rejeição mas não aparece nos tipos gerados — verificar se existe no schema. O `AdminLayout` duplica o layout do `PanelLayout` — considerar unificação em componente compartilhado.
