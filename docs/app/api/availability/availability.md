# GET / POST /api/availability

> **Status:** `Implementado`
> **Auth:** `Influencer`
> **Arquivo:** `src/app/api/availability/route.ts`

## O que faz

**GET:** Retorna as configurações de disponibilidade da influenciadora autenticada para um determinado mês. Usado pelo calendário do painel para exibir dias disponíveis, bloqueados e lotados.

**POST:** Cria ou atualiza (upsert) a disponibilidade de uma data específica. Permite bloquear/desbloquear dias e configurar o número máximo de agendamentos.

## Request — GET

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `mes` | `string` | Mês no formato `yyyy-MM` (ex: `2025-04`) |

**Exemplo:** `GET /api/availability?mes=2025-04`

## Response (sucesso) — GET

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "influencer_id": "uuid",
      "data": "2025-04-15",
      "slots_disponiveis": 3,
      "bloqueado": false,
      "created_at": "2025-03-01T12:00:00Z"
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
  "data": "2025-04-20",
  "bloqueado": true,
  "slots_disponiveis": 2
}
```

## Response (sucesso) — POST

**Status:** `200`
```json
{ "updated": true }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `data` ausente (POST) | `"data obrigatoria"` |
| 400 | Token sem `influencer_id` | `"Sem influencer_id"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role sem permissão | `"Sem permissão"` |

## Regras de negócio aplicadas

- POST usa upsert com conflito em `(influencer_id, data)` — idempotente
- `bloqueado` padrão: `false`; `slots_disponiveis` padrão: `1`
- Sem registro de disponibilidade, a API de agendamento assume `slots_disponiveis = 3` e `bloqueado = false`
