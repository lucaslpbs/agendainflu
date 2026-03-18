# PATCH /api/clients/[id]/status

> **Status:** `Implementado`
> **Auth:** `Influencer`
> **Arquivo:** `src/app/api/clients/[id]/status/route.ts`

## O que faz

Atualiza o status de um cliente da influenciadora autenticada. Usado para bloquear/ativar clientes no painel de gerenciamento.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{ "status": "bloqueado" }
```

**Status válidos:** `ativo`, `espera`, `bloqueado`

## Response (sucesso)

**Status:** `200`
```json
{ "updated": true }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | Token sem `influencer_id` | `"Sem influencer_id"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role sem permissão | `"Sem permissão"` |
| 404 | Cliente não encontrado ou não pertence à influenciadora | `"NOT_FOUND: Cliente nao encontrado"` |

## Exemplo de uso no frontend

```typescript
await apiFetch(`/api/clients/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'ativo' }),
})
```
