# AgendaInflu — Índice de Documentação

> Gerado em: 2026-03-18 | Atualizado: 2026-03-18
> Status geral: `Backend implementado — API Routes + middleware ativos`
> Framework: Next.js 14 App Router + TypeScript + Supabase

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (client)                          │
│                                                                  │
│  src/app/ (Next.js App Router)                                   │
│  ├── layout.tsx ← Providers (QueryClient + Auth + Toast)         │
│  ├── page.tsx ← Landing                                          │
│  ├── (auth)/ ← login, cadastro-influenciadora, cadastro-cliente  │
│  ├── (public)/ ← [username], agendar/[username], lista-espera    │
│  ├── painel/ ← Dashboard + 6 subpáginas (influencer)             │
│  ├── cliente/ ← Explorar + Agendamentos + Perfil (empresa)       │
│  └── admin/ ← Dashboard + 4 subpáginas (admin)                   │
│                                                                  │
│  src/views/ ← Componentes de página (lógica + UI)               │
│  src/components/ ← Componentes reutilizáveis                     │
│  src/contexts/AuthContext ← Estado global de auth                │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Supabase JS Client (anon key)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    SUPABASE (Backend)                            │
│                                                                  │
│  Auth ── user_roles ── influencers ── services ── bookings       │
│                    └── clients ──────────────────────┘           │
│                    └── waitlist                                  │
│                    └── availability                              │
│  Storage: avatars (fotos), materials (kit mídia)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

NOTA: Não há App Routes (src/app/api/) — toda comunicação é
      direta frontend → Supabase via anon key.
```

---

## Páginas

| Rota | Arquivo doc | Descrição | Auth | Status |
|------|-------------|-----------|------|--------|
| `/` | [page.md](src/app/page.md) | Landing page | Não | Lovable |
| `/login` | [(auth)/login.md](src/app/(auth)/login.md) | Autenticação | Não | Lovable |
| `/cadastro-influenciadora` | [(auth)/cadastro-influenciadora.md](src/app/(auth)/cadastro-influenciadora.md) | Cadastro influencer | Não | Lovable |
| `/cadastro-cliente` | [(auth)/cadastro-cliente.md](src/app/(auth)/cadastro-cliente.md) | Cadastro empresa | Não | Lovable |
| `/[username]` | [(public)/username.md](src/app/(public)/username.md) | Perfil público | Não | Lovable |
| `/agendar/[username]` | [(public)/agendar-username.md](src/app/(public)/agendar-username.md) | Wizard de agendamento | Sim | Lovable |
| `/lista-espera` | [(public)/lista-espera.md](src/app/(public)/lista-espera.md) | Lista de espera | Não | Lovable |
| `/lista-espera/[username]` | [(public)/lista-espera.md](src/app/(public)/lista-espera.md) | Lista de espera (influencer) | Não | Lovable |
| `/painel` | [painel/dashboard.md](src/app/painel/dashboard.md) | Dashboard influencer | Sim (influ.) | Lovable |
| `/painel/agendamentos` | [painel/agendamentos.md](src/app/painel/agendamentos.md) | Gestão de bookings | Sim (influ.) | Lovable |
| `/painel/calendario` | [painel/calendario.md](src/app/painel/calendario.md) | Disponibilidade | Sim (influ.) | Lovable |
| `/painel/servicos` | [painel/servicos.md](src/app/painel/servicos.md) | CRUD de serviços | Sim (influ.) | Lovable |
| `/painel/clientes` | [painel/clientes.md](src/app/painel/clientes.md) | Base de clientes | Sim (influ.) | Lovable |
| `/painel/lista-espera` | [painel/lista-espera.md](src/app/painel/lista-espera.md) | Aprovação de leads | Sim (influ.) | Lovable |
| `/painel/perfil` | [painel/perfil.md](src/app/painel/perfil.md) | Edição de perfil | Sim (influ.) | Lovable |
| `/cliente` | [cliente/cliente.md](src/app/cliente/cliente.md) | Meus agendamentos | Sim | Lovable |
| `/cliente/explorar` | [cliente/cliente.md](src/app/cliente/cliente.md) | Explorar influencers | Sim | Lovable |
| `/cliente/perfil` | [cliente/cliente.md](src/app/cliente/cliente.md) | Perfil da empresa | Sim | Lovable |
| `/admin` | [admin/admin.md](src/app/admin/admin.md) | Dashboard admin | Sim (admin) | Lovable |
| `/admin/influenciadoras` | [admin/admin.md](src/app/admin/admin.md) | Aprovação de cadastros | Sim (admin) | Lovable |
| `/admin/agendamentos` | [admin/admin.md](src/app/admin/admin.md) | Todos os bookings | Sim (admin) | Lovable |
| `/admin/clientes` | [admin/admin.md](src/app/admin/admin.md) | Base de clientes global | Sim (admin) | Lovable |
| `/admin/lista-espera` | [admin/admin.md](src/app/admin/admin.md) | Leads globais | Sim (admin) | Lovable |

---

## Libs Utilitárias (`src/lib/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `db.ts` | Supabase client com service_role key (server-side, bypassa RLS) |
| `jwt.ts` | `signJWT` / `verifyJWT` — tokens HS256 de 7 dias via `jose` |
| `auth.ts` | `getAuthUser`, `requireAuth`, `requireInfluencer`, `requireAdmin` — lê cookie `auth-token` ou header `Authorization` |
| `errors.ts` | `apiError()` — mapeia erros para status HTTP (401/403/404/409/400/500) |
| `booking-code.ts` | `generateBookingCode()` — gera `AI-YYYY-NNNN` contando bookings do ano |
| `wa.ts` | `sendWhatsApp()` — Evolution API, falha silenciosa se não configurado |
| `apiFetch.ts` | `apiFetch()` — client-side fetch que injeta `Authorization: Bearer` do localStorage |

---

## API Routes (`src/app/api/`)

> Implementado: todas as rotas protegidas por JWT customizado via `src/lib/auth.ts`.
> Acesso ao banco via `src/lib/db.ts` (service_role, server-side).

### Auth
| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/auth/exchange` | POST | Supabase token | Troca access_token Supabase por JWT customizado; seta cookie `auth-token` |
| `/api/auth/logout` | POST | — | Limpa cookie `auth-token` |
| `/api/auth/me` | GET | JWT | Retorna dados do usuário pelo role |
| `/api/auth/register/influencer` | POST | — | Cria perfil + `user_roles` para influencer pós-signUp |
| `/api/auth/register/client` | POST | — | [P2✓][P3✓] Cria `client_profiles` tipado + `user_roles` role='client' |

### Influencers
| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/influencers` | GET | Opcional | Lista influencers ativas (filtros: nicho, busca, limit) |
| `/api/influencers/[slug]` | GET | Opcional | Perfil por username; preços ocultos sem auth |
| `/api/influencers/[slug]` | PATCH | Influencer/Admin | Atualiza perfil |
| `/api/influencers/[slug]/availability` | GET | — | Disponibilidade (aceita UUID ou username) [P10✓] |

### Services
| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/services` | GET | — | Serviços por influencer_id |
| `/api/services` | POST | Influencer | Cria serviço |
| `/api/services/[id]` | PATCH | Influencer | Atualiza serviço |
| `/api/services/[id]` | DELETE | Influencer | Soft-delete se tem bookings, hard-delete se não |

### Bookings
| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/bookings` | POST | Cliente | [P1✓] Cria booking com `codigo_confirmacao` real (AI-YYYY-NNNN); [P5✓] material_url como array |
| `/api/bookings` | GET | Influencer | Bookings da influencer (filtros: status, data) |
| `/api/bookings/client` | GET | Cliente | Bookings do cliente por user_id |
| `/api/bookings/[id]/status` | PATCH | Influencer/Admin | Transições de status validadas; notifica WhatsApp |

### Clients / Waitlist / Availability
| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/clients` | GET | Influencer | Clientes da influencer (search) |
| `/api/clients` | POST | Influencer | Cria cliente com check duplicata WhatsApp |
| `/api/clients/[id]/status` | PATCH | Influencer | ativo/bloqueado |
| `/api/waitlist` | POST | — | Insere lead; check duplicata; notifica WA |
| `/api/waitlist` | GET | Influencer | Waitlist da influencer |
| `/api/waitlist/[id]/status` | PATCH | Influencer | Aprovação cria cliente via upsert |
| `/api/availability` | GET | — | Disponibilidade por mês |
| `/api/availability` | POST | Influencer | Upsert de bloqueios/slots |

### Admin
| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/admin/dashboard` | GET | Admin | Stats gerais + bookings recentes |
| `/api/admin/influencers` | GET | Admin | Lista por status |
| `/api/admin/influencers/[id]/approve` | POST | Admin | Aprova cadastro + notifica WA |
| `/api/admin/influencers/[id]/reject` | POST | Admin | Rejeita cadastro + notifica WA |

---

## Middleware (`src/middleware.ts`)

[P4✓][P6✓][P14✓] Protege rotas server-side lendo cookie `auth-token`:
- `/painel/*` → requer role `influencer` ou `admin`
- `/admin/*` → requer role `admin`
- `/cliente/*` → requer role `client` ou `admin`
- `/agendar/*` → requer qualquer usuário autenticado

---

## Endpoints de API (legado — substituído pelas API Routes acima)

---

## Componentes Principais

| Componente | Arquivo doc | Usado em | Status |
|-----------|-------------|----------|--------|
| PanelLayout | [PanelLayout.md](src/components/panel/PanelLayout.md) | Todas as páginas /painel | Lovable |
| BookingDetailDialog | [BookingDetailDialog.md](src/components/panel/BookingDetailDialog.md) | Agendamentos, Calendário | Lovable |
| InstagramFeed | [InstagramFeed.md](src/components/profile/InstagramFeed.md) | InfluencerProfile | Lovable (mock) |
| Navbar | [Navbar.md](src/components/landing/Navbar.md) | Todas as páginas públicas | Lovable |
| HeroSection | [HeroSection.md](src/components/landing/HeroSection.md) | Landing | Lovable (mock) |
| FeaturedInfluencers | [FeaturedInfluencers.md](src/components/landing/FeaturedInfluencers.md) | Landing | Lovable (real) |
| Providers | [Providers.md](src/components/Providers.md) | Root layout | Lovable |
| ProtectedLayout | [ProtectedLayout.md](src/components/ProtectedLayout.md) | Layouts auth | Lovable |
| UI Library (49 componentes) | [ui/README.md](src/components/ui/README.md) | Todo o app | shadcn/ui |

---

## Contexts e Estado Global

| Context | Arquivo doc | Responsabilidade |
|---------|-------------|-----------------|
| AuthContext | [AuthContext.md](src/contexts/AuthContext.md) | Sessão, roles, dados da influencer |

> Não há Zustand nem outros stores — apenas React Context + TanStack Query.

---

## Dados Mockados

| O que está mockado | Onde | Substitui |
|---------------------|------|-----------|
| Avaliação (5 estrelas) | InfluencerProfile, ClientExplore, FeaturedInfluencers | Sistema de reviews real |
| Estatísticas (campanhas, engajamento, satisfação) | InfluencerProfile | Métricas calculadas dos bookings |
| Depoimentos (3 fixos) | InfluencerProfile | Reviews reais de clientes |
| Feed Instagram (6 imagens picsum) | InstagramFeed | Meta Graph API |
| Números da landing (500 influencers, 2000 campanhas, 98% satisfação) | HeroSection | Contadores reais do banco |
| Influenciadoras fallback (5 fictícias) | FeaturedInfluencers | Dados reais do banco |
| ~~Número WhatsApp suporte~~ ✅ | WhatsAppButton | Usa `NEXT_PUBLIC_SUPPORT_WA` |
| ~~`codigo_confirmacao: "TEMP"`~~ ✅ | AgendarServico → `/api/bookings` | Gera `AI-YYYY-NNNN` server-side |

---

## Problemas e Inconsistências

| # | Status | Problema | Arquivo | Observação |
|---|--------|---------|---------|------------|
| 1 | ✅ Corrigido | `codigo_confirmacao` salvo como `"TEMP"` | `/api/bookings` | Gera `AI-YYYY-NNNN` via `generateBookingCode()` |
| 2 | ✅ Corrigido | `client_profiles` usada com `as any` | `/api/auth/register/client` | Tipagem via `Database` types |
| 3 | ⚠️ Parcial | `influencer_analysis` sem tipo gerado | AdminPages | Tipo inline nas admin routes; tipos Supabase pendentes de regerar |
| 4 | ✅ Corrigido | Role `client` não atribuído no cadastro | `/api/auth/register/client` | Insere em `user_roles` server-side |
| 5 | ✅ Corrigido | `/painel` sem check de role `influencer` | `src/middleware.ts` | Middleware verifica JWT e role antes de servir a rota |
| 6 | ✅ Corrigido | `material_url` como string CSV | `/api/bookings` POST | Recebe array, junta com `,` para o banco (workaround até migrar coluna para `TEXT[]`) |
| 7 | ✅ Corrigido | `window.location.origin` no PerfilPage | `PerfilPage.tsx` | Substituído por `process.env.NEXT_PUBLIC_APP_URL` |
| 8 | ✅ Corrigido | Dois sistemas de toast (sonner + shadcn) | `Providers.tsx` | Removido `<Toaster />` shadcn; apenas Sonner |
| 9 | ✅ Corrigido | Fontes via `@import` no CSS | `layout.tsx` | Migrado para `next/font/google` com CSS variables |
| 10 | ✅ Corrigido | `max_por_dia` dupla fonte de verdade | `/api/influencers/[slug]/availability` | Usa apenas `services.max_por_dia` |
| 11 | ✅ Corrigido | WhatsApp suporte hardcoded | `WhatsAppButton.tsx` | Usa `NEXT_PUBLIC_SUPPORT_WA` do `.env` |
| 12 | ⚠️ Pendente | Copyright "2025" no Footer | `Footer.tsx` | Atualizar para 2026 |
| 13 | ✅ Corrigido | Todo acesso direto via anon key | `src/app/api/` | API Routes server-side com service_role + JWT auth |
| 14 | ✅ Corrigido | Sem middleware de proteção de rotas | `src/middleware.ts` | Middleware verifica JWT e redireciona por role |

---

## Legenda de Status

| Status | Significado |
|--------|-------------|
| `Lovable` | Criado pelo Lovable, pode usar dados reais ou mockados |
| `Implementado` | Backend real funcionando end-to-end |
| `Parcial` | Parcialmente implementado |
| `Pendente` | Ainda não iniciado |
