# painel/clientes/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/clientes/page.tsx`

## O que faz
Gerenciamento da base de clientes da influenciadora em `/painel/clientes`. Lista todos os clientes vinculados (criados manualmente ou via agendamento), com busca por nome, filtro por status e ações de mudança de status (ativo, bloqueado). Permite adicionar clientes manualmente. Inclui botão de contato rápido via WhatsApp.

## Como acessar / Como usar
`http://localhost:3000/painel/clientes`

## Estado atual (Lovable)
- Dados reais da tabela `clients` filtrados por `influencer_id`
- Busca por nome no cliente
- Ações de status: ativo → bloqueado / espera → ativo
- Cadastro manual de cliente (nome, e-mail, WhatsApp, empresa) com `origem: "manual"`
- Link WhatsApp direto formatado para abrir conversa

## O que ainda não está implementado
- Histórico de agendamentos por cliente (drill-down)
- Exportar lista de clientes (CSV/Excel)
- Tags ou categorização de clientes
- Notas internas por cliente

## Chamadas de API existentes
1. `supabase.from("clients").select("*").eq("influencer_id", influencer.id).order("criado_em", desc)`
2. `supabase.from("clients").insert({...})` — adição manual
3. `supabase.from("clients").update({ status }).eq("id", id)` — mudança de status

## Dependências
- `src/views/panel/ClientesPage.tsx`
- `src/components/panel/PanelLayout.tsx`

## Observações para o dev
Clientes criados manualmente têm `user_id: null` e `origem: "manual"`. Clientes criados via agendamento têm `user_id` preenchido. O vínculo entre `client_profiles` e `clients` é pelo `user_id`.
