# GET /api/admin/dashboard

> **Status:** `Implementado`
> **Auth:** `Admin`
> **Arquivo:** `src/app/api/admin/dashboard/route.ts`

## O que faz

Retorna estatísticas consolidadas da plataforma para o painel administrativo: contagens de influenciadoras, agendamentos, clientes e lista de espera, além da receita total calculada a partir dos agendamentos confirmados e concluídos.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Response (sucesso)

**Status:** `200`
```json
{
  "stats": {
    "influencers": 12,
    "emAnalise": 3,
    "bookings": 87,
    "clients": 45,
    "waitlist": 18,
    "receita": 13250.00
  },
  "recentBookings": [
    {
      "id": "uuid",
      "codigo_confirmacao": "AI-2025-0087",
      "status": "confirmado",
      "data_agendada": "2025-04-20",
      "services": { "preco": 200, "tipo": "reels" },
      "clients": { "nome": "Empresa ABC" },
      "influencers": { "nome": "Maria Silva" }
    }
  ],
  "allBookings": [ /* todos os agendamentos */ ]
}
```

`recentBookings` contém os 10 mais recentes. `allBookings` contém todos (limitado a 200).

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role não é admin | `"Sem permissão"` |

## Regras de negócio aplicadas

- Receita = soma de `services.preco` de agendamentos com status `confirmado` ou `concluido`
- Consultas são executadas em paralelo via `Promise.all` para performance
