# (auth)/login/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/(auth)/login/page.tsx`

## O que faz
Página de autenticação em `/login`. Suporta dois modos: login com senha (email + password) e Magic Link (OTP por e-mail). Após login bem-sucedido, redireciona o usuário com base no seu role: admin → `/admin`, influencer → `/painel`, client → `/cliente/explorar`.

## Como acessar / Como usar
Navegar para `http://localhost:3000/login`. Thin wrapper que renderiza `src/views/Login.tsx`.

## Estado atual (Lovable)
- Login com senha via `supabase.auth.signInWithPassword()` — **funcional com Supabase real**
- Magic Link via `supabase.auth.signInWithOtp()` — **funcional** (envia e-mail real)
- Redirecionamento por role consultando tabela `user_roles`
- Validação mínima: campos obrigatórios via HTML `required`

## O que ainda não está implementado
- Recuperação de senha
- Validação mais robusta com Zod/React Hook Form
- Rate limiting no cliente
- Mensagens de erro traduzidas para PT-BR

## Chamadas de API existentes
1. `supabase.auth.signInWithPassword({ email, password })` — POST auth
2. `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })` — POST auth
3. `supabase.from("user_roles").select("role").eq("user_id", userId)` — GET roles pós-login

## Dependências
- `src/views/Login.tsx`
- `src/integrations/supabase/client.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/landing/Navbar.tsx`, `Footer.tsx`

## Observações para o dev
O redirecionamento pós-login consulta `user_roles` diretamente no componente (não usa o `AuthContext`). Verificar se isso cria uma dupla chamada desnecessária.
