

# Lista de Funcionalidades e Regras de Negócio - AgendaInflu

## 1. ESTRUTURA DE PAPÉIS (ROLES)

### 1.1 Três Tipos de Usuários
| Papel | Descrição | Acesso |
|-------|-----------|--------|
| **Admin** | Administrador da plataforma | Painel Admin completo |
| **Influencer** | Influenciadora cadastrada | Painel de gerenciamento próprio |
| **Client** | Empresa/Cliente contratante | Painel de cliente para agendamentos |

### 1.2 Sistema de Roles (user_roles)
- Tabela `user_roles` vincula usuários aos papéis
- Função `has_role()` verifica permissões (SECURITY DEFINER)
- Um usuário pode ter múltiplos papéis

---

## 2. PÁGINAS PÚBLICAS (Não requer login)

### 2.1 Landing Page (`/`)
- Hero section com CTA
- Como funciona
- Influenciadoras em destaque
- FAQ
- Footer

### 2.2 Perfil Público da Influenciadora (`/:username`)
```
REGRAS DE NEGÓCIO:
- Só exibe influenciadoras com status = "ativa"
- Feed Instagram (mockado - preparado para Meta Graph API)
- Estatísticas mockadas (campanhas, marcas, engajamento)
- Depoimentos mockados de clientes
- SERVIÇOS: mostra tipos disponíveis SEM preço para visitantes
- BOTÃO "Entrar para Agendar" redireciona para login
```

### 2.3 Lista de Espera Pública (`/lista-espera/:username`)
- Formulário para empresas interessadas
- Salva na tabela `waitlist` com status "aguardando"

---

## 3. AUTENTICAÇÃO E CADASTRO

### 3.1 Login (`/login`)
- Email/senha via Supabase Auth
- Redirecionamento baseado no papel:
  - Admin → `/admin`
  - Influencer → `/painel`
  - Client → `/cliente/explorar`

### 3.2 Cadastro de Influenciadora (`/cadastro-influenciadora`)
- Dados: nome, username (único), email, senha, bio, nicho
- Foto de perfil (upload para storage)
- Instagram, WhatsApp
- **Status inicial = "em_analise"** (requer aprovação do admin)

### 3.3 Cadastro de Cliente (`/cadastro-cliente`)
```
REGRAS DE NEGÓCIO:
- Tipo de pessoa: PJ ou PF
- PJ: CNPJ, Razão Social obrigatórios
- PF: CPF obrigatório
- Comuns: nome, email, senha, WhatsApp, endereço comercial
- Salva em client_profiles vinculado ao user_id
```

---

## 4. PAINEL DO CLIENTE (Requer login + papel client)

### 4.1 Layout do Cliente (`/cliente/*`)
Menu lateral:
- Explorar
- Meus Agendamentos
- Meu Perfil

### 4.2 Explorar Influenciadoras (`/cliente/explorar`)
- Lista todas as influencers ativas
- Busca por nome ou nicho
- Cards com foto, seguidores, nicho, estrelas (mock)

### 4.3 Meus Agendamentos (`/cliente`)
```
REGRAS DE NEGÓCIO:
- Mostra agendamentos do usuário logado (busca por user_id em clients)
- Estatísticas: total, pendentes, confirmados, gasto total
- Filtros por status: todos, pendente, confirmado, concluido, cancelado
- Lista com código, influencer, serviço, data, valor, status
```

### 4.4 Meu Perfil (`/cliente/perfil`)
- Dados básicos do usuário
- Data de criação da conta
- Botão de logout

---

## 5. FLUXO DE AGENDAMENTO

### 5.1 Página de Agendamento (`/agendar/:username`)
```
REGRAS DE NEGÓCIO CRÍTICAS:

1. VERIFICAÇÃO DE CADASTRO:
   - Se não tem client_profile → redireciona para completar cadastro
   - Verifica se já é cliente da influencer (tabela clients)

2. TIPO DE SERVIÇO:
   - Online: requer KIT MÍDIA (fotos do produto) + descrição
   - Presencial: descrição opcional, sem kit mídia

3. UPLOAD DE KIT MÍDIA:
   - Máximo 5 arquivos (imagens ou PDF)
   - Upload para bucket "materials" no Supabase Storage
   - URLs salvas em bookings.material_url

4. STATUS DO AGENDAMENTO:
   - Cliente NOVO (nunca agendou com esta influencer):
     → status = "pendente" (requer aprovação)
   - Cliente EXISTENTE (já aprovado):
     → status = "confirmado" (direto para pagamento)

5. REDIRECIONAMENTO WHATSAPP:
   - Gera mensagem automática com código, data, serviço, valor
   - Link wa.me para enviar comprovante de pagamento
```

### 5.2 Datas Disponíveis
- Gera próximos 14 dias (a partir de 2 dias da data atual)
- Formato brasileiro (dd/MM)

---

## 6. PAINEL DA INFLUENCIADORA (`/painel/*`)

### 6.1 Dashboard (`/painel`)
```
FUNCIONALIDADES:
- Cards: total agendamentos, pendentes, clientes ativos, receita total
- Gráfico de agendamentos por mês (últimos 6 meses)
- Gráfico de status (pizza)
- Visão diária: agendamentos por dia do mês selecionado
- Lista dos últimos 5 agendamentos
```

### 6.2 Calendário (`/painel/calendario`)
- Visualização mensal
- Dias com agendamentos destacados
- Clica no dia → mostra agendamentos daquele dia
- Clica no agendamento → abre modal com detalhes

### 6.3 Agendamentos (`/painel/agendamentos`)
```
REGRAS DE NEGÓCIO:
- Agrupados por data (Hoje, Amanhã, ou data formatada)
- Filtro por status (todos, pendente, confirmado, concluido, cancelado)
- AÇÕES por status:
  * PENDENTE: botão Confirmar (→ confirmado) ou Recusar (→ cancelado)
  * CONFIRMADO: botão Concluir (→ concluido)
- Ícone WhatsApp para contatar cliente diretamente
- CLICÁVEL: abre modal com detalhes completos
```

### 6.4 Modal de Detalhes do Agendamento
```
INFORMAÇÕES EXIBIDAS:
- Código de confirmação
- Status atual
- Cliente: nome, empresa, WhatsApp, Instagram (com link)
- Serviço: tipo, formato, preço
- Data agendada
- Descrição do produto
- Link do negócio
- KIT MÍDIA: preview das fotos com links para download
- Observações
- BOTÕES DE AÇÃO: Confirmar, Recusar, Concluir (conforme status)
```

### 6.5 Serviços (`/painel/servicos`)
```
FUNCIONALIDADES:
- CRUD completo de serviços
- Campos: tipo (stories, reels, feed, presencial, etc), 
          formato (online/presencial), 
          preço, 
          descrição, 
          máx por dia
- Toggle ativo/inativo
```

### 6.6 Clientes (`/painel/clientes`)
```
REGRAS DE NEGÓCIO:
- Base de clientes vinculados à influencer
- Status do cliente: ativo, espera, bloqueado
- AÇÕES:
  * WhatsApp direto
  * Ativar cliente (espera → ativo)
  * Bloquear cliente (ativo → bloqueado)
- Cadastro manual de cliente (sem user_id)
```

### 6.7 Lista de Espera (`/painel/lista-espera`)
- Interessados que preencheram formulário público
- Status: aguardando, contatado, aprovado, rejeitado
- Ações para mover entre status

### 6.8 Perfil (`/painel/perfil`)
- Edição dos dados da influencer
- Upload de nova foto

---

## 7. PAINEL ADMIN (`/admin/*`)

### 7.1 Dashboard Admin (`/admin`)
```
MÉTRICAS GLOBAIS:
- Influenciadoras ativas
- Em análise
- Total de agendamentos
- Receita total da plataforma
- Total de clientes
- Lista de espera
- Gráficos de agendamentos e receita por dia
- Status de agendamentos (pizza)
- Tabela de agendamentos recentes (todas as influencers)
```

### 7.2 Gerenciamento de Influenciadoras (`/admin/influenciadoras`)
```
REGRAS DE NEGÓCIO:
- Duas abas: "Em análise" e "Todas"
- Checklist de aprovação:
  * perfil_completo
  * instagram_verificado
  * nicho_definido
  * foto_qualidade
  * bio_preenchida
- AÇÕES:
  * Aprovar → status = "ativa" + data aprovação
  * Rejeitar → status = "rejeitada"
- Salva análise em influencer_analysis
```

### 7.3 Agendamentos (`/admin/agendamentos`)
- Visualização de todos os agendamentos da plataforma
- Filtros por status
- Estatísticas globais

### 7.4 Clientes (`/admin/clientes`)
- Lista de todos os clientes cadastrados
- Busca e filtros

### 7.5 Lista de Espera (`/admin/lista-espera`)
- Todos os interessados da plataforma
- Gerenciamento de status

---

## 8. REGRAS DE SEGURANÇA (RLS)

### 8.1 Políticas Principais
| Tabela | Política |
|--------|----------|
| `influencers` | Public vê apenas "ativa"; user vê próprio; admin vê tudo |
| `services` | Public vê de influencers "ativa" + ativo=true; Influencer gerencia próprios |
| `bookings` | Influencer vê próprios; Client cria (autenticado); Admin vê tudo |
| `clients` | Influencer vê próprios; Admin vê tudo |
| `client_profiles` | User vê/atualiza próprio; Admin vê tudo |
| `waitlist` | Public insere; Influencer vê próprios; Admin vê tudo |
| `user_roles` | User vê próprio; Admin gerencia tudo |

---

## 9. WORKFLOWS DE STATUS

### 9.1 Influencer
```
em_analise → ativa → suspensa
     ↓
  rejeitada
```

### 9.2 Cliente (por influencer)
```
espera → ativo → bloqueado
```

### 9.3 Agendamento
```
pendente → confirmado → concluido
    ↓
cancelado
```

### 9.4 Lista de Espera
```
aguardando → contatado → aprovado
                    ↓
                 rejeitado
```

---

## 10. INTEGRAÇÕES E FUTURO

### 10.1 Implementado
- Supabase Auth (email/senha)
- Supabase Storage (fotos de perfil, kit mídia)
- WhatsApp API (links wa.me)
- Instagram Feed (mockado, estrutura para Meta Graph API)

### 10.2 Preparado para
- Meta Graph API (token de acesso para feed real)
- Confirmação de pagamento (estrutura já existe em bookings)

