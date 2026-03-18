# POST /api/auth/register/influencer

> **Status:** `Implementado`
> **Auth:** `Pública`
> **Arquivo:** `src/app/api/auth/register/influencer/route.ts`

## O que faz

Cria o perfil de influenciadora após o usuário já ter sido criado no Supabase Auth. Insere um registro em `influencers` com status `em_analise`, cria a entrada em `user_roles` e notifica o time de suporte via WhatsApp.

## Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": "uuid-do-usuario-supabase",
  "nome": "Nome da Influencer",
  "whatsapp": "11999999999",
  "bio": "Texto sobre mim",
  "nicho": "Moda",
  "seguidores": "50.000",
  "instagram": "@handle",
  "foto_url": "https://storage.supabase.co/...",
  "email": "influencer@example.com"
}
```

## Response (sucesso)

**Status:** `201`
```json
{
  "message": "Cadastro recebido! Aguarde análise da equipe.",
  "influencer_id": "uuid-gerado"
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `user_id`, `nome` ou `whatsapp` ausentes | `"user_id, nome e whatsapp são obrigatórios"` |
| 409 | Username já em uso | `"CONFLICT: Username já em uso"` |
| 500 | Erro no banco de dados | `"Erro interno do servidor"` |

## Regras de negócio aplicadas

- [RN-01] Username é gerado automaticamente a partir do `nome`: lowercase, sem espaços, apenas `a-z0-9._`, com sufixo numérico aleatório (ex: `mariasilva42`)
- [RN-02] Verifica unicidade do username antes de inserir
- [RN-03] Influencer começa sempre com `status: 'em_analise'` — precisa de aprovação do admin
- [RN-04] Notifica o suporte via WhatsApp com nome, username e link para o painel admin

## Exemplo de uso no frontend

```typescript
// Em CadastroInfluenciadora.tsx, após supabase.auth.signUp
const res = await fetch('/api/auth/register/influencer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id, nome, whatsapp, bio, nicho, seguidores, instagram, foto_url, email }),
})
```
