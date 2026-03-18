# GET /api/influencers/[slug]/availability

> **Status:** `Implementado`
> **Auth:** `Pública`
> **Arquivo:** `src/app/api/influencers/[slug]/availability/route.ts`

## O que faz

Retorna a disponibilidade de datas para agendamento com uma influenciadora nos próximos N dias (padrão: 14). O `[slug]` pode ser o `username` ou o `influencer_id` (UUID). Cruza dados de disponibilidade configurada (`availability`), agendamentos existentes (`bookings`) e limites por serviço (`services.max_por_dia`).

## Request

**Query params:**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `days` | `number` | `14` | Número de dias futuros a retornar |

**Exemplos:**
- `GET /api/influencers/mariasilva42/availability`
- `GET /api/influencers/uuid-da-influencer/availability?days=30`

## Response (sucesso)

**Status:** `200`
```json
{
  "data": [
    {
      "data": "2025-04-15",
      "disponivel": true,
      "bloqueado": false,
      "slots_disponiveis": 3,
      "slots_ocupados": 1
    },
    {
      "data": "2025-04-16",
      "disponivel": false,
      "bloqueado": true,
      "slots_disponiveis": 3,
      "slots_ocupados": 0
    }
  ]
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 404 | Username não encontrado | `"NOT_FOUND"` |
| 500 | Erro no banco de dados | `"Erro interno do servidor"` |

## Regras de negócio aplicadas

- [RN-10] As datas começam a partir de hoje + 2 dias (agendamento mínimo com 2 dias de antecedência)
- [RN-11] Um dia é considerado indisponível se: `bloqueado = true` OU `slots_ocupados >= slots_disponiveis`
- [RN-12] Se não houver registro em `availability` para a data, assume `slots_disponiveis = 3` e `bloqueado = false`
- Agendamentos com status `pendente` ou `confirmado` contam como ocupados
