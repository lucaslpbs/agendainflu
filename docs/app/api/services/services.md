# GET / POST /api/services

> **Status:** `Implementado`
> **Auth:** `GET: Pública` | `POST: Influencer`
> **Arquivo:** `src/app/api/services/route.ts`

## O que faz

**GET:** Lista os serviços ativos de uma influenciadora. Requer `influencer_id` como query param. Usado pelo painel da influenciadora para gerenciar serviços.

**POST:** Cria um novo serviço para a influenciadora autenticada.

## Request — GET

**Query params:**
| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `influencer_id` | `string` | Sim | UUID da influenciadora |

**Exemplo:** `GET /api/services?influencer_id=uuid`

## Response (sucesso) — GET

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "influencer_id": "uuid",
      "tipo": "stories",
      "formato": "online",
      "preco": 150.00,
      "descricao": "3 stories com link na bio",
      "max_por_dia": 2,
      "ativo": true
    }
  ]
}
```

## Request — POST

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "tipo": "stories",
  "formato": "online",
  "preco": 150.00,
  "descricao": "3 stories com link na bio",
  "max_por_dia": 2
}
```

**Tipos válidos:** `stories`, `reels`, `reels_stories`, `feed`, `presencial`
**Formatos válidos:** `online`, `presencial`

## Response (sucesso) — POST

**Status:** `201`
```json
{ "data": { /* serviço criado */ } }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `influencer_id` ausente (GET) | `"influencer_id obrigatório"` |
| 400 | `tipo`, `formato` ou `preco` ausentes (POST) | `"tipo, formato e preco são obrigatórios"` |
| 400 | Token sem `influencer_id` (POST) | `"Perfil de influencer não encontrado"` |
| 401 | Sem autenticação (POST) | `"Não autenticado"` |
| 403 | Role sem permissão (POST) | `"Sem permissão"` |
