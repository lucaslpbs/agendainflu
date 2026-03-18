# (auth)/cadastro-influenciadora/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/(auth)/cadastro-influenciadora/page.tsx`

## O que faz
Formulário de cadastro para influenciadoras em `/cadastro-influenciadora`. Cria conta de autenticação Supabase, faz upload de foto de perfil para o Storage bucket `avatars`, e insere registro na tabela `influencers` com status `em_analise` (aguarda aprovação admin).

## Como acessar / Como usar
`http://localhost:3000/cadastro-influenciadora`. Thin wrapper sobre `src/views/CadastroInfluenciadora.tsx`.

## Estado atual (Lovable)
- Cria usuário via `supabase.auth.signUp()` — **funcional**
- Upload de foto para bucket `avatars` — **funcional** (se bucket existir)
- Insere em `influencers` com status `em_analise` — **funcional**
- Username gerado automaticamente: `nome.toLowerCase() + random(100)`
- Nicho selecionado via `<select>` com 10 opções fixas

## O que ainda não está implementado
- Validação com Zod/React Hook Form
- Verificação de unicidade de username
- Confirmação de e-mail obrigatória antes de prosseguir
- Notificação para admin quando novo cadastro chega
- Preview da foto antes do upload

## Chamadas de API existentes
1. `supabase.auth.signUp({ email, password, options })` — criação de conta
2. `supabase.storage.from("avatars").upload(path, foto)` — upload de foto
3. `supabase.storage.from("avatars").getPublicUrl(path)` — URL pública
4. `supabase.from("influencers").insert({...})` — criação de perfil

## Dependências
- `src/views/CadastroInfluenciadora.tsx`
- `src/integrations/supabase/client.ts`

## Observações para o dev
O bucket `avatars` precisa estar configurado no Supabase Storage como público (ou com policy adequada). O campo `aprovado_em` e `observacoes_admin` não são preenchidos no cadastro — apenas pelo admin na aprovação.
