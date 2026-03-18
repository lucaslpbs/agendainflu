# Painel da Influenciadora

> **Status:** `Implementado`
> **Auth:** `Influencer`

## Layout do Painel

> **Arquivo:** `src/app/painel/layout.tsx`

Envolve todas as páginas do painel com `ProtectedLayout`. Redireciona para `/login` se não autenticado. O `PanelLayout` provê a sidebar de navegação com menu: Dashboard, Calendário, Agendamentos, Serviços, Clientes, Lista de Espera, Perfil.

---

## Dashboard

> **Rota:** `/painel`
> **Arquivo:** `src/app/painel/page.tsx` → `src/views/panel/Dashboard.tsx`

### O que faz

Visão geral dos agendamentos, clientes, receita e estatísticas da influenciadora. Exibe gráficos de barras (agendamentos por mês), pizza (distribuição por status), visão diária interativa e lista dos últimos agendamentos.

### O que o usuário vê
- 4 cards de métricas: Total Agendamentos, Pendentes, Clientes Ativos, Receita Total
- Gráfico de barras com agendamentos dos últimos 6 meses
- Gráfico de pizza com distribuição por status
- Calendário diário navegável com agendamentos e receita por dia
- Lista dos 5 últimos agendamentos

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `bookings` com `clients` e `services` | Ao montar |
| Supabase (direto) | `clients` count por influencer | Ao montar |
| Supabase (direto) | `waitlist` count por influencer | Ao montar |

---

## Agendamentos

> **Rota:** `/painel/agendamentos`
> **Arquivo:** `src/app/painel/agendamentos/page.tsx` → `src/views/panel/AgendamentosPage.tsx`

### O que faz
Lista agendamentos agrupados por data, com filtro por status. Permite confirmar, cancelar, concluir agendamentos e abrir diálogo com detalhes completos.

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/bookings` | Ao montar e ao alterar filtro |

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Confirmar | `PATCH /api/bookings/{id}/status` | Status → confirmado |
| Cancelar | `PATCH /api/bookings/{id}/status` | Status → cancelado |
| Concluir | `PATCH /api/bookings/{id}/status` | Status → concluido |
| Ver detalhes | — | Abre `BookingDetailDialog` |

---

## Calendário

> **Rota:** `/painel/calendario`
> **Arquivo:** `src/app/painel/calendario/page.tsx` → `src/views/panel/CalendarioPage.tsx`

### O que faz
Visão mensal navegável com status visual de cada dia (disponível, pendente, agendado, bloqueado). Ao selecionar um dia, exibe os agendamentos do dia e permite configurar slots disponíveis e bloquear/desbloquear o dia.

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/availability?mes=yyyy-MM` | Ao montar e ao navegar meses |
| API | `GET /api/bookings?data_inicio=...&data_fim=...` | Ao montar e ao navegar meses |

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Bloquear/desbloquear dia | `POST /api/availability` | Atualiza `bloqueado` |
| Ajustar slots | `POST /api/availability` | Atualiza `slots_disponiveis` |
| Atualizar status de agendamento | `PATCH /api/bookings/{id}/status` | Muda status |

---

## Serviços

> **Rota:** `/painel/servicos`
> **Arquivo:** `src/app/painel/servicos/page.tsx` → `src/views/panel/ServicosPage.tsx`

### O que faz
CRUD completo de serviços. Permite criar, editar e excluir serviços (com soft delete se tiver agendamentos).

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/services?influencer_id={id}` | Ao montar |

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Criar serviço | `POST /api/services` | Adiciona à lista |
| Editar serviço | `PATCH /api/services/{id}` | Atualiza campos |
| Excluir serviço | `DELETE /api/services/{id}` | Remove ou desativa |

---

## Clientes

> **Rota:** `/painel/clientes`
> **Arquivo:** `src/app/painel/clientes/page.tsx` → `src/views/panel/ClientesPage.tsx`

### O que faz
Gerenciamento da base de clientes. Exibe tabela com filtro de busca, permite adicionar clientes manualmente, ativar/bloquear clientes e abrir WhatsApp.

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/clients` | Ao montar |

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Adicionar cliente | `POST /api/clients` | Novo cliente com status `ativo` |
| Bloquear cliente | `PATCH /api/clients/{id}/status` | Status → `bloqueado` |
| Ativar cliente | `PATCH /api/clients/{id}/status` | Status → `ativo` |

---

## Lista de Espera (Painel)

> **Rota:** `/painel/lista-espera`
> **Arquivo:** `src/app/painel/lista-espera/page.tsx` → `src/views/panel/WaitlistPage.tsx`

### O que faz
Gerenciamento de leads na lista de espera. Permite aprovar (converte para cliente ativo), rejeitar ou marcar como contatado. Aprovação envia notificação WhatsApp ao lead.

### Dados carregados
| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/waitlist` | Ao montar |

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Aprovar | `PATCH /api/waitlist/{id}/status` | Cria cliente ativo + WA |
| Rejeitar | `PATCH /api/waitlist/{id}/status` | Status → rejeitado |
| Marcar contatado | `PATCH /api/waitlist/{id}/status` | Status → contatado |

---

## Perfil

> **Rota:** `/painel/perfil`
> **Arquivo:** `src/app/painel/perfil/page.tsx` → `src/views/panel/PerfilPage.tsx`

### O que faz
Permite à influenciadora editar seus dados de perfil: nome, bio, nicho, seguidores, Instagram, WhatsApp e foto de perfil. Também exibe o link público do perfil.

### Ações disponíveis
| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Salvar perfil | `PATCH /api/influencers/{username}` | Atualiza campos |
| Upload de foto | Supabase Storage `avatars` + PATCH | Atualiza `foto_url` |
