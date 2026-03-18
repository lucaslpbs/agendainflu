# painel/lista-espera/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/lista-espera/page.tsx`

## O que faz
Gerenciamento da lista de espera da influenciadora em `/painel/lista-espera`. Exibe todas as entradas de `waitlist` vinculadas à influenciadora, permitindo aprovar (migra para `clients`), rejeitar ou marcar como "contatado". Inclui link WhatsApp para contato direto.

## Como acessar / Como usar
`http://localhost:3000/painel/lista-espera`

## Estado atual (Lovable)
- Dados reais da tabela `waitlist` filtrados por `influencer_id`
- Aprovação: insere na tabela `clients` com status `ativo` e atualiza `waitlist.status` para `aprovado`
- Rejeição: atualiza `waitlist.status` para `rejeitado`
- Marcar como contatado: atualiza `waitlist.status` para `contatado`
- Ordenação por data de criação (mais recentes primeiro)

## O que ainda não está implementado
- Notificação automática ao lead quando aprovado/rejeitado
- Mensagem template de WhatsApp por status
- Filtro por status
- Busca por nome/empresa

## Chamadas de API existentes
1. `supabase.from("waitlist").select("*").eq("influencer_id", influencer.id).order("criado_em", desc)`
2. `supabase.from("clients").insert({...})` — ao aprovar
3. `supabase.from("waitlist").update({ status: "aprovado/rejeitado/contatado" }).eq("id", id)`

## Dependências
- `src/views/panel/WaitlistPage.tsx`
- `src/components/panel/PanelLayout.tsx`

## Observações para o dev
Quando aprovado, o cliente é criado com `user_id: null` (pois o lead pode não ter conta). Futuramente, enviar e-mail convidando o lead a criar conta e vincular automaticamente. O campo `origem` do cliente criado por aprovação deve ser `"waitlist"`.
