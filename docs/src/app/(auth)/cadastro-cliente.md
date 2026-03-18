# (auth)/cadastro-cliente/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/(auth)/cadastro-cliente/page.tsx`

## O que faz
Formulário de cadastro para empresas/clientes em `/cadastro-cliente`. Suporta dois tipos de pessoa: Pessoa Jurídica (PJ, com CNPJ + Razão Social) e Pessoa Física (PF, com CPF). Cria conta de auth e perfil em `client_profiles`.

## Como acessar / Como usar
`http://localhost:3000/cadastro-cliente`. Thin wrapper sobre `src/views/CadastroCliente.tsx`.

## Estado atual (Lovable)
- Toggle PJ/PF com campos condicionais
- Formatação automática de CPF (000.000.000-00) e CNPJ (00.000.000/0000-00)
- Criação de conta via `supabase.auth.signUp()` — **funcional**
- Inserção em `client_profiles` — **funcional** (cast `as any` indica tabela possivelmente não tipada)
- Redireciona para `/login` após cadastro

## O que ainda não está implementado
- Validação de CPF/CNPJ (apenas formatação visual, sem verificação de validade matemática)
- Role `client` não é atribuído automaticamente em `user_roles` — **bug potencial**
- Verificação de e-mail duplicado antes de criar conta
- Perfil `client_profiles` usa `as any` — tabela pode não existir no schema gerado

## Chamadas de API existentes
1. `supabase.auth.signUp({ email, password })` — criação de conta
2. `supabase.from("client_profiles").insert({...} as any)` — criação de perfil

## Dependências
- `src/views/CadastroCliente.tsx`
- `src/integrations/supabase/client.ts`

## Observações para o dev
A tabela `client_profiles` está sendo usada com cast `as any`, o que indica que ela pode não estar no schema TypeScript gerado pelo Supabase. Verificar se a tabela existe e gerar os tipos atualizados. Também verificar se um trigger no Supabase atribui role `client` automaticamente após signup.
