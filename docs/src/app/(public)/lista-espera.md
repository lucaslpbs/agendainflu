# (public)/lista-espera/page.tsx e [username]/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/(public)/lista-espera/page.tsx` e `src/app/(public)/lista-espera/[username]/page.tsx`

## O que faz
Formulário público de lista de espera em `/lista-espera` (geral) ou `/lista-espera/:username` (vinculado a uma influenciadora específica). Coleta dados de contato de empresas interessadas em divulgação antes de se cadastrarem formalmente. Ambas as rotas renderizam o mesmo componente `ListaEspera`.

## Como acessar / Como usar
- `http://localhost:3000/lista-espera` — lista de espera geral
- `http://localhost:3000/lista-espera/[username]` — vinculada à influenciadora

## Estado atual (Lovable)
- Campos: nome e WhatsApp (obrigatórios), e-mail, empresa e mensagem (opcionais)
- Busca influenciadora pelo username para vincular o registro
- Insere na tabela `waitlist` com status `aguardando`
- Tela de sucesso com emoji e mensagem de confirmação
- Não requer autenticação

## O que ainda não está implementado
- Notificação automática para a influenciadora via WhatsApp/e-mail quando nova entrada chega
- Proteção contra duplicatas (mesmo WhatsApp/e-mail na mesma lista)
- reCAPTCHA ou outro mecanismo anti-spam

## Chamadas de API existentes
1. `supabase.from("influencers").select("id").eq("username", username)` (se username presente)
2. `supabase.from("waitlist").insert({ nome, whatsapp, email, empresa, mensagem, influencer_id })`

## Dependências
- `src/views/ListaEspera.tsx`
- `src/integrations/supabase/client.ts`

## Observações para o dev
O campo `influencer_id` fica `null` quando acessado pela rota geral. A tabela `waitlist` deve ter `influencer_id` como nullable. Status inicial é `aguardando` — gerenciado pelo painel da influenciadora ou pelo admin.
