# GET /PATCH /api/influencers/[slug]

> **Status:** `Implementado`
> **Auth:** `GET: Pública` | `PATCH: Influencer (própria) ou Admin`
> **Arquivo:** `src/app/api/influencers/[slug]/route.ts`

## O que faz

**GET:** Retorna o perfil completo de uma influenciadora pelo username, incluindo seus serviços ativos. Se o usuário não estiver autenticado, o campo `preco` dos serviços é ocultado (retornado como `null`).

**PATCH:** Atualiza campos do perfil da influenciadora. Apenas a própria influenciadora ou um admin podem editar.

## Request — GET

Não requer headers. O token (se presente) é usado para determinar se os preços são visíveis.

**Exemplo:** `GET /api/influencers/mariasilva42`

## Response (sucesso) — GET

**Status:** `200`
```json
{
  "influencer": {
    "id": "uuid",
    "username": "mariasilva42",
    "nome": "Maria Silva",
    "bio": "...",
    "nicho": "Moda",
    "seguidores": "50K",
    "foto_url": "https://...",
    "whatsapp": "11999999999",
    "instagram": "@handle",
    "status": "ativa"
  },
  "services": [
    {
      "id": "uuid",
      "tipo": "stories",
      "formato": "online",
      "preco": 150.00,
      "descricao": "...",
      "max_por_dia": 2,
      "ativo": true
    }
  ]
}
```

## Request — PATCH

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (campos permitidos):**
```json
{
  "bio": "Nova bio",
  "nicho": "Beleza",
  "seguidores": "60K",
  "foto_url": "https://...",
  "instagram": "@novhandle",
  "whatsapp": "11988888888",
  "nome": "Novo Nome"
}
```

## Response (sucesso) — PATCH

**Status:** `200`
```json
{ "data": { /* influencer atualizada */ } }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 403 | PATCH sem autenticação ou usuário diferente | `"FORBIDDEN"` |
| 404 | Username não encontrado ou influencer não está ativa | `"NOT_FOUND: Influenciadora não encontrada"` |

## Regras de negócio aplicadas

- [RN-08] Preços dos serviços são ocultados para usuários não autenticados
- [RN-09] Apenas campos da whitelist `['bio', 'nicho', 'seguidores', 'foto_url', 'instagram', 'whatsapp', 'nome']` são atualizados no PATCH
