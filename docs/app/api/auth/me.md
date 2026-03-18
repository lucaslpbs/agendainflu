# GET /api/auth/me

> **Status:** `Implementado`
> **Auth:** `Requer JWT`
> **Arquivo:** `src/app/api/auth/me/route.ts`

## O que faz

Retorna os dados do usuário autenticado e seu perfil completo (dados de influencer ou de cliente, dependendo do role). Útil para hidratar o estado da aplicação após um refresh de página.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```
(ou cookie `auth-token`)

**Body:** Nenhum

## Response (sucesso)

**Status:** `200`
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "user@example.com",
    "role": "influencer",
    "influencer_id": "uuid-da-influencer"
  },
  "profile": {
    "id": "uuid-da-influencer",
    "nome": "Nome da Influencer",
    "username": "username",
    "status": "ativa"
    // ... demais campos da tabela influencers ou client_profiles
  }
}
```

O campo `profile` é `null` para admins. Para role `influencer`, contém dados da tabela `influencers`. Para role `client`, contém dados da tabela `client_profiles`.

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 401 | Token ausente ou inválido | `"Não autenticado"` |

## Regras de negócio aplicadas

- Admins retornam `profile: null`
- Influencers retornam perfil da tabela `influencers` filtrado por `influencer_id`
- Clientes retornam perfil da tabela `client_profiles` filtrado por `user_id`

## Exemplo de uso no frontend

```typescript
const { user, profile } = await apiFetch('/api/auth/me')
```
