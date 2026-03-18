# PATCH / DELETE /api/services/[id]

> **Status:** `Implementado`
> **Auth:** `Influencer (própria)`
> **Arquivo:** `src/app/api/services/[id]/route.ts`

## O que faz

**PATCH:** Atualiza campos de um serviço existente. Verifica que o serviço pertence à influenciadora autenticada.

**DELETE:** Remove um serviço. Se houver agendamentos vinculados, realiza soft delete (desativa o serviço definindo `ativo = false`). Caso contrário, realiza hard delete.

## Request — PATCH

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (campos permitidos):**
```json
{
  "tipo": "reels",
  "formato": "online",
  "preco": 200.00,
  "descricao": "1 reels com menção",
  "max_por_dia": 1,
  "ativo": false
}
```

## Response (sucesso) — PATCH

**Status:** `200`
```json
{ "data": { /* serviço atualizado */ } }
```

## Request — DELETE

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Response (sucesso) — DELETE

**Status:** `200`
```json
{ "deleted": true, "tipo": "hard" }
// ou
{ "deleted": true, "tipo": "soft" }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | Token sem `influencer_id` | `"Perfil de influencer não encontrado"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Serviço não pertence à influenciadora autenticada | `"FORBIDDEN"` |

## Regras de negócio aplicadas

- [RN-13] Soft delete: se o serviço tem agendamentos, apenas desativa (`ativo = false`); caso contrário, exclui definitivamente
- Whitelist de campos atualizáveis: `tipo`, `formato`, `preco`, `descricao`, `max_por_dia`, `ativo`
- `preco` é convertido via `parseFloat`, `max_por_dia` via `parseInt`
