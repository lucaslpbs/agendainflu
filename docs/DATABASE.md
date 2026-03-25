# Banco de Dados — AgendaInflu

> **Última atualização:** 2026-03-25
> **Provedor:** Supabase (PostgreSQL)
> **Tipos gerados em:** `src/integrations/supabase/types.ts`

---

## Diagrama de Relacionamentos

```
auth.users (Supabase)
    │
    ├──< user_roles (role: app_role)
    │
    ├──< influencers ──< services
    │         │               │
    │         │               └──< bookings >──── clients
    │         │                         │
    │         ├──< availability         └── (client_id FK)
    │         ├──< influencer_analysis
    │         └──< waitlist
    │
    └──< client_profiles
```

---

## Tabelas

### `user_roles`

Relaciona cada usuário Supabase a um role na aplicação.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK, default gen | — |
| `user_id` | `uuid` | FK auth.users | Usuário Supabase |
| `role` | `app_role` | NOT NULL | `admin` \| `influencer` \| `client` |

---

### `influencers`

Perfil de cada influenciadora cadastrada na plataforma.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `user_id` | `uuid` | FK auth.users | Usuário Supabase dono do perfil |
| `username` | `text` | UNIQUE, NOT NULL | Identificador público (slug da URL) |
| `nome` | `text` | NOT NULL | Nome de exibição |
| `bio` | `text` | nullable | Descrição do perfil |
| `nicho` | `text` | nullable | Categoria (Moda, Beleza, etc.) |
| `seguidores` | `text` | nullable | Ex.: "120K" |
| `foto_url` | `text` | nullable | URL da foto de perfil |
| `instagram_url` | `text` | nullable | URL do Instagram |
| `whatsapp` | `text` | nullable | Número para notificações WA |
| `status` | `influencer_status` | NOT NULL, default `em_analise` | Ver ENUM abaixo |
| `aprovado_em` | `timestamptz` | nullable | Data de aprovação |
| `observacoes_admin` | `text` | nullable | Notas internas do admin |
| `criado_em` | `timestamptz` | NOT NULL, default now() | — |

---

### `services`

Tipos de serviço oferecidos por cada influenciadora.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `influencer_id` | `uuid` | FK influencers.id | Dona do serviço |
| `tipo` | `service_type` | NOT NULL | `stories` \| `reels` \| `reels_stories` \| `feed` \| `presencial` |
| `formato` | `service_format` | NOT NULL, default `online` | `online` \| `presencial` |
| `preco` | `numeric` | NOT NULL | Preço em R$ |
| `descricao` | `text` | nullable | Detalhes do serviço |
| `max_por_dia` | `integer` | nullable | Limite de agendamentos por dia |
| `ativo` | `boolean` | NOT NULL, default `true` | Soft delete flag |

> **Regra de negócio:** ao deletar um serviço com bookings existentes, a API seta `ativo=false` em vez de deletar (soft delete).

---

### `bookings`

Agendamentos de serviços entre clientes e influenciadoras.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `influencer_id` | `uuid` | FK influencers.id | — |
| `client_id` | `uuid` | FK clients.id | — |
| `service_id` | `uuid` | FK services.id | — |
| `codigo_confirmacao` | `text` | NOT NULL | Formato `AI-YYYY-NNNN` |
| `status` | `booking_status` | NOT NULL, default `pendente` | Ver ENUM abaixo |
| `data_agendada` | `date` | NOT NULL | Data do serviço |
| `descricao_produto` | `text` | nullable | Produto a ser divulgado |
| `link_negocio` | `text` | nullable | URL do negócio do cliente |
| `material_url` | `text` | nullable | URLs de materiais (CSV) |
| `observacoes` | `text` | nullable | Observações gerais |
| `pagamento_confirmado` | `boolean` | NOT NULL, default `false` | — |
| `pagamento_confirmado_em` | `timestamptz` | nullable | — |
| `criado_em` | `timestamptz` | NOT NULL, default now() | — |
| `atualizado_em` | `timestamptz` | NOT NULL, default now() | — |

> **Nota:** `material_url` armazena múltiplas URLs separadas por vírgula. Planejado migrar para `TEXT[]`.

#### Máquina de estados de `status`

```
pendente ──→ confirmado ──→ concluido
    │                │
    └──→ cancelado ←─┘
```

Transições permitidas pela API (`PATCH /api/bookings/[id]/status`):
- `pendente` → `confirmado`
- `pendente` → `cancelado`
- `confirmado` → `concluido`
- `confirmado` → `cancelado`

---

### `clients`

Base de clientes de cada influenciadora (pode ser criado manualmente, por agendamento ou por promoção da lista de espera).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `influencer_id` | `uuid` | FK influencers.id | Influenciadora dona do cliente |
| `user_id` | `uuid` | nullable | FK auth.users (se tiver conta no app) |
| `nome` | `text` | NOT NULL | — |
| `empresa` | `text` | nullable | — |
| `whatsapp` | `text` | NOT NULL | Chave de unicidade por influencer |
| `email` | `text` | nullable | — |
| `instagram` | `text` | nullable | — |
| `status` | `client_status` | NOT NULL, default `ativo` | `ativo` \| `espera` \| `bloqueado` |
| `origem` | `client_origin` | NOT NULL, default `cadastro_manual` | `cadastro_manual` \| `site` \| `whatsapp` |
| `notas` | `text` | nullable | Anotações da influenciadora |
| `criado_em` | `timestamptz` | NOT NULL, default now() | — |

---

### `client_profiles`

Dados de cadastro completo de empresas/clientes com conta no app (role `client`).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `user_id` | `uuid` | NOT NULL | FK auth.users |
| `nome` | `text` | NOT NULL | Nome de contato |
| `email` | `text` | NOT NULL | — |
| `whatsapp` | `text` | NOT NULL | — |
| `razao_social` | `text` | nullable | Razão social da empresa |
| `cnpj` | `text` | nullable | — |
| `cpf` | `text` | nullable | — |
| `endereco` | `text` | nullable | — |
| `criado_em` | `timestamptz` | NOT NULL, default now() | — |

---

### `waitlist`

Leads que manifestaram interesse em trabalhar com uma influenciadora.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `influencer_id` | `uuid` | nullable, FK influencers.id | Se veio de `/lista-espera/[username]` |
| `nome` | `text` | NOT NULL | — |
| `whatsapp` | `text` | NOT NULL | Chave de verificação de duplicata |
| `email` | `text` | nullable | — |
| `empresa` | `text` | nullable | — |
| `mensagem` | `text` | nullable | Mensagem de apresentação |
| `status` | `waitlist_status` | NOT NULL, default `aguardando` | Ver ENUM abaixo |
| `criado_em` | `timestamptz` | NOT NULL, default now() | — |

#### Máquina de estados de `status`

```
aguardando → contatado → aprovado
     └──────────────────→ rejeitado
```

Ao transitar para `aprovado`, a API faz upsert em `clients` (origem=`site`).

---

### `availability`

Disponibilidade diária de cada influenciadora.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `influencer_id` | `uuid` | FK influencers.id | — |
| `data` | `date` | NOT NULL | Data no formato ISO |
| `slots_disponiveis` | `integer` | NOT NULL, default `1` | Vagas disponíveis no dia |
| `bloqueado` | `boolean` | NOT NULL, default `false` | Se true, dia indisponível independente dos slots |

> Constraint implícita: unicidade de `(influencer_id, data)` — upsert via `onConflict`.

---

### `influencer_analysis`

Resultado da análise administrativa de um perfil de influenciadora.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK | — |
| `influencer_id` | `uuid` | FK influencers.id | — |
| `resultado` | `analysis_result` | NOT NULL, default `pendente` | `aprovado` \| `rejeitado` \| `pendente` |
| `checklist` | `jsonb` | nullable | Checklist de aprovação (5 itens boolean) |
| `notas` | `text` | nullable | Notas do admin |
| `aprovado_por` | `uuid` | nullable | ID do admin que decidiu |
| `data_analise` | `timestamptz` | nullable | Data da decisão |

---

## ENUMs

| ENUM | Valores |
|------|---------|
| `app_role` | `admin`, `influencer`, `client` |
| `influencer_status` | `em_analise`, `ativa`, `suspensa`, `rejeitada` |
| `booking_status` | `pendente`, `confirmado`, `concluido`, `cancelado` |
| `client_status` | `ativo`, `espera`, `bloqueado` |
| `client_origin` | `cadastro_manual`, `site`, `whatsapp` |
| `waitlist_status` | `aguardando`, `contatado`, `aprovado`, `rejeitado` |
| `service_type` | `stories`, `reels`, `reels_stories`, `feed`, `presencial` |
| `service_format` | `online`, `presencial` |
| `analysis_result` | `aprovado`, `rejeitado`, `pendente` |

---

## SQL Functions

### `has_role(_role app_role, _user_id uuid) → boolean`

Verifica se um usuário possui determinado role.

```sql
SELECT has_role('admin', auth.uid());
```

Criada para uso em políticas RLS (não utilizada atualmente — RLS bypass via service_role).

---

## Storage (Supabase Storage)

| Bucket | Uso | Acesso |
|--------|-----|--------|
| `avatars` | Fotos de perfil das influenciadoras | Público |
| `materials` | Arquivos do kit mídia enviados pelos clientes | Privado (URL gerada) |

---

## Usuários de Teste

> Criar via Supabase Dashboard → Authentication → Add User, depois inserir manualmente em `user_roles` e na tabela correspondente.

| Email | Role | Tabela adicional |
|-------|------|-----------------|
| `admin@agendainflu.com` | `admin` | `influencers` (opcional) |
| `influencer@teste.com` | `influencer` | `influencers` |
| `cliente@teste.com` | `client` | `client_profiles` |

---

## Regras de Row Level Security (RLS)

> **Atenção:** As API Routes usam `service_role` (bypassa RLS). O Supabase client com `anon key` no frontend (`src/integrations/supabase/client.ts`) está sujeito às políticas RLS abaixo.

### Políticas ativas

| Tabela | Policy | Comando | Quem | Condição |
| ------ | ------ | ------- | ---- | -------- |
| `client_profiles` | `client_profiles_own` | ALL | authenticated | `user_id = auth.uid()` |
| `clients` | `clients_select_own` | SELECT | authenticated | `user_id = auth.uid()` |
| `bookings` | `bookings_select_own_client` | SELECT | authenticated | `client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())` |
| `bookings` | `bookings_select_influencer` | SELECT | authenticated | `influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())` |

> **Nota:** Operações de INSERT/UPDATE/DELETE em `bookings` e `clients` são feitas exclusivamente via API Routes (service_role), portanto não requerem policies de escrita no cliente.

### Histórico de correções

- **2026-03-25** — Removida policy `bookings_deny_all` (bloqueava 100% das leituras no cliente anon). Adicionadas policies `clients_select_own`, `bookings_select_own_client` e `bookings_select_influencer` para permitir que clientes e influenciadoras leiam seus próprios dados via Supabase client (usado em `views/client/ClientPages.tsx`).
