# Cadastro Influenciadora

> **Status:** `Implementado`
> **Rota:** `/cadastro-influenciadora`
> **Auth:** `Pública`
> **Arquivo:** `src/app/(auth)/cadastro-influenciadora/page.tsx` → `src/views/CadastroInfluenciadora.tsx`

## O que faz

Formulário de cadastro para influenciadoras. Cria a conta no Supabase Auth, faz upload opcional da foto de perfil para o Supabase Storage, e envia os dados do perfil para a API que cria o registro com status `em_analise`.

## O que o usuário vê

- Navbar
- Formulário com: nome, e-mail, senha, WhatsApp, Instagram, número de seguidores, nicho (select com opções pré-definidas), bio e upload de foto
- Botão "Enviar para análise"
- Mensagem explicando que a aprovação leva até 48h
- Footer

## Dados carregados

Nenhum carregado — apenas formulário.

## Ações disponíveis

| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Enviar formulário | `supabase.auth.signUp` → `POST /api/auth/register/influencer` | Cria conta e perfil, redireciona para `/login` |
| Upload de foto | `supabase.storage.from('avatars').upload` | Envia foto para bucket `avatars` |

## Componentes usados

- `Navbar`, `Footer`, `Button` (shadcn)

## Proteção de rota

Nenhuma — página pública.

## Fluxo detalhado

1. `supabase.auth.signUp` com e-mail e senha
2. Se houver foto, upload para `avatars/{user_id}/avatar.{ext}` e obtenção da URL pública
3. `POST /api/auth/register/influencer` com todos os dados do perfil
4. Exibe toast de sucesso e redireciona para `/login`
