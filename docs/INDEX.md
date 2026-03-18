# AgendaInflu — Índice Mestre de Documentação

> **Gerado em:** 2026-03-18
> **Status geral:** Backend implementado — API Routes + Middleware ativos
> **Framework:** Next.js 14 App Router + TypeScript + Supabase

---

## Navegação rápida

- [ARCHITECTURE.md](ARCHITECTURE.md) — Stack, diagramas, decisões técnicas, variáveis de ambiente, deploy
- [DATABASE.md](DATABASE.md) — Todas as tabelas, ENUMs, SQL functions, Storage, RLS
- [SDR.md](SDR.md) — Bot de vendas n8n (planejado)
- [middleware.md](middleware.md) — Proteção de rotas Edge (JWT)
- [components/AuthContext.md](components/AuthContext.md) — Contexto global de autenticação

---

## Visão Geral da Arquitetura

```text
BROWSER
├── React Views (src/views/) + Components (src/components/)
├── AuthContext — sessão Supabase + JWT próprio em localStorage
└── apiFetch() → Authorization: Bearer <agenda-token>
          │
          ▼ HTTPS
NEXT.JS SERVER
├── src/middleware.ts (Edge) — verifica cookie auth-token, protege rotas por role
└── src/app/api/** (Node.js) — API Routes com service_role Supabase + JWT auth
          │
          ├──→ SUPABASE (PostgreSQL + Auth + Storage)
          └──→ EVOLUTION API (WhatsApp)
```

---

## Libs Utilitárias

Diretório: `src/lib/`

| Arquivo | Doc | Responsabilidade |
| --- | --- | --- |
| `db.ts` | [lib/db.md](lib/db.md) | Supabase client com service_role (server-side, bypassa RLS) |
| `jwt.ts` | [lib/jwt.md](lib/jwt.md) | `signJWT` / `verifyJWT` — HS256, 7 dias, compatível com Edge |
| `auth.ts` | [lib/auth.md](lib/auth.md) | `requireAuth`, `requireInfluencer`, `requireAdmin` — lê cookie ou header |
| `errors.ts` | [lib/errors.md](lib/errors.md) | `apiError()` — mapeia erros para status HTTP |
| `booking-code.ts` | [lib/booking-code.md](lib/booking-code.md) | `generateBookingCode()` — gera `AI-YYYY-NNNN` |
| `wa.ts` | [lib/wa.md](lib/wa.md) | `sendWhatsApp()` — Evolution API, falha silenciosa |
| `apiFetch.ts` | [lib/apiFetch.md](lib/apiFetch.md) | Fetch client-side com JWT do localStorage |
| `utils.ts` | [lib/utils.md](lib/utils.md) | `cn()` — clsx + tailwind-merge |

---

## API Routes

Diretório: `src/app/api/`

### Auth

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/auth/exchange` | POST | Supabase token | [exchange.md](app/api/auth/exchange.md) | Troca token Supabase por JWT; seta cookie `auth-token` |
| `/api/auth/logout` | POST | — | [logout.md](app/api/auth/logout.md) | Limpa cookie `auth-token` |
| `/api/auth/me` | GET | JWT | [me.md](app/api/auth/me.md) | Dados do usuário pelo token |
| `/api/auth/register/influencer` | POST | — | [register-influencer.md](app/api/auth/register-influencer.md) | Cria influencer `em_analise` + notifica admin |
| `/api/auth/register/client` | POST | — | [register-client.md](app/api/auth/register-client.md) | Cria `client_profiles` + `user_roles` |

### Influencers

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/influencers` | GET | Opcional | [list.md](app/api/influencers/list.md) | Lista ativas (filtros: nicho, busca, limit) |
| `/api/influencers/[slug]` | GET | Opcional | [slug.md](app/api/influencers/slug.md) | Perfil por username; preços ocultos sem auth |
| `/api/influencers/[slug]` | PATCH | Influencer/Admin | [slug.md](app/api/influencers/slug.md) | Atualiza perfil |
| `/api/influencers/[slug]/availability` | GET | — | [availability.md](app/api/influencers/availability.md) | Disponibilidade (aceita UUID ou username) |

### Services

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/services` | GET | — | [services.md](app/api/services/services.md) | Serviços por `influencer_id` |
| `/api/services` | POST | Influencer | [services.md](app/api/services/services.md) | Cria serviço |
| `/api/services/[id]` | PATCH | Influencer | [service-id.md](app/api/services/service-id.md) | Atualiza serviço |
| `/api/services/[id]` | DELETE | Influencer | [service-id.md](app/api/services/service-id.md) | Soft-delete se tem bookings; hard-delete caso contrário |

### Bookings

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/bookings` | POST | Cliente | [bookings.md](app/api/bookings/bookings.md) | Cria booking com código `AI-YYYY-NNNN`; verifica disponibilidade |
| `/api/bookings` | GET | Influencer | [bookings.md](app/api/bookings/bookings.md) | Bookings da influencer (filtros: status, data) |
| `/api/bookings/client` | GET | Cliente | [bookings-client.md](app/api/bookings/bookings-client.md) | Bookings do cliente por `user_id` |
| `/api/bookings/[id]/status` | PATCH | Influencer/Admin | [bookings-status.md](app/api/bookings/bookings-status.md) | Transições de status validadas + WA |

### Clients

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/clients` | GET | Influencer | [clients.md](app/api/clients/clients.md) | Clientes da influencer (search) |
| `/api/clients` | POST | Influencer | [clients.md](app/api/clients/clients.md) | Cria cliente; verifica duplicata por WhatsApp |
| `/api/clients/[id]/status` | PATCH | Influencer | [clients-status.md](app/api/clients/clients-status.md) | Altera status: `ativo` / `bloqueado` |

### Waitlist

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/waitlist` | POST | — | [waitlist.md](app/api/waitlist/waitlist.md) | Insere lead; check duplicata; notifica WA |
| `/api/waitlist` | GET | Influencer | [waitlist.md](app/api/waitlist/waitlist.md) | Waitlist da influencer |
| `/api/waitlist/[id]/status` | PATCH | Influencer | [waitlist-status.md](app/api/waitlist/waitlist-status.md) | Aprovação → upsert em `clients` + WA |

### Availability

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/availability` | GET | — | [availability.md](app/api/availability/availability.md) | Disponibilidade por mês |
| `/api/availability` | POST | Influencer | [availability.md](app/api/availability/availability.md) | Upsert de bloqueios/slots |

### Admin

| Rota | Método | Auth | Doc | Descrição |
| --- | --- | --- | --- | --- |
| `/api/admin/dashboard` | GET | Admin | [dashboard.md](app/api/admin/dashboard.md) | Stats gerais + bookings recentes |
| `/api/admin/influencers` | GET | Admin | [admin-influencers.md](app/api/admin/admin-influencers.md) | Lista por status |
| `/api/admin/influencers/[id]/approve` | POST | Admin | [admin-influencers.md](app/api/admin/admin-influencers.md) | Aprova + checklist + WA |
| `/api/admin/influencers/[id]/reject` | POST | Admin | [admin-influencers.md](app/api/admin/admin-influencers.md) | Rejeita + motivo + WA |

---

## Páginas

| Rota | Doc | Auth | Descrição |
| --- | --- | --- | --- |
| `/` | [home.md](app/pages/home.md) | Não | Landing page |
| `/login` | [login.md](app/pages/login.md) | Não | Login (senha ou Magic Link) |
| `/cadastro-influenciadora` | [cadastro-influenciadora.md](app/pages/cadastro-influenciadora.md) | Não | Cadastro de influenciadora |
| `/cadastro-cliente` | [cadastro-cliente.md](app/pages/cadastro-cliente.md) | Não | Cadastro de empresa/cliente |
| `/[username]` | [perfil-publico.md](app/pages/perfil-publico.md) | Não | Perfil público da influenciadora |
| `/agendar/[username]` | [agendar.md](app/pages/agendar.md) | Não | Wizard de agendamento |
| `/lista-espera` | [lista-espera.md](app/pages/lista-espera.md) | Não | Formulário de lista de espera |
| `/painel` | [painel.md](app/pages/painel.md) | Influencer | Dashboard da influenciadora |
| `/painel/agendamentos` | [painel.md](app/pages/painel.md) | Influencer | Gestão de bookings |
| `/painel/calendario` | [painel.md](app/pages/painel.md) | Influencer | Disponibilidade |
| `/painel/servicos` | [painel.md](app/pages/painel.md) | Influencer | CRUD de serviços |
| `/painel/clientes` | [painel.md](app/pages/painel.md) | Influencer | Base de clientes |
| `/painel/lista-espera` | [painel.md](app/pages/painel.md) | Influencer | Aprovação de leads |
| `/painel/perfil` | [painel.md](app/pages/painel.md) | Influencer | Edição de perfil |
| `/cliente/explorar` | [cliente.md](app/pages/cliente.md) | Client | Explorar influenciadoras |
| `/cliente` | [cliente.md](app/pages/cliente.md) | Client | Meus agendamentos |
| `/cliente/perfil` | [cliente.md](app/pages/cliente.md) | Client | Perfil da empresa |
| `/admin` | [admin.md](app/pages/admin.md) | Admin | Dashboard admin |
| `/admin/influenciadoras` | [admin.md](app/pages/admin.md) | Admin | Aprovação de cadastros |
| `/admin/agendamentos` | [admin.md](app/pages/admin.md) | Admin | Todos os bookings |
| `/admin/clientes` | [admin.md](app/pages/admin.md) | Admin | Base de clientes global |
| `/admin/lista-espera` | [admin.md](app/pages/admin.md) | Admin | Leads globais |

---

## Componentes

| Componente | Doc | Usado em |
| --- | --- | --- |
| `AuthContext` | [components/AuthContext.md](components/AuthContext.md) | Todo o app |
| `Providers` | [components/Providers.md](components/Providers.md) | Root layout |
| `ProtectedLayout` | [components/ProtectedLayout.md](components/ProtectedLayout.md) | Layouts de área protegida |
| `PanelLayout` | [components/panel/PanelLayout.md](components/panel/PanelLayout.md) | Todas as páginas `/painel` |
| `BookingDetailDialog` | [components/panel/BookingDetailDialog.md](components/panel/BookingDetailDialog.md) | Agendamentos, Calendário |
| `Navbar` | [components/landing/Navbar.md](components/landing/Navbar.md) | Páginas públicas |
| `HeroSection` | [components/landing/HeroSection.md](components/landing/HeroSection.md) | Landing |
| `FeaturedInfluencers` | [components/landing/FeaturedInfluencers.md](components/landing/FeaturedInfluencers.md) | Landing |
| `InstagramFeed` | [components/profile/InstagramFeed.md](components/profile/InstagramFeed.md) | Perfil público (mock) |
| `UI Library (48 componentes)` | [components/ui/README.md](components/ui/README.md) | Todo o app (shadcn/ui) |

---

## Middleware

| Arquivo | Doc | Descrição |
| --- | --- | --- |
| `src/middleware.ts` | [middleware.md](middleware.md) | Proteção de rotas por JWT cookie + role (Edge Runtime) |

---

## Regras de Negócio

| # | Regra | Onde aplicada |
| --- | --- | --- |
| RN-01 | Influenciadora entra com status `em_analise`; só fica `ativa` após aprovação admin | `/api/auth/register/influencer`, `/api/admin/influencers/[id]/approve` |
| RN-02 | Apenas influenciadoras `ativas` aparecem na listagem pública | `/api/influencers` |
| RN-03 | Preços dos serviços ficam ocultos para usuários não autenticados | `/api/influencers/[slug]` |
| RN-04 | Código de confirmação gerado server-side no formato `AI-YYYY-NNNN` | `/api/bookings` POST, `src/lib/booking-code.ts` |
| RN-05 | Agendamento verifica disponibilidade antes de criar (slots + bloqueio) | `/api/bookings` POST |
| RN-06 | Se o cliente já existe na base da influencer, o booking nasce `confirmado` | `/api/bookings` POST |
| RN-07 | Máquina de estados: `pendente → confirmado → concluido`; `pendente/confirmado → cancelado` | `/api/bookings/[id]/status` |
| RN-08 | Notificação WhatsApp enviada ao cliente a cada mudança de status do booking | `/api/bookings/[id]/status` |
| RN-09 | Duplicata de WhatsApp bloqueada na lista de espera (por influencer_id) | `/api/waitlist` POST |
| RN-10 | Aprovação de waitlist faz upsert em `clients` com `origem='site'` | `/api/waitlist/[id]/status` |
| RN-11 | Aprovação admin requer checklist completo (todos os 5 itens `true`) | `/api/admin/influencers/[id]/approve` |
| RN-12 | Rejeição admin requer motivo obrigatório | `/api/admin/influencers/[id]/reject` |
| RN-13 | Receita calculada apenas de bookings `confirmado` ou `concluido` | `/api/admin/dashboard` |
| RN-14 | Soft delete de serviço quando há bookings vinculados (`ativo=false`) | `/api/services/[id]` DELETE |
| RN-15 | JWT customizado com role incluso; válido por 7 dias (HS256) | `src/lib/jwt.ts` |
| RN-16 | Middleware Edge protege `/painel`, `/admin`, `/cliente`, `/agendar` por role | `src/middleware.ts` |
| RN-17 | Notificação ao admin via WhatsApp para cada novo cadastro de influenciadora | `/api/auth/register/influencer` |
| RN-18 | Duplicata de WhatsApp bloqueada na base de clientes (por influencer_id) | `/api/clients` POST |

---

## Dados Mockados (a substituir)

| O que | Onde | Substitui |
| --- | --- | --- |
| Feed Instagram (6 imagens Unsplash) | `InstagramFeed.tsx` | Meta Graph API |
| Influenciadoras fallback (4 fictícias) | `FeaturedInfluencers.tsx` | Dados reais do banco |
| Avaliações e depoimentos | `InfluencerProfile` | Sistema de reviews real |
| Estatísticas (campanhas, engajamento) | `InfluencerProfile` | Métricas calculadas dos bookings |

---

## Pendências

| # | Item | Prioridade |
| --- | --- | --- |
| P1 | Regenerar tipos Supabase (`npx supabase gen types`) após mudanças no schema | Alta |
| P2 | Implementar reviews/avaliações de clientes | Média |
| P3 | Integrar Meta Graph API no `InstagramFeed` | Média |
| P4 | Implementar bot SDR n8n (ver [SDR.md](SDR.md)) | Baixa |
| P5 | Migrar `material_url` de TEXT (CSV) para `TEXT[]` no Supabase | Baixa |
| P6 | Configurar RLS no Supabase para proteção em profundidade | Alta |
| P7 | Atualizar copyright 2025 → 2026 no `Footer.tsx` | Baixa |
| P8 | Adicionar paginação em `/api/admin/dashboard` (allBookings limitado a 200) | Média |

---

## Legenda

| Símbolo | Significado |
| --- | --- |
| `Implementado` | Funcionando end-to-end com dados reais |
| `Planejado` | Arquitetura definida, não implementado |
| `Mock` | Usando dados fictícios, integração real pendente |
| `Pendente` | Ainda não iniciado |
