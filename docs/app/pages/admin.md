# Painel Admin

> **Status:** `Implementado`
> **Auth:** `Admin`

## Layout do Admin

> **Arquivo:** `src/app/admin/layout.tsx`

Envolve todas as páginas admin com `ProtectedLayout` e `requiredRole="admin"`. O `AdminLayout` (em `src/views/admin/AdminPages.tsx`) provê sidebar com menu: Dashboard, Influenciadoras, Agendamentos, Clientes, Lista de Espera.

---

## Dashboard Admin

> **Rota:** `/admin`
> **Arquivo:** `src/app/admin/page.tsx` → `src/views/admin/AdminPages.tsx` (AdminDashboard)

### O que faz
Visão global da plataforma com estatísticas consolidadas, gráfico de agendamentos por dia e por status, e tabela dos agendamentos recentes.

### O que o usuário vê
- 6 cards: Influenciadoras Ativas, Em Análise, Total Agendamentos, Receita Total, Clientes, Lista de Espera
- Gráfico de barras diário com agendamentos e receita (navegável por mês)
- Gráfico de pizza com status dos agendamentos
- Tabela dos 8 agendamentos mais recentes

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `influencers` | Ao montar |
| Supabase (direto) | `bookings` com services, clients, influencers | Ao montar |
| Supabase (direto) | `clients` count | Ao montar |
| Supabase (direto) | `waitlist` count | Ao montar |

---

## Influenciadoras (Admin)

> **Rota:** `/admin/influenciadoras`
> **Arquivo:** `src/app/admin/influenciadoras/page.tsx` → `src/views/admin/AdminPages.tsx` (AdminInfluenciadoras)

### O que faz
Lista e analisa influenciadoras cadastradas. Permite aprovar ou rejeitar perfis em análise, preenchendo um checklist de critérios e observações.

### Checklist de aprovação
- Perfil completo
- Instagram verificado
- Nicho definido
- Foto de qualidade
- Bio preenchida

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Aprovar | `supabase.update` (direto) + insert em `influencer_analysis` | Status → ativa, WA enviado |
| Rejeitar | `supabase.update` (direto) + insert em `influencer_analysis` | Status → rejeitada, WA enviado |

> Nota: Esta view usa Supabase direto em vez da API Route `/api/admin/influencers/[id]/approve`. A API Route tem validação mais rigorosa (verificação de checklist).

---

## Agendamentos (Admin)

> **Rota:** `/admin/agendamentos`
> **Arquivo:** `src/app/admin/agendamentos/page.tsx` → `src/views/admin/AdminPages.tsx` (AdminAgendamentos)

### O que faz
Tabela completa de todos os agendamentos da plataforma. Filtros por status e busca por cliente, influenciadora ou código. Permite atualizar o status diretamente via select.

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `bookings` com services, clients, influencers | Ao montar |

---

## Clientes (Admin)

> **Rota:** `/admin/clientes`
> **Arquivo:** `src/app/admin/clientes/page.tsx` → `src/views/admin/AdminPages.tsx` (AdminClientes)

### O que faz
Tabela de todos os clientes da plataforma com dados da influenciadora associada. Filtro de busca por nome ou empresa.

---

## Lista de Espera (Admin)

> **Rota:** `/admin/lista-espera`
> **Arquivo:** `src/app/admin/lista-espera/page.tsx` → `src/views/admin/AdminPages.tsx` (AdminWaitlist)

### O que faz
Visão global da lista de espera de todas as influenciadoras. Permite atualizar status de cada entrada.
