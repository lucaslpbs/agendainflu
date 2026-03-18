# PATCH /api/waitlist/[id]/status

> **Status:** `Implementado`
> **Auth:** `Influencer`
> **Arquivo:** `src/app/api/waitlist/[id]/status/route.ts`

## O que faz

Atualiza o status de um item da lista de espera. Se o status for `aprovado`, cria ou atualiza automaticamente um registro de cliente (`clients`) com status `ativo` e envia notificação WhatsApp ao lead com link para o perfil da influenciadora.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "aprovado",
  "motivo": "Motivo de rejeição (obrigatório apenas para status 'rejeitado')"
}
```

**Status válidos:** `aprovado`, `rejeitado`, `contatado`

## Response (sucesso)

**Status:** `200`
```json
{
  "updated": true,
  "client_created": true
}
```

`client_created` é `true` apenas quando `status = 'aprovado'`.

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `status` ausente | `"status obrigatorio"` |
| 400 | `status = 'rejeitado'` sem `motivo` | `"Motivo obrigatorio para rejeicao"` |
| 400 | Token sem `influencer_id` | `"Sem influencer_id"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role sem permissão | `"Sem permissão"` |
| 404 | Item não encontrado | `"NOT_FOUND: Item nao encontrado"` |

## Regras de negócio aplicadas

- Quando `aprovado`: usa `upsert` em `clients` com conflito em `(influencer_id, whatsapp)`, garantindo idempotência
- Notificação WhatsApp com link para o perfil da influenciadora quando aprovado
- Verifica ownership: item deve pertencer à influenciadora autenticada
