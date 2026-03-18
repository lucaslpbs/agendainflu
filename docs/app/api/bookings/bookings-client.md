# GET /api/bookings/client

> **Status:** `Implementado`
> **Auth:** `Requer JWT`
> **Arquivo:** `src/app/api/bookings/client/route.ts`

## O que faz

Retorna todos os agendamentos do cliente autenticado, buscando através dos registros de `clients` vinculados ao `user_id`. Inclui dados da influenciadora e do serviço de cada agendamento, ordenados por data decrescente.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Response (sucesso)

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo_confirmacao": "AI-2025-0042",
      "status": "confirmado",
      "data_agendada": "2025-04-20",
      "influencers": {
        "nome": "Maria Silva",
        "foto_url": "https://...",
        "username": "mariasilva42"
      },
      "services": {
        "tipo": "stories",
        "formato": "online",
        "preco": 150.00,
        "descricao": "..."
      }
    }
  ]
}
```

Retorna `{ "data": [] }` se o cliente não tiver registros em `clients`.

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 401 | Sem autenticação | `"Não autenticado"` |
| 500 | Erro no banco de dados | `"Erro interno do servidor"` |

## Exemplo de uso no frontend

```typescript
// Em ClientBookings (views/client/ClientPages.tsx)
const { data } = await apiFetch('/api/bookings/client')
```
