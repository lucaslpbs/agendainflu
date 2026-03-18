# Arquitetura — AgendaInflu

> **Última atualização:** 2026-03-18
> **Status:** Backend implementado — API Routes + Middleware ativos

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 14.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS + shadcn/ui + Radix UI | 3.x |
| Banco de dados | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth + JWT customizado (jose) | — |
| Notificações | Evolution API (WhatsApp) | — |
| Gráficos | Recharts | 2.x |
| Formulários | React Hook Form + Zod | — |
| Requisições | TanStack Query (React Query) | 5.x |
| Toast | Sonner | — |
| Deploy | Vercel (recomendado) | — |

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client Side)                         │
│                                                                       │
│  React Components (src/views/ + src/components/)                     │
│  ├── AuthContext (sessão Supabase + JWT próprio em localStorage)      │
│  ├── TanStack Query (cache de dados)                                  │
│  └── apiFetch() ─→ Authorization: Bearer <agenda-token>              │
│                                                                       │
└──────────────────────────────┬────────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼────────────────────────────────────────┐
│                   NEXT.JS SERVER (Edge + Node.js)                      │
│                                                                        │
│  src/middleware.ts (Edge Runtime)                                      │
│  ├── Verifica cookie auth-token (JWT) para rotas protegidas            │
│  └── Redireciona por role: influencer→/painel, admin→/admin,           │
│      client→/cliente                                                   │
│                                                                        │
│  src/app/api/** (Node.js Runtime)                                      │
│  ├── src/lib/auth.ts → lê JWT do cookie ou header Authorization        │
│  ├── src/lib/db.ts  → Supabase service_role (bypassa RLS)              │
│  └── src/lib/wa.ts  → Evolution API (WhatsApp)                         │
│                                                                        │
└───────────────┬────────────────────────────────────────────────────────┘
                │                              │
┌───────────────▼──────────┐    ┌──────────────▼──────────────────────┐
│  SUPABASE                │    │  EVOLUTION API (WhatsApp)            │
│                          │    │                                      │
│  PostgreSQL + Auth       │    │  Notificações para:                  │
│  ├── 10 tabelas          │    │  - Admin (novo cadastro)             │
│  ├── 7 ENUMs             │    │  - Influencer (aprovação/rejeição)   │
│  └── 1 SQL function      │    │  - Cliente (confirmação/cancelamento)│
│  Storage: avatars,       │    │                                      │
│  materials               │    └─────────────────────────────────────┘
└──────────────────────────┘
```

---

## Fluxo de Autenticação

```
1. Usuário faz login (Supabase Auth — senha ou Magic Link)
         │
         ▼
2. AuthContext detecta onAuthStateChange
         │
         ▼
3. POST /api/auth/exchange
   ├── Verifica supabase_token com supabase.auth.getUser()
   ├── Busca role em user_roles
   ├── Assina JWT customizado (HS256, 7 dias) com { sub, role }
   ├── Seta cookie httpOnly auth-token (servidor)
   └── Retorna { token, role } ao cliente
         │
         ▼
4. AuthContext armazena token em localStorage["agenda-token"]
         │
         ▼
5. Próximas requisições à API:
   ├── apiFetch() injeta Authorization: Bearer <token>
   └── Middleware lê cookie auth-token para proteção de rotas
```

---

## Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout com <Providers>
│   ├── page.tsx            # Landing page
│   ├── (auth)/             # Login, cadastros
│   ├── (public)/           # Perfil, agendar, lista-espera
│   ├── painel/             # Painel da influenciadora (protegido)
│   ├── cliente/            # Área do cliente/empresa (protegido)
│   ├── admin/              # Painel administrativo (protegido)
│   └── api/                # API Routes (server-side)
│       ├── auth/           # exchange, logout, me, register/*
│       ├── influencers/    # list, [slug], [slug]/availability
│       ├── services/       # CRUD de serviços
│       ├── bookings/       # Criar, listar, status
│       ├── clients/        # Clientes da influencer
│       ├── waitlist/       # Leads
│       ├── availability/   # Disponibilidade
│       └── admin/          # Dashboard + aprovação de influencers
├── views/                  # Componentes de página (lógica real)
│   ├── Index.tsx           # Landing
│   ├── Login.tsx
│   ├── panel/              # Dashboard, Agendamentos, etc.
│   ├── admin/              # AdminPages.tsx (multi-export)
│   └── client/             # ClientPages.tsx (multi-export)
├── components/
│   ├── ui/                 # shadcn/ui (48 componentes)
│   ├── landing/            # Navbar, HeroSection, FeaturedInfluencers, etc.
│   ├── panel/              # PanelLayout, BookingDetailDialog
│   ├── profile/            # InstagramFeed
│   ├── Providers.tsx       # QueryClient + AuthProvider + Toaster
│   └── ProtectedLayout.tsx # Guarda client-side por role
├── contexts/
│   └── AuthContext.tsx     # Estado global de auth
├── lib/
│   ├── db.ts               # Supabase (service_role)
│   ├── jwt.ts              # signJWT / verifyJWT (jose, Edge-compat)
│   ├── auth.ts             # requireAuth / requireAdmin / requireInfluencer
│   ├── wa.ts               # Evolution API
│   ├── errors.ts           # apiError helper
│   ├── booking-code.ts     # Gerador AI-YYYY-NNNN
│   ├── apiFetch.ts         # Fetch com JWT do localStorage
│   └── utils.ts            # cn()
├── integrations/supabase/
│   ├── client.ts           # Supabase JS client (anon key)
│   └── types.ts            # Tipos gerados (Database, Tables, Enums)
└── middleware.ts            # Edge middleware (proteção de rotas)
```

---

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| JWT customizado sobre Supabase Auth | Permite incluir `role` no token e verificar no Edge Middleware sem chamada extra ao banco |
| `jose` para JWT | Único runtime compatível tanto com Edge (middleware) quanto com Node.js (API Routes) |
| `service_role` nas API Routes | Simplifica queries sem RLS; toda autorização feita no código da rota |
| Views separadas de `app/` | Facilita reutilização e testa lógica sem depender do App Router |
| Dual storage (cookie + localStorage) | Cookie httpOnly para Edge Middleware; localStorage para `apiFetch` client-side |
| Evolution API para WhatsApp | Alternativa ao Twilio, mais barato; falha silenciosa se não configurado |
| Soft delete em serviços com bookings | Preserva histórico de agendamentos pagos |

---

## Variáveis de Ambiente

| Variável | Onde usar | Obrigatório |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente + servidor | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | API Routes (`src/lib/db.ts`) | Sim |
| `JWT_SECRET` | `src/lib/jwt.ts` | Sim |
| `EVOLUTION_API_URL` | `src/lib/wa.ts` | Não |
| `EVOLUTION_API_KEY` | `src/lib/wa.ts` | Não |
| `EVOLUTION_INSTANCE` | `src/lib/wa.ts` | Não |
| `NEXT_PUBLIC_APP_URL` | Links de agendamento no WhatsApp | Não |
| `NEXT_PUBLIC_SUPPORT_WA` | Botão WhatsApp de suporte | Não |

---

## Fluxos de Negócio Principais

### Cadastro de Influenciadora
```
/cadastro-influenciadora → POST /api/auth/register/influencer
→ Cria auth.users + influencers (status='em_analise') + user_roles (role='influencer')
→ Notifica admin via WhatsApp
→ Admin analisa em /admin/influenciadoras
→ POST /api/admin/influencers/[id]/approve ou /reject
→ Status muda para 'ativa' ou 'rejeitada'; influencer notificada via WhatsApp
```

### Agendamento de Serviço
```
/[username] → seleciona serviço → /agendar/[username]
→ POST /api/bookings (verifica disponibilidade, gera AI-YYYY-NNNN)
→ Status inicial: 'pendente' (ou 'confirmado' se cliente já cadastrado)
→ Influencer confirma/recusa em /painel/agendamentos
→ PATCH /api/bookings/[id]/status
→ Cliente notificado via WhatsApp a cada transição
```

### Lista de Espera → Cliente
```
/lista-espera → POST /api/waitlist
→ Lead fica com status='aguardando'
→ Influencer acessa /painel/lista-espera e aprova
→ PATCH /api/waitlist/[id]/status { status: 'aprovado' }
→ API faz upsert em clients (origem='site') + notifica via WhatsApp
```

---

## Deploy (Vercel — recomendado)

1. Conectar repositório no painel Vercel
2. Configurar todas as variáveis de ambiente listadas acima
3. Framework preset: **Next.js**
4. Build command: `next build`
5. Output directory: `.next`
6. Node.js version: 18.x ou superior
