# (public)/agendar/[username]/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/(public)/agendar/[username]/page.tsx`

## O que faz
Wizard de agendamento de serviço com uma influenciadora em `/agendar/:username`. Exige autenticação. Permite selecionar serviço, data (próximos 14 dias, a partir de D+2), descrever o produto, fazer upload de Kit Mídia (até 5 arquivos para serviços online) e enviar o agendamento. Para clientes já aprovados, o booking é confirmado imediatamente; para novos, fica como `pendente`.

## Como acessar / Como usar
`http://localhost:3000/agendar/[username]` — protegida por `ProtectedLayout`. Aceita `?service=[id]` na query string para pré-selecionar serviço.

## Estado atual (Lovable)
- Lê `?service=` via `useSearchParams()` (wrapped em `<Suspense>`)
- Verifica autenticação e redireciona para `/login` se não logado
- Cria cliente automaticamente se não existir vínculo com a influenciadora
- Upload de Kit Mídia para bucket `materials` — **funcional** (se bucket existir)
- Cria booking com `codigo_confirmacao: "TEMP"` — **placeholder**, deveria ser gerado pelo backend
- Status: `confirmado` se cliente já `ativo`, `pendente` caso contrário
- Tela de sucesso com link WhatsApp pré-formatado com detalhes do agendamento

## O que ainda não está implementado
- `codigo_confirmacao` real (geração de código único no backend)
- Verificação de disponibilidade da data (tabela `availability` não consultada aqui)
- Pagamento (sem integração de pagamento)
- E-mail de confirmação para influenciadora e cliente
- Notificação WhatsApp automática via Evolution API

## Chamadas de API existentes
1. `supabase.from("influencers").select("*").eq("username", username)`
2. `supabase.from("services").select("*").eq("influencer_id", inf.id).eq("ativo", true)`
3. `supabase.from("client_profiles").select("*").eq("user_id", user.id)` (as any)
4. `supabase.from("clients").select("*").eq("influencer_id", inf.id).eq("user_id", user.id)`
5. `supabase.from("clients").insert({...})` — criação de novo cliente
6. `supabase.storage.from("materials").upload(path, file)` — upload kit mídia
7. `supabase.from("bookings").insert({...})` — criação do agendamento

## Dependências
- `src/views/AgendarServico.tsx`
- `src/components/ProtectedLayout.tsx`
- `src/integrations/supabase/client.ts`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
O campo `codigo_confirmacao` é salvo como `"TEMP"` — precisa de lógica backend (trigger ou função) para gerar código único. O bucket `materials` precisa de política de upload para usuários autenticados.
