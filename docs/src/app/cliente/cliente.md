# cliente/ — Área do Cliente/Empresa

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/cliente/` (layout + 3 páginas)

## O que faz
Área autenticada para empresas/clientes que contratam influenciadoras. Composta por 3 seções: Explorar (busca de influenciadoras ativas), Meus Agendamentos (histórico de bookings do usuário) e Meu Perfil (dados da conta).

## Como acessar / Como usar
`http://localhost:3000/cliente` — requer autenticação (qualquer role).

## Rotas
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/cliente` | `ClientBookings` | Meus agendamentos |
| `/cliente/explorar` | `ClientExplore` | Busca de influenciadoras |
| `/cliente/perfil` | `ClientProfile` | Dados da conta |

## Estado atual (Lovable)
- **Explorar:** grid de influenciadoras ativas com busca por nome/nicho, avaliação mockada (5 estrelas), link para perfil
- **Agendamentos:** busca por `client_id` via `clients` vinculados ao `user.id`, exibe stats (total, pendentes, confirmados, gasto total)
- **Perfil:** exibe email e data de criação da conta, botão de logout

## O que ainda não está implementado
- Filtros por nicho/preço/localização no Explorar
- Cancelamento de agendamento pelo cliente
- Histórico de pagamentos
- Avaliação de influenciadoras após serviço concluído
- Perfil de empresa completo (edição de dados, logo, CNPJ)

## Chamadas de API existentes
### ClientExplore
1. `supabase.from("influencers").select("*").eq("status", "ativa").order("nome")`

### ClientBookings
2. `supabase.from("clients").select("id").eq("user_id", user.id)`
3. `supabase.from("clients").select("id").eq("email", user.email)` (fallback)
4. `supabase.from("bookings").select("*, services(...), influencers(...)).in("client_id", clientIds)`

## Dependências
- `src/views/client/ClientPages.tsx` (3 componentes num único arquivo)
- `src/app/cliente/layout.tsx` → `src/components/ProtectedLayout.tsx`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
A busca de bookings usa dois lookups: primeiro por `user_id` em `clients`, com fallback por `email`. Esse fallback existe para clientes criados manualmente pela influenciadora (sem `user_id`). Considerar simplificar com uma query `OR` direta.
