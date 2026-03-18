# Cadastro Cliente

> **Status:** `Implementado`
> **Rota:** `/cadastro-cliente`
> **Auth:** `Pública`
> **Arquivo:** `src/app/(auth)/cadastro-cliente/page.tsx` → `src/views/CadastroCliente.tsx`

## O que faz

Formulário de cadastro para empresas e pessoas que querem contratar influenciadoras. Suporta cadastro como Pessoa Jurídica (PJ) ou Pessoa Física (PF), com campos específicos para cada tipo. Cria conta no Supabase Auth e perfil empresarial via API.

## O que o usuário vê

- Navbar
- Seletor PJ / PF com botões visuais
- Formulário com: nome, e-mail, senha, WhatsApp
- Campos PJ: CNPJ (com máscara), razão social
- Campos PF: CPF (com máscara)
- Campo de endereço comercial
- Botão "Criar conta"
- Footer

## Dados carregados

Nenhum carregado — apenas formulário.

## Ações disponíveis

| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Enviar formulário | `supabase.auth.signUp` → `POST /api/auth/register/client` | Cria conta e perfil, redireciona para `/login` |
| Alterar tipo de pessoa | — | Mostra/oculta campos específicos |

## Componentes usados

- `Navbar`, `Footer`, `Button` (shadcn)

## Proteção de rota

Nenhuma — página pública.

## Fluxo detalhado

1. `supabase.auth.signUp` com e-mail e senha
2. `POST /api/auth/register/client` com `tipo_pessoa`, dados pessoais e documentos
3. Exibe toast de sucesso e redireciona para `/login`
