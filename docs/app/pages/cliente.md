# Área do Cliente

> **Status:** `Implementado`
> **Auth:** `Cliente`

## Layout do Cliente

> **Arquivo:** `src/app/cliente/layout.tsx` → `src/views/client/ClientPages.tsx` (ClientLayout)

Sidebar com menu: Explorar, Meus Agendamentos, Meu Perfil. Exibe e-mail do usuário na parte inferior com botão de logout.

---

## Meus Agendamentos (página inicial do cliente)

> **Rota:** `/cliente`
> **Arquivo:** `src/app/cliente/page.tsx` → `src/views/client/ClientPages.tsx` (ClientBookings)

### O que faz
Lista todos os agendamentos do cliente autenticado com dados da influenciadora e do serviço. Exibe cards de métricas (total, pendentes, confirmados, total investido) e filtros por status.

### O que o usuário vê
- 4 cards de métricas: Total, Pendentes, Confirmados, Total Investido
- Filtros de status
- Lista de agendamentos com foto da influenciadora, serviço, data, valor e status

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `clients` por `user_id` | Ao montar |
| Supabase (direto) | `bookings` com influencer e service | Após clientes |

---

## Explorar Influenciadoras

> **Rota:** `/cliente/explorar`
> **Arquivo:** `src/app/cliente/explorar/page.tsx` → `src/views/client/ClientPages.tsx` (ClientExplore)

### O que faz
Grade de influenciadoras ativas com busca por nome ou nicho. Cada card tem foto, nome, nicho, seguidores e botão para ver o perfil.

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `influencers` com `status = 'ativa'` | Ao montar |

### Ações disponíveis
| Ação | Destino | Resultado |
|------|---------|-----------|
| "Ver perfil e serviços" | `/[username]` | Abre perfil público |

---

## Meu Perfil (Cliente)

> **Rota:** `/cliente/perfil`
> **Arquivo:** `src/app/cliente/perfil/page.tsx` → `src/views/client/ClientPages.tsx` (ClientProfile)

### O que faz
Exibe dados básicos da conta do cliente: avatar (inicial do e-mail), e-mail e data de membro. Botão de logout.

### Proteção de rota
Middleware redireciona para `/painel` se o role for `influencer` ou `admin`. Para `client` ou `admin`, acesso permitido.
