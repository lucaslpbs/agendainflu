# PATCH /api/bookings/[id]/status

> **Status:** `Implementado`
> **Auth:** `Influencer`
> **Arquivo:** `src/app/api/bookings/[id]/status/route.ts`

## O que faz

Atualiza o status de um agendamento seguindo transições válidas. Envia notificação WhatsApp ao cliente informando sobre a mudança de status. Verifica que o agendamento pertence à influenciadora autenticada.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{ "status": "confirmado" }
```

**Transições válidas:**
| De | Para |
|----|------|
| `pendente` | `confirmado`, `cancelado` |
| `confirmado` | `concluido`, `cancelado` |
| `concluido` | (nenhuma) |
| `cancelado` | (nenhuma) |

## Response (sucesso)

**Status:** `200`
```json
{
  "booking": { /* booking atualizado */ },
  "mensagem_enviada": true
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `status` ausente | `"status obrigatorio"` |
| 400 | Transição inválida | `"Transicao de status invalida: pendente -> concluido"` |
| 400 | Token sem `influencer_id` | `"Perfil de influencer nao encontrado"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role sem permissão | `"Sem permissão"` |
| 404 | Agendamento não encontrado ou não pertence à influenciadora | `"NOT_FOUND: Agendamento nao encontrado"` |

## Regras de negócio aplicadas

- [RN-17] Máquina de estados: transições inválidas são rejeitadas
- Mensagens WhatsApp personalizadas por status:
  - `confirmado`: informa data e código de confirmação
  - `cancelado`: sugere reagendamento com link do perfil
  - `concluido`: mensagem de agradecimento e feedback

## Exemplo de uso no frontend

```typescript
await apiFetch(`/api/bookings/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'confirmado' }),
})
```
