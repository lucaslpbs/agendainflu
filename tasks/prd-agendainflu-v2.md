# PRD: AgendaInflu v2 — Evolucao para SaaS de Qualidade

## 1. Sumario Executivo

O AgendaInflu e uma plataforma SaaS de agendamento de servicos de marketing com influenciadoras digitais, construida com Next.js 14 App Router + TypeScript + Supabase. O sistema possui tres perfis (admin, influencer, client) e cobre o fluxo completo: cadastro de influenciadoras, aprovacao admin, agendamento de servicos, lista de espera e notificacoes via WhatsApp.

**Estado atual:** Backend funcional com API Routes + Middleware, porem com lacunas criticas de seguranca (secrets expostos, RLS incompleto, sem rate limiting), performance (zero indexes no banco, sem paginacao em admin), responsividade parcial, e dados mockados em producao.

**Objetivo desta fase:** Transformar o MVP funcional em um SaaS de qualidade profissional — seguro, performatico, testado, responsivo e com identidade visual premium marketplace-first.

A analise autonoma do codigo identificou **136+ issues** distribuidas entre seguranca (29), API routes (37), frontend (70) e banco de dados (15+), que serao endereçadas neste PRD.

---

## 2. Objetivos e Metricas de Sucesso (OKRs)

### O1: Seguranca de nivel producao
- **KR1:** 100% das tabelas com RLS policies adequadas
- **KR2:** Zero secrets expostos no repositorio
- **KR3:** Rate limiting ativo em todos os endpoints criticos
- **KR4:** Score A+ no SecurityHeaders.com

### O2: Performance excelente
- **KR1:** LCP < 2.5s em todas as paginas
- **KR2:** FID < 100ms (INP < 200ms)
- **KR3:** CLS < 0.1
- **KR4:** Todas as listagens com paginacao (max 50 items/pagina)

### O3: Cobertura de testes
- **KR1:** 100% dos endpoints de API cobertos por testes E2E
- **KR2:** Todos os fluxos criticos de negocio com teste end-to-end
- **KR3:** CI/CD com testes obrigatorios antes de merge

### O4: Experiencia visual premium
- **KR1:** Design system documentado e consistente
- **KR2:** Score 90+ no Lighthouse Accessibility
- **KR3:** 100% das paginas responsivas (375px a 1440px+)

### O5: Funcionalidades completas
- **KR1:** Zero dados mockados em producao
- **KR2:** Sistema de reviews funcional
- **KR3:** Instagram feed real integrado

---

## 3. Escopo

### IN (dentro do escopo)
- Redesign completo de layout com design system
- Suite de testes E2E com Cypress
- Hardening de seguranca (RLS, rate limiting, headers, Zod)
- Otimizacao de performance (indexes, caching, paginacao, imagens)
- Responsividade mobile-first completa
- Correcao de todas as pendencias documentadas (P1-P8)
- Correcao de bugs e inconsistencias identificados na analise de codigo
- Sistema de reviews/avaliacoes (P2)
- Integracao real do Instagram feed (P3)

### OUT (fora do escopo)
- Bot SDR n8n (P4 — sera fase separada)
- Sistema de pagamentos/checkout
- App mobile nativo
- Multi-idioma/i18n
- Notificacoes push
- Chat em tempo real entre influencer e cliente
- Analytics avancado / BI dashboard

---

## 4. Areas de Trabalho

---

### AREA 1: SEGURANCA (Alta Prioridade)

**Descricao:** Corrigir vulnerabilidades criticas e elevar a seguranca ao nivel producao.

#### Criterios de Aceite
- [ ] Nenhum secret exposto no repositorio Git
- [ ] RLS ativo e testado para todas as tabelas
- [ ] Rate limiting configurado em auth, bookings, waitlist
- [ ] Headers de seguranca (CSP, HSTS, X-Frame-Options) retornados em todas as respostas
- [ ] Todos os inputs validados com Zod schemas
- [ ] TypeScript strict mode habilitado
- [ ] Cookie auth-token com flags secure=true, sameSite=strict

#### Tarefas Tecnicas

**US-SEC-001: Remover secrets do repositorio** (Esforco: P)
- [ ] Remover `.env.local` do Git history (`git filter-branch` ou `BFG`)
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Revogar e rotacionar TODAS as credenciais expostas: `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `META_APP_SECRET`, `CRON_SECRET`
- [ ] Criar `.env.example` com placeholders
- **Arquivo:** `.env.local` (secrets em linhas 2-29)
- **Severidade:** CRITICA

**US-SEC-002: Configurar RLS completo no Supabase** (Esforco: G)
- [ ] Criar migration com policies faltantes:
  - `clients_select_own` — clients lerem seus proprios registros via `user_id = auth.uid()`
  - `bookings_select_own_client` — clients lerem seus bookings via `client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())`
  - `bookings_select_influencer` — influencers lerem seus bookings
- [ ] Adicionar DELETE policies para: `influencers`, `services`, `availability`, `client_profiles`
- [ ] Testar todas as policies com usuarios de cada role
- [ ] Atualizar DATABASE.md com estado real das policies
- **Arquivos:** `supabase/migrations/`, `docs/DATABASE.md`

**US-SEC-003: Headers de seguranca HTTP** (Esforco: P)
- [ ] Configurar em `next.config.mjs`:
  ```
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://images.unsplash.com; connect-src 'self' https://*.supabase.co
  ```
- **Arquivo:** `next.config.mjs` (atualmente sem headers, linhas 1-14)

**US-SEC-004: Rate limiting nas API Routes** (Esforco: M)
- [ ] Instalar `@upstash/ratelimit` ou implementar in-memory rate limiter
- [ ] Aplicar nos endpoints:
  - `/api/auth/*` — 10 req/min por IP
  - `/api/bookings` POST — 5 req/min por usuario
  - `/api/waitlist` POST — 5 req/min por IP
  - `/api/auth/register/*` — 3 req/min por IP
- [ ] Retornar 429 com header `Retry-After`

**US-SEC-005: Validacao com Zod em todos os endpoints** (Esforco: G)
- [ ] Criar schemas Zod centralizados em `src/lib/schemas/`:
  - `booking.schema.ts` — validar data_agendada como data ISO futura, IDs como UUID
  - `auth.schema.ts` — validar email, senha, campos de registro
  - `service.schema.ts` — validar tipo contra enum, preco > 0, max_por_dia >= 1
  - `client.schema.ts` — validar WhatsApp formato, email
  - `waitlist.schema.ts` — validar campos obrigatorios
  - `status.schema.ts` — validar transicoes de status contra enums permitidos
- [ ] Substituir validacoes manuais em TODOS os endpoints POST/PATCH
- [ ] Corrigir especificamente:
  - `/api/admin/bookings/route.ts` (linha 26-32): aceita qualquer status sem validar
  - `/api/admin/waitlist/route.ts` (linha 26-32): idem
  - `/api/clients/[id]/status/route.ts` (linha 11-24): idem
  - `/api/services/route.ts` (linha 50): `parseInt(max_por_dia)` sem validacao
- **Severidade:** ALTA

**US-SEC-006: Corrigir cookie security e JWT** (Esforco: P)
- [ ] Alterar `sameSite: 'lax'` para `'strict'` em `src/app/api/auth/exchange/route.ts` (linha 71)
- [ ] Considerar reduzir JWT expiration de 7 dias para 24h com refresh token
- [ ] Implementar refresh token strategy
- **Arquivo:** `src/app/api/auth/exchange/route.ts` (linhas 68-74)

**US-SEC-007: Habilitar TypeScript strict mode** (Esforco: G)
- [ ] Alterar `tsconfig.json`: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- [ ] Corrigir todos os erros de tipo resultantes
- [ ] Eliminar todos os `as any` (29 arquivos afetados, incluindo API routes e cron jobs)
- [ ] Regenerar tipos Supabase (`npx supabase gen types`) — pendencia P1
- **Arquivo:** `tsconfig.json` (linhas 6, 15-18)

**US-SEC-008: Mover N8N webhook para env var** (Esforco: P)
- [ ] Remover URL hardcoded em `/api/bookings/notify-whatsapp/route.ts` (linha 3)
- [ ] Criar `N8N_WEBHOOK_URL` como variavel de ambiente
- **Severidade:** CRITICA

**US-SEC-009: Protecao CSRF e CORS** (Esforco: M)
- [ ] Configurar CORS em next.config.mjs permitindo apenas dominio de producao
- [ ] Implementar CSRF token nos formularios de mutacao
- [ ] Corrigir comparacao timing-safe do CRON_SECRET em `src/app/api/cron/update-followers/route.ts` (linha 5-8)

**US-SEC-010: Corrigir fallback inseguro do db.ts** (Esforco: P)
- [ ] Em `src/lib/db.ts` (linhas 11-14): remover fallback para ANON_KEY
- [ ] Lancar erro se `SUPABASE_SERVICE_ROLE_KEY` nao existir em producao
- [ ] Manter fallback apenas em development com warning no console

**US-SEC-011: Validar state no Instagram OAuth callback** (Esforco: P)
- [ ] Em `src/app/api/auth/instagram/callback/route.ts` (linha 12): validar que `state` e UUID valido antes de usar no banco
- [ ] Implementar CSRF token real no fluxo OAuth (nao apenas influencer_id)

**Dependencias:** US-SEC-001 deve ser primeira tarefa. US-SEC-007 depende de US-SEC-005 (schemas Zod).

---

### AREA 2: PERFORMANCE E OTIMIZACAO (Alta Prioridade)

**Descricao:** Otimizar queries, caching, imagens e bundle para atingir Core Web Vitals.

#### Criterios de Aceite
- [ ] 15+ indexes criados no banco para FKs e colunas de filtro
- [ ] Paginacao em todas as listagens (admin, bookings, clients, waitlist)
- [ ] next/image em todas as imagens do app
- [ ] Loading skeletons em todas as listas e dashboards
- [ ] Bundle < 200KB (gzipped) para primeira carga

#### Tarefas Tecnicas

**US-PERF-001: Criar indexes no banco de dados** (Esforco: M)
- [ ] Criar migration com indexes:
  ```sql
  -- clients
  CREATE INDEX idx_clients_influencer_id ON clients(influencer_id);
  CREATE INDEX idx_clients_whatsapp_influencer ON clients(whatsapp, influencer_id);

  -- bookings
  CREATE INDEX idx_bookings_influencer_id ON bookings(influencer_id);
  CREATE INDEX idx_bookings_client_id ON bookings(client_id);
  CREATE INDEX idx_bookings_service_id ON bookings(service_id);
  CREATE INDEX idx_bookings_data_agendada ON bookings(data_agendada);
  CREATE INDEX idx_bookings_status ON bookings(status);
  CREATE INDEX idx_bookings_influencer_data ON bookings(influencer_id, data_agendada);

  -- services
  CREATE INDEX idx_services_influencer_id ON services(influencer_id);
  CREATE INDEX idx_services_ativo ON services(ativo);

  -- availability
  CREATE INDEX idx_availability_influencer_data ON availability(influencer_id, data);

  -- influencers
  CREATE INDEX idx_influencers_status ON influencers(status);

  -- waitlist
  CREATE INDEX idx_waitlist_influencer_id ON waitlist(influencer_id);
  CREATE INDEX idx_waitlist_status ON waitlist(status);

  -- user_roles
  CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
  ```
- [ ] Adicionar UNIQUE constraint: `UNIQUE(influencer_id, whatsapp)` em `clients`
- **Impacto:** CRITICO para performance de queries com filtros e joins

**US-PERF-002: Implementar paginacao em todas as listagens** (Esforco: G)
- [ ] Criar helper de paginacao reutilizavel: `src/lib/pagination.ts`
  - Parametros: `page`, `limit` (default 20, max 100), `sort`, `order`
  - Retorno: `{ data, total, page, totalPages, hasNext }`
- [ ] Implementar paginacao nos endpoints:
  - `/api/admin/dashboard` (atualmente hardcoded `.limit(200)`)
  - `/api/admin/bookings` (sem limit)
  - `/api/admin/clients` (sem limit)
  - `/api/admin/influencers` (sem limit)
  - `/api/admin/waitlist` (sem limit)
  - `/api/bookings` GET (sem limit)
  - `/api/bookings/client` GET
  - `/api/clients` GET
  - `/api/waitlist` GET
- [ ] Implementar componente de paginacao no frontend (cursor-based ou offset)
- **Pendencia:** P8 — paginacao no admin dashboard

**US-PERF-003: Otimizar queries N+1 no booking creation** (Esforco: M)
- [ ] Refatorar `/api/bookings/route.ts` (linhas 28-139):
  - Combinar queries de verificacao de client (WhatsApp + user_id) em uma unica query
  - Combinar busca de service + influencer com JOIN
  - Usar transacao atomica para check de disponibilidade + insert
- [ ] Corrigir race condition na criacao de client duplicado (linhas 28-77)
- [ ] Corrigir race condition no check de disponibilidade (linhas 80-100) — usar `SELECT FOR UPDATE`

**US-PERF-004: Otimizar imagens com next/image** (Esforco: M)
- [ ] Substituir `<img>` por `<Image>` do next/image em:
  - `FeaturedInfluencers.tsx` (linhas 70-74)
  - `InfluencerProfile.tsx` (linha 145, 248)
  - `InstagramFeed.tsx` (linha 92)
- [ ] Configurar `images.remotePatterns` em `next.config.mjs` para dominios permitidos
- [ ] Definir `priority` nas imagens above-the-fold (hero, cards da landing)
- [ ] Usar `placeholder="blur"` com blurDataURL para fotos de perfil

**US-PERF-005: Code splitting e lazy loading** (Esforco: M)
- [ ] Implementar `dynamic()` do Next.js para:
  - Componentes de graficos (Recharts) no Dashboard e Admin
  - `BookingDetailDialog` (modal pesado)
  - `InstagramFeed` (fetch externo)
  - Calendario no PanelLayout
- [ ] Analisar bundle com `@next/bundle-analyzer`
- [ ] Verificar tree-shaking de lucide-react (importar icones individualmente)

**US-PERF-006: Caching e prefetch** (Esforco: M)
- [ ] Configurar `revalidate` nas paginas publicas:
  - Landing page: ISR 60s
  - Perfil publico `/[username]`: ISR 300s
  - Listagem de influencers: ISR 60s
- [ ] Adicionar `Cache-Control` headers nas API routes publicas
- [ ] Implementar `prefetch` no `next/link` para navegacao previsivel
- [ ] Configurar SWR/TanStack Query com `staleTime` adequado por recurso

**US-PERF-007: Loading skeletons em todas as paginas** (Esforco: M)
- [ ] Criar componentes skeleton reutilizaveis:
  - `SkeletonCard`, `SkeletonTable`, `SkeletonProfile`, `SkeletonDashboard`
- [ ] Substituir spinners inconsistentes por skeletons padronizados
- [ ] Paginas afetadas: Dashboard, Admin, ClientPages, InfluencerProfile, FeaturedInfluencers
- **Problema atual:** 4 padroes diferentes de loading (spinner, skeleton grid, pulse, nenhum)

**Dependencias:** US-PERF-001 pode rodar em paralelo com tudo. US-PERF-002 depende de definir interface de paginacao.

---

### AREA 3: TESTES AUTOMATIZADOS COM CYPRESS (Alta Prioridade)

**Descricao:** Criar suite completa de testes E2E para garantir qualidade e prevenir regressoes.

#### Criterios de Aceite
- [ ] Cypress configurado com TypeScript
- [ ] 100% dos endpoints API cobertos
- [ ] Fluxos criticos de negocio cobertos end-to-end
- [ ] Testes de autorizacao (acesso negado para roles incorretos)
- [ ] CI pipeline com testes obrigatorios
- [ ] Fixtures de dados para testes repetiveis

#### Tarefas Tecnicas

**US-TEST-001: Setup inicial do Cypress** (Esforco: M)
- [ ] Instalar `cypress` e `@cypress/code-coverage`
- [ ] Configurar `cypress.config.ts` com baseUrl, viewportWidth, etc.
- [ ] Estrutura de pastas:
  ```
  cypress/
  ├── e2e/
  │   ├── auth/           # Testes de autenticacao
  │   ├── influencers/    # CRUD de influencers
  │   ├── services/       # CRUD de servicos
  │   ├── bookings/       # Fluxo de agendamento
  │   ├── clients/        # Gestao de clientes
  │   ├── waitlist/       # Lista de espera
  │   ├── admin/          # Painel admin
  │   └── public/         # Paginas publicas
  ├── fixtures/           # Dados de teste
  ├── support/
  │   ├── commands.ts     # Custom commands
  │   └── e2e.ts          # Setup global
  └── plugins/
  ```
- [ ] Criar custom commands: `cy.login(role)`, `cy.apiRequest(method, url, body)`, `cy.createInfluencer()`, `cy.createBooking()`
- [ ] Configurar `scripts` no package.json: `cy:open`, `cy:run`, `cy:ci`

**US-TEST-002: Testes de Auth** (Esforco: M)
- [ ] POST `/api/auth/exchange` — token valido, token invalido, token expirado
- [ ] POST `/api/auth/logout` — limpa cookie
- [ ] GET `/api/auth/me` — com token, sem token, token expirado
- [ ] POST `/api/auth/register/influencer` — sucesso, campos faltantes, username duplicado
- [ ] POST `/api/auth/register/client` — sucesso, campos faltantes

**US-TEST-003: Testes de Influencers** (Esforco: M)
- [ ] GET `/api/influencers` — lista, filtros (nicho, busca, limit)
- [ ] GET `/api/influencers/[slug]` — existente, inexistente, precos ocultos sem auth
- [ ] PATCH `/api/influencers/[slug]` — dono atualiza, outro nao pode, admin pode
- [ ] GET `/api/influencers/[slug]/availability` — por mes, sem dados

**US-TEST-004: Testes de Services** (Esforco: M)
- [ ] GET `/api/services?influencer_id=` — lista
- [ ] POST `/api/services` — criar, campos invalidos, nao-influencer
- [ ] PATCH `/api/services/[id]` — atualizar, verificar ownership
- [ ] DELETE `/api/services/[id]` — soft delete com bookings, hard delete sem

**US-TEST-005: Testes de Bookings** (Esforco: G)
- [ ] POST `/api/bookings` — criar com disponibilidade, sem disponibilidade, dia bloqueado, data passada, cliente existente vs novo
- [ ] GET `/api/bookings` — listar por influencer, filtros status/data
- [ ] GET `/api/bookings/client` — listar por client
- [ ] PATCH `/api/bookings/[id]/status` — todas as transicoes validas, transicoes invalidas

**US-TEST-006: Testes de Clients e Waitlist** (Esforco: M)
- [ ] GET/POST `/api/clients` — listar, criar, duplicata WhatsApp
- [ ] PATCH `/api/clients/[id]/status` — ativar, bloquear
- [ ] POST `/api/waitlist` — inserir, duplicata
- [ ] GET `/api/waitlist` — listar por influencer
- [ ] PATCH `/api/waitlist/[id]/status` — aprovacao (cria client), rejeicao

**US-TEST-007: Testes de Admin** (Esforco: M)
- [ ] GET `/api/admin/dashboard` — stats, sem auth, role errado
- [ ] GET `/api/admin/influencers` — por status
- [ ] POST `/api/admin/influencers/[id]/approve` — checklist completo, incompleto
- [ ] POST `/api/admin/influencers/[id]/reject` — com motivo, sem motivo

**US-TEST-008: Testes de Autorizacao** (Esforco: M)
- [ ] Client tenta acessar `/painel` — redirect
- [ ] Influencer tenta acessar `/admin` — redirect
- [ ] Sem auth tenta acessar rotas protegidas — redirect para `/login`
- [ ] Client tenta criar servico — 403
- [ ] Influencer tenta aprovar outra influencer — 403

**US-TEST-009: Fluxos E2E de negocio** (Esforco: GG)
- [ ] Fluxo completo: cadastro influencer → aprovacao admin → perfil ativo → cliente agenda → influencer confirma → conclui
- [ ] Fluxo lista de espera: lead entra → influencer aprova → vira client → agenda servico
- [ ] Fluxo de cancelamento: booking pendente → cancelado, booking confirmado → cancelado
- [ ] Fluxo de rejeicao: influencer cadastra → admin rejeita com motivo

**US-TEST-010: CI Integration** (Esforco: M)
- [ ] Configurar GitHub Actions workflow
- [ ] Cypress run no CI com Supabase local (docker-compose)
- [ ] Reportar cobertura de testes
- [ ] Bloquear merge sem testes passando

**Dependencias:** US-TEST-001 e pre-requisito de todos os outros. US-SEC-005 (Zod) facilita fixtures.

---

### AREA 4: REDESIGN E DINAMISMO DE LAYOUT (Alta Prioridade)

**Descricao:** Redesign completo com identidade visual de SaaS premium marketplace-first.

#### Criterios de Aceite
- [ ] Design system documentado (paleta, tipografia, espacamentos, motion)
- [ ] Landing page com vitrine de influenciadoras, filtros interativos, busca real-time
- [ ] Consistencia visual entre todas as areas (landing, painel, admin, cliente)
- [ ] Animacoes fluidas com Framer Motion
- [ ] Componentes shadcn/ui revisados e padronizados

#### Tarefas Tecnicas

**US-UI-001: Definir Design System** (Esforco: G)
- [ ] Definir paleta de cores (primary, secondary, accent, destructive, muted)
- [ ] Definir tipografia (font-family, scale, weights)
- [ ] Definir espacamentos (4px grid system)
- [ ] Definir border-radius padrao (sm, md, lg, xl, 2xl)
- [ ] Definir sombras (sm, md, lg, xl)
- [ ] Definir animacoes padrao (fade-in, slide-up, scale, duracoes)
- [ ] Documentar em `src/styles/design-system.md`
- [ ] Atualizar `tailwind.config.ts` com tokens do design system

**US-UI-002: Redesign da Landing Page** (Esforco: GG)
- [ ] Hero Section: headline impactante, CTA claro, animacao de entrada, background gradiente
- [ ] Vitrine de Influenciadoras (marketplace-first):
  - Cards ricos com foto, nome, nicho, seguidores, rating, preview de servicos
  - Filtros interativos por nicho (chips ou dropdown)
  - Busca em tempo real (debounced, 300ms)
  - Animacao de entrada staggered nos cards
  - Layout grid responsivo (1-2-3-4 colunas)
- [ ] Secao "Como Funciona" (3-4 steps com icones animados)
- [ ] Secao de depoimentos reais (quando reviews estiver implementado)
- [ ] Footer redesenhado com links uteis, redes sociais, copyright 2026
- [ ] Navbar com glassmorphism/blur effect no scroll
- **Arquivos:** `src/views/Index.tsx`, `src/components/landing/*`

**US-UI-003: Redesign do Painel da Influencer** (Esforco: G)
- [ ] Sidebar redesenhada com icones, labels, badge de notificacoes
- [ ] Dashboard com cards de metricas reais (bookings, receita, clientes, conversao)
- [ ] Graficos com cores do design system
- [ ] Tabelas redesenhadas com status badges consistentes
- [ ] Calendario visual melhorado
- **Arquivo:** `src/components/panel/PanelLayout.tsx`, `src/views/panel/*`

**US-UI-004: Redesign da Area do Cliente** (Esforco: M)
- [ ] Pagina de explorar influenciadoras (marketplace view)
- [ ] Cards de bookings do cliente com timeline visual
- [ ] Perfil da empresa com formulario limpo
- **Arquivo:** `src/views/client/ClientPages.tsx`

**US-UI-005: Redesign do Painel Admin** (Esforco: M)
- [ ] Dashboard com KPIs visuais (cards com sparklines)
- [ ] Tabelas paginadas com filtros e sort
- [ ] Processo de aprovacao com checklist visual
- [ ] Avatar admin real (nao hardcoded "A")
- **Problema atual:** Avatar admin hardcoded em `AdminPages.tsx` (linha 58)

**US-UI-006: Padronizar Status Badges** (Esforco: P)
- [ ] Criar componente reutilizavel `<StatusBadge status={} variant={} />`
- [ ] Eliminar 4 implementacoes diferentes encontradas:
  - `AgendamentosPage.tsx` (linha 40-48): `bg-accent/20`
  - `AdminPages.tsx` (linha 245-264): `bg-accent/10`
  - `BookingDetailDialog.tsx` (linha 21-26): com border
  - `CalendarioPage.tsx` (linha 100-108): outra variante
- [ ] Usar cores e tamanhos do design system

**US-UI-007: Padronizar Loading States** (Esforco: P)
- [ ] Criar componente unico de loading (skeleton-based)
- [ ] Substituir 4 padroes diferentes:
  - Spinner animado (`AgendarServico.tsx`, `InfluencerProfile.tsx`)
  - Skeleton grid (`AdminPages.tsx`)
  - Pulse skeletons (`ClientPages.tsx`)
  - Nenhum loading (varias paginas)

**US-UI-008: Padronizar Form Inputs** (Esforco: P)
- [ ] Usar exclusivamente componentes shadcn/ui `<Input>` em vez de `<input>` raw
- [ ] Corrigir inconsistencias de padding (`py-2.5` vs `py-2`) e focus rings
- **Arquivos afetados:** `ListaEspera.tsx` (linha 94-111), `ClientesPage.tsx` (linha 65-71)

**Dependencias:** US-UI-001 e pre-requisito de todos os redesigns. US-UI-006 e US-UI-007 podem rodar em paralelo.

---

### AREA 5: RESPONSIVIDADE (Media Prioridade)

**Descricao:** Garantir experiencia excelente em mobile, tablet e desktop.

#### Criterios de Aceite
- [ ] Todas as 22+ paginas auditadas e corrigidas para mobile (375px)
- [ ] Breakpoints definidos: mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Tabelas adaptadas para mobile (cards ou scroll horizontal)
- [ ] Menus mobile com hamburger menu funcional
- [ ] Wizard de agendamento fluido no mobile

#### Tarefas Tecnicas

**US-RESP-001: Auditoria completa mobile-first** (Esforco: G)
- [ ] Testar cada uma das 22 paginas em 375px, 768px, 1280px
- [ ] Documentar issues encontrados por pagina
- [ ] Priorizar correcoes por impacto no usuario

**US-RESP-002: Corrigir Painel Influencer mobile** (Esforco: M)
- [ ] Sidebar: converter para bottom navigation ou drawer no mobile
  - `PanelLayout.tsx` (linha 42): `w-64` hardcoded
- [ ] Tabelas: converter para card-list no mobile
- [ ] Calendario: grid `grid-cols-7` (linha 135-136) — usar scroll horizontal ou simplificar
- [ ] Dashboard: stack cards verticalmente

**US-RESP-003: Corrigir Admin mobile** (Esforco: M)
- [ ] Sidebar `w-64` hardcoded (linha 38) — mesma solucao do painel
- [ ] Graficos: `height={280}` fixo (linha 162) — usar container queries ou percentual
- [ ] Tabelas de dados: converter para cards empilhados no mobile

**US-RESP-004: Corrigir Wizard de Agendamento mobile** (Esforco: M)
- [ ] Steps indicator horizontal: converter para vertical ou dots no mobile
- [ ] Grid de datas `grid-cols-3 sm:grid-cols-4` (linha 318) — revisar para mobile
- [ ] `BookingDetailDialog` `sm:max-w-lg` (linha 96) — full-width no mobile

**US-RESP-005: Corrigir paginas publicas mobile** (Esforco: M)
- [ ] Perfil da influenciadora: grid de servicos sem breakpoint `lg` (linha 264)
- [ ] Landing page: vitrine de cards responsiva
- [ ] Lista de espera: form `max-w-lg` (linha 81) — testar em ultra-small

**Dependencias:** US-UI-001 (design system com breakpoints definidos).

---

### AREA 6: PENDENCIAS DO PROJETO (Media-Alta Prioridade)

**Descricao:** Completar funcionalidades inacabadas e substituir dados mockados.

#### Tarefas Tecnicas

**US-PEND-001: Regenerar tipos Supabase (P1)** (Esforco: P)
- [ ] Executar `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`
- [ ] Incluir campos Instagram OAuth que estao faltando nos tipos
- [ ] Verificar que migration `add_instagram_oauth_fields` existe — **ALERTA: migration nao encontrada no repositorio, apenas documentada**
- [ ] Se nao existir, criar migration adicionando os 7 campos documentados em DATABASE.md (linhas 297-314)

**US-PEND-002: Sistema de Reviews/Avaliacoes (P2)** (Esforco: GG)
- [ ] Criar migration:
  ```sql
  CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id) NOT NULL,
    client_id uuid REFERENCES clients(id) NOT NULL,
    influencer_id uuid REFERENCES influencers(id) NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    texto text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE(booking_id)
  );
  CREATE INDEX idx_reviews_influencer ON reviews(influencer_id);
  ```
- [ ] Criar API routes: GET/POST `/api/reviews`
- [ ] Criar componente `<ReviewForm>` (apos booking concluido)
- [ ] Criar componente `<ReviewList>` (no perfil publico)
- [ ] Calcular rating medio no perfil publico
- [ ] Substituir `mockTestimonials` em `InfluencerProfile.tsx` (linhas 22-26)
- [ ] Criar RLS policies para reviews

**US-PEND-003: Integrar Instagram Feed real (P3)** (Esforco: G)
- [ ] Verificar/criar migration para campos OAuth do Instagram
- [ ] Implementar `/api/instagram/feed` com cache de 1h
- [ ] Atualizar `InstagramFeed.tsx` para usar feed real quando `instagram_connected = true`
- [ ] Manter fallback Unsplash quando nao conectado
- [ ] Adicionar timeout nas chamadas a Graph API (faltante em `feed/route.ts` linha 25-50)

**US-PEND-004: Migrar material_url para TEXT[] (P5)** (Esforco: P)
- [ ] Criar migration: `ALTER TABLE bookings ALTER COLUMN material_url TYPE TEXT[] USING string_to_array(material_url, ',');`
- [ ] Atualizar tipos Supabase
- [ ] Atualizar `/api/bookings/route.ts` para usar array
- [ ] Atualizar frontend `AgendarServico.tsx` (linha 141)

**US-PEND-005: Copyright 2026 (P7)** (Esforco: P)
- [ ] Atualizar copyright em `Footer.tsx` de 2025 para 2026
- [ ] Verificar outros lugares com ano hardcoded

**US-PEND-006: Substituir dados mockados** (Esforco: M)
- [ ] `FeaturedInfluencers.tsx` (linhas 8-13): carregar influenciadoras reais do banco, remover fallback Unsplash com dados ficticios
- [ ] `InfluencerProfile.tsx` (linhas 28-33): `mockStats` — substituir por metricas reais calculadas dos bookings (total campanhas, marcas atendidas, taxa conversao)
- [ ] `AdminPages.tsx` (linha 58): avatar "A" hardcoded — usar dados reais do admin

**US-PEND-007: Metricas reais de engajamento** (Esforco: M)
- [ ] Calcular do banco: total bookings concluidos, total clientes unicos, receita total, taxa de conversao (confirmados/total)
- [ ] Criar endpoint `/api/influencers/[slug]/stats` para metricas publicas
- [ ] Usar no perfil publico e no dashboard da influencer

**Dependencias:** US-PEND-001 e pre-requisito de US-PEND-002 e US-PEND-003. US-PEND-004 pode rodar independente.

---

### AREA 7: MELHORIAS IDENTIFICADAS NA ANALISE AUTONOMA

**Descricao:** Issues encontrados proativamente durante analise do codigo-fonte que nao constavam nas pendencias documentadas.

---

#### 7.1 BUGS CRITICOS

**BUG-001: Calculo de data incorreto no availability** (Esforco: P)
- **Arquivo:** `src/app/api/availability/route.ts` (linhas 20-23)
- **Problema:** `new Date(parseInt(year), parseInt(month), 0)` usa mes 1-indexed do JavaScript mas recebe mes ja 1-indexed, resultando em datas erradas. `parseInt("03") = 3`, mas `Date(2025, 3, 0)` retorna ultimo dia de Marco (mes 2 = Marco no JS).
- **Impacto:** Calculo de ultimo dia do mes esta deslocado. Marco vira Abril.
- **Solucao:** Nao e bug — `new Date(year, month, 0)` retorna o ultimo dia do mes anterior, entao `new Date(2025, 3, 0)` = 31 de Marco. Mas a variavel `mes` ja pode estar com formato inesperado. Revisar e adicionar validacao.

**BUG-002: Race condition na criacao de clientes durante booking** (Esforco: M)
- **Arquivo:** `src/app/api/bookings/route.ts` (linhas 28-77)
- **Problema:** Duas requisicoes simultaneas podem criar clientes duplicados porque o check-then-act nao e atomico.
- **Impacto:** Duplicatas de clientes no banco.
- **Solucao:** Usar transacao com `SELECT FOR UPDATE` ou implementar upsert atomico. Complementar com constraint `UNIQUE(influencer_id, whatsapp)` no banco.

**BUG-003: Race condition no check de disponibilidade** (Esforco: M)
- **Arquivo:** `src/app/api/bookings/route.ts` (linhas 80-100)
- **Problema:** Verifica slots disponiveis, conta bookings existentes, e insere — mas outra requisicao pode inserir entre o check e o insert.
- **Impacto:** Overbooking — mais bookings que slots disponiveis.
- **Solucao:** Usar transacao atomica ou advisory lock no PostgreSQL.

**BUG-004: max_por_dia do servico nunca utilizado** (Esforco: P)
- **Arquivo:** `src/app/api/influencers/[slug]/availability/route.ts` (linhas 44, 49-63)
- **Problema:** `maxPorDia` e buscado mas nunca usado no calculo de disponibilidade. O campo `max_por_dia` dos servicos e ignorado.
- **Impacto:** Servicos com limite diario nao sao respeitados.
- **Solucao:** Incluir `max_por_dia` no calculo de slots disponiveis.

---

#### 7.2 SEGURANCA

**SEC-AUDIT-001: WhatsApp sendWhatsApp() sem try-catch** (Esforco: P)
- **Arquivos:** 5 endpoints fazem `await sendWhatsApp()` sem try-catch
  - `bookings/route.ts` (linha 147-150)
  - `bookings/[id]/status/route.ts` (linha 74)
  - `auth/register/influencer/route.ts` (linha 62-65)
  - `admin/influencers/[id]/approve/route.ts` (linha 37-39)
  - `admin/influencers/[id]/reject/route.ts` (linha 32-34)
- **Problema:** Se WhatsApp falha, toda a request falha — mesmo que a operacao principal (criar booking, aprovar influencer) tenha sido bem-sucedida.
- **Solucao:** Envolver cada `sendWhatsApp()` em try-catch, logar erro, nao falhar a request.

**SEC-AUDIT-002: Booking code previsivel** (Esforco: P)
- **Arquivo:** `src/lib/booking-code.ts` (linhas 3-11)
- **Problema:** Formato `AI-2025-0001` e sequencial e previsivel. Permite enumeracao de bookings.
- **Solucao:** Usar `AI-${crypto.randomUUID().slice(0, 8).toUpperCase()}` ou similar.

**SEC-AUDIT-003: Instagram tokens em plaintext no banco** (Esforco: M)
- **Arquivos:** `auth/instagram/callback/route.ts` (linhas 59-72), `cron/update-followers/route.ts`
- **Problema:** Long-lived access tokens armazenados sem criptografia.
- **Solucao:** Implementar envelope encryption com chave rotacionavel.

---

#### 7.3 ARQUITETURA E PADROES

**ARCH-001: Inconsistencia no data fetching** (Esforco: G)
- **Problema:** Tres padroes diferentes de fetching:
  1. `apiFetch()` com JWT (admin, painel)
  2. Supabase client direto com anon key (client pages, influencer profile)
  3. TanStack Query hooks (hooks/)
- **Impacto:** Dificulta manutencao, comportamento inconsistente de cache/retry.
- **Solucao:** Padronizar em TanStack Query + apiFetch() para todas as requisicoes. Eliminar queries Supabase diretas no frontend.

**ARCH-002: Formato de resposta de erro inconsistente** (Esforco: M)
- **Problema:** Alguns endpoints retornam `{ error: 'message' }`, outros `{ error: 'PREFIX: message' }`, outros usam `apiError()`. Status codes inconsistentes (200 vs 201 para criacao).
- **Solucao:** Padronizar: sempre usar `apiError()`, sempre retornar 201 para criacao, formato unico `{ error: { code: string, message: string } }`.

**ARCH-003: Error handling silencioso no frontend** (Esforco: M)
- **Problema:** `.catch(() => {})` em multiplos lugares do AdminPages.tsx (linhas 88-91, 278-279, 396, 488, 543) e ClientPages.tsx. Erros engolidos sem feedback ao usuario.
- **Impacto:** Usuario nao sabe que dados falharam ao carregar.
- **Solucao:** Implementar error boundaries e toast de erro em todas as chamadas.

**ARCH-004: Componentes view muito grandes** (Esforco: G)
- **Problema:** `AdminPages.tsx` e um unico arquivo com multiplos exports, contendo todo o admin. `ClientPages.tsx` idem.
- **Impacto:** Dificulta code splitting, testes unitarios e manutencao.
- **Solucao:** Extrair cada pagina admin em arquivo separado: `AdminDashboard.tsx`, `AdminInfluencers.tsx`, `AdminBookings.tsx`, `AdminClients.tsx`, `AdminWaitlist.tsx`.

**ARCH-005: Dependencia nao utilizada** (Esforco: P)
- **Arquivo:** `package.json` (linha 43)
- **Problema:** `bcryptjs` instalado mas nunca importado.
- **Solucao:** Remover com `npm uninstall bcryptjs`.

---

#### 7.4 BANCO DE DADOS

**DB-001: Migration de Instagram OAuth faltante** (Esforco: M)
- **Problema:** DATABASE.md (linhas 297-314) documenta 7 campos OAuth na tabela `influencers`, mas nenhuma migration no repositorio implementa esses campos.
- **Impacto:** Funcionalidades de Instagram OAuth nao funcionam em ambiente limpo.
- **Solucao:** Criar migration `add_instagram_oauth_fields.sql` com ALTER TABLE.

**DB-002: Default de `origem` inconsistente** (Esforco: P)
- **Problema:** DATABASE.md diz default `cadastro_manual`, migration tem default `site`.
- **Arquivo:** Migration inicial (linha 81)
- **Solucao:** Alinhar migration com documentacao — default deve ser `cadastro_manual`.

**DB-003: Funcao has_role com parametros invertidos** (Esforco: P)
- **Problema:** DATABASE.md documenta `has_role(_role, _user_id)` mas migration implementa `has_role(_user_id, _role)`.
- **Solucao:** Atualizar documentacao para refletir a implementacao real.

**DB-004: Sem timeout nas chamadas externas** (Esforco: P)
- **Arquivos:**
  - `auth/instagram/callback/route.ts` (linhas 25-57): 3 fetch calls sem timeout
  - `instagram/feed/route.ts` (linhas 25-50): fetch sem timeout
  - `cron/update-followers/route.ts` (linhas 30-62): fetch sem timeout
- **Solucao:** Usar `AbortController` com timeout de 10s em todas as chamadas externas.

---

## 5. Roadmap de Implementacao (Fases)

### Fase 0: Emergencial (1-2 dias)
1. **US-SEC-001** — Remover secrets do repositorio
2. **US-SEC-008** — Mover N8N webhook para env var
3. **US-SEC-010** — Corrigir fallback inseguro do db.ts
4. **US-PEND-005** — Copyright 2026

### Fase 1: Fundacao de Seguranca (1-2 semanas)
1. **US-SEC-003** — Headers de seguranca
2. **US-SEC-006** — Cookie security
3. **US-SEC-007** — TypeScript strict + regenerar tipos (P1)
4. **US-SEC-002** — RLS completo no Supabase
5. **US-SEC-005** — Validacao Zod em todos os endpoints
6. **US-SEC-004** — Rate limiting
7. **US-SEC-009** — CORS e CSRF
8. **US-SEC-011** — Instagram OAuth validation

### Fase 2: Performance e Estabilidade (1-2 semanas)
1. **US-PERF-001** — Indexes no banco + constraints (DB-001, DB-002)
2. **US-PERF-003** — Corrigir N+1 e race conditions (BUG-002, BUG-003)
3. **US-PERF-002** — Paginacao em todas as listagens
4. **BUG-004** — Corrigir max_por_dia
5. **SEC-AUDIT-001** — try-catch no sendWhatsApp
6. **DB-004** — Timeouts em chamadas externas
7. **US-PEND-004** — Migrar material_url para TEXT[]

### Fase 3: Testes (2-3 semanas, paralelo com Fase 4)
1. **US-TEST-001** — Setup Cypress
2. **US-TEST-002 a US-TEST-007** — Testes por area
3. **US-TEST-008** — Testes de autorizacao
4. **US-TEST-009** — Fluxos E2E
5. **US-TEST-010** — CI integration

### Fase 4: Redesign Visual (3-4 semanas, paralelo com Fase 3)
1. **US-UI-001** — Design System
2. **US-UI-006, US-UI-007, US-UI-008** — Padronizar componentes
3. **US-UI-002** — Landing Page (marketplace)
4. **US-UI-003** — Painel Influencer
5. **US-UI-004** — Area Cliente
6. **US-UI-005** — Admin
7. **ARCH-004** — Extrair componentes grandes

### Fase 5: Responsividade (1-2 semanas)
1. **US-RESP-001** — Auditoria completa
2. **US-RESP-002 a US-RESP-005** — Correcoes por area

### Fase 6: Funcionalidades Completas (2-3 semanas)
1. **US-PEND-001** — Tipos Supabase + migration Instagram OAuth
2. **US-PEND-003** — Instagram Feed real
3. **US-PEND-002** — Sistema de Reviews
4. **US-PEND-006** — Substituir dados mockados
5. **US-PEND-007** — Metricas reais
6. **ARCH-001** — Padronizar data fetching

---

## 6. Riscos e Mitigacoes

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|---------------|---------|-----------|
| R1 | Secrets expostos ja comprometidos | Alta | Critico | Revogar imediatamente, auditar logs de acesso, rodar Fase 0 primeiro |
| R2 | Race conditions causam dados corrompidos em producao | Media | Alto | Priorizar BUG-002 e BUG-003 na Fase 2, implementar constraint UNIQUE |
| R3 | Migration Instagram OAuth nao existe — funcionalidades quebram | Alta | Alto | Criar migration antes de qualquer trabalho de Instagram (US-PEND-001) |
| R4 | TypeScript strict mode gera centenas de erros | Alta | Medio | Fazer incrementalmente (strict por arquivo ou pasta), corrigir `as any` primeiro |
| R5 | Redesign visual atrasa entregas de backend | Media | Medio | Rodar Fases 3 e 4 em paralelo com equipes/pessoas diferentes |
| R6 | Testes E2E flaky em CI | Media | Medio | Usar Supabase local com seed data, retry flaky tests 2x, investir em fixtures estaveis |
| R7 | Breaking changes na Graph API do Instagram | Baixa | Alto | Pinnar versao da API (v19.0), monitorar deprecation notices |
| R8 | Overbooking em producao antes de corrigir race condition | Media | Alto | Hotfix: adicionar constraint UNIQUE em availability(influencer_id, data) como medida imediata |

---

## 7. Checklist de Definicao de Pronto (DoD)

### Para cada User Story:
- [ ] Codigo implementado e revisado
- [ ] Testes E2E passando (quando aplicavel)
- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Lint sem warnings (`eslint .`)
- [ ] Documentacao atualizada (se afeta docs/)
- [ ] Testado nos 3 breakpoints (375px, 768px, 1280px)
- [ ] Sem regressoes nos testes existentes
- [ ] PR aprovado com code review

### Para o release completo (v2):
- [ ] Zero secrets no repositorio
- [ ] RLS ativo em todas as tabelas
- [ ] Rate limiting nos endpoints criticos
- [ ] Security headers retornados em todas as respostas
- [ ] Score A+ no SecurityHeaders.com
- [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1 (medido com Lighthouse)
- [ ] Lighthouse Accessibility score >= 90
- [ ] 100% dos endpoints com testes E2E
- [ ] Fluxos criticos de negocio com testes E2E
- [ ] CI pipeline com testes obrigatorios
- [ ] Zero dados mockados visíveis em producao
- [ ] Design system documentado e aplicado
- [ ] Todas as 22+ paginas responsivas
- [ ] Paginacao em todas as listagens
- [ ] Sistema de reviews funcional
- [ ] Instagram feed real para influencers conectadas
- [ ] Tipos Supabase atualizados e sincronizados
- [ ] npm audit sem vulnerabilidades criticas/altas

---

## 8. Legenda de Esforco

| Sigla | Significado | Estimativa |
|-------|-------------|------------|
| P | Pequeno | < 2 horas |
| M | Medio | 2-8 horas |
| G | Grande | 1-3 dias |
| GG | Extra-Grande | 3-5 dias |

---

## 9. Resumo Quantitativo

| Area | User Stories | Esforco Total Estimado |
|------|-------------|----------------------|
| Seguranca | 11 | ~3-4 semanas |
| Performance | 7 | ~2-3 semanas |
| Testes E2E | 10 | ~3-4 semanas |
| Redesign UI | 8 | ~3-4 semanas |
| Responsividade | 5 | ~1-2 semanas |
| Pendencias | 7 | ~2-3 semanas |
| Melhorias Analise | 14 | ~1-2 semanas |
| **TOTAL** | **62** | **~10-14 semanas** (com paralelismo nas Fases 3-4) |

---

## 10. Open Questions

1. **Hosting de producao:** Vercel Pro e necessario para cron jobs. Ja esta contratado?
2. **Meta App Review:** O app Meta ja foi submetido para revisao de escopos `instagram_basic` e `instagram_manage_insights`? Isso pode levar semanas.
3. **Budget para ferramentas:** Upstash (rate limiting), Sentry (error tracking), e @next/bundle-analyzer sao recomendados. Ha budget?
4. **Equipe:** Quantas pessoas trabalharao nesta fase? O roadmap assume 1-2 devs + 1 designer.
5. **Prioridade de secrets:** Os secrets expostos em `.env.local` ja foram rotacionados? Isso e emergencial.
6. **Supabase local para testes:** Ja existe docker-compose configurado para rodar Supabase localmente?
7. **Dominio e SSL:** Ja tem dominio de producao configurado? Necessario para HSTS e cookie secure.

## 11. Documentacao Continua

Durante toda a execucao deste PRD, o Claude Code deve manter a pasta `/docs` 
atualizada em tempo real — documentar nao e uma tarefa final, e parte de cada 
entrega.

### Regra geral

Toda User Story concluida deve vir acompanhada da documentacao correspondente 
atualizada ou criada. Nenhum PR e considerado "pronto" (DoD) sem a doc.

### O que documentar e onde

| Quando | O que atualizar |
|--------|----------------|
| Novo endpoint criado ou modificado | `docs/app/api/[rota].md` |
| Schema do banco alterado (migration) | `docs/DATABASE.md` |
| Nova variavel de ambiente adicionada | `docs/ARCHITECTURE.md` (secao de env vars) |
| Nova regra de negocio implementada | `docs/INDEX.md` (secao Regras de Negocio) |
| Novo componente criado | `docs/components/[componente].md` |
| Fluxo de autenticacao alterado | `docs/ARCHITECTURE.md` (secao de fluxo de auth) |
| Middleware alterado | `docs/middleware.md` |
| Cron job criado ou alterado | `docs/cron-jobs.md` |
| Bug corrigido (BUG-00X) | Adicionar secao "Historico de Correcoes" na doc relevante |
| Decisao tecnica importante tomada | `docs/ARCHITECTURE.md` (secao Decisoes Tecnicas) |
| Integracao externa nova ou alterada | Doc propria em `docs/integrations/[nome].md` |

### Estrutura esperada da pasta /docs ao final
```
docs/
├── INDEX.md                     — indice mestre (sempre atualizado)
├── ARCHITECTURE.md              — stack, diagramas, decisoes, env vars
├── DATABASE.md                  — tabelas, enums, migrations, RLS
├── middleware.md                — protecao de rotas
├── cron-jobs.md                 — jobs agendados
├── instagram-integration.md    — OAuth e feed
├── PRD-v2.md                    — este documento
├── CHANGELOG.md                 — novo: registro de todas as mudancas por fase
├── app/
│   └── api/                     — uma doc por endpoint
├── components/                  — uma doc por componente relevante
├── lib/                         — uma doc por utilitario
└── integrations/                — docs de integracoes externas
```

### CHANGELOG.md

Criar o arquivo `docs/CHANGELOG.md` e atualizar a cada tarefa concluida no 
seguinte formato:
```markdown
## [Fase X] — YYYY-MM-DD

### Adicionado
- US-SEC-003: Headers de seguranca HTTP configurados em next.config.mjs

### Corrigido
- BUG-002: Race condition na criacao de clientes durante booking

### Alterado
- DATABASE.md: Adicionadas policies RLS das tabelas clients e bookings

### Seguranca
- US-SEC-001: Secrets removidos do repositorio, credenciais rotacionadas
```

### Instrucao direta ao Claude Code

Ao concluir qualquer tarefa deste PRD:
1. Verifique se existe doc para o que foi alterado
2. Se nao existe, crie com o template minimo (descricao, parametros, exemplos)
3. Se existe, atualize para refletir o estado atual (nunca deixe doc desatualizada)
4. Atualize o `CHANGELOG.md` com a entrada correspondente
5. Se a mudanca afeta o `INDEX.md`, atualize-o tambem

A documentacao deve ser escrita como se fosse lida por um desenvolvedor 
novo no projeto — clara, com exemplos, sem assumir conhecimento previo.
