# Login

> **Status:** `Implementado`
> **Rota:** `/login`
> **Auth:** `Pública`
> **Arquivo:** `src/app/(auth)/login/page.tsx` → `src/views/Login.tsx`

## O que faz

Tela de autenticação que suporta dois modos: login com senha e login com Magic Link (link enviado por e-mail). Após login bem-sucedido, redireciona o usuário para o painel correspondente ao seu role.

## O que o usuário vê

- Navbar
- Formulário com campo de e-mail (sempre visível)
- Campo de senha (apenas no modo `password`)
- Botão principal de login
- Botão para alternar entre modos (senha / magic link)
- Links para cadastro de cliente e de influenciadora
- Footer

## Dados carregados

Nenhum dado carregado ao montar — apenas formulário.

## Ações disponíveis

| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Login com senha | `supabase.auth.signInWithPassword` | Autentica e redireciona |
| Login com Magic Link | `supabase.auth.signInWithOtp` | Envia e-mail com link |
| Alternar modo | — | Muda entre formulário de senha e magic link |

## Lógica de redirecionamento após login

- Role `admin` → `/admin`
- Role `influencer` → `/painel`
- Role `client` ou sem role → `/cliente/explorar`

## Componentes usados

- `Navbar`, `Footer`, `Button` (shadcn)

## Proteção de rota

Nenhuma — página pública. Não há redirecionamento automático se já estiver autenticado.
