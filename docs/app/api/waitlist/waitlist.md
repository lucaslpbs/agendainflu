# POST / GET /api/waitlist

> **Status:** `Implementado`
> **Auth:** `POST: Pública` | `GET: Influencer`
> **Arquivo:** `src/app/api/waitlist/route.ts`

## O que faz

**POST:** Adiciona um lead à lista de espera de uma influenciadora. Verifica se o solicitante já é cliente ativo (neste caso, redireciona para agendamento direto) ou já está na lista. Envia notificações WhatsApp para a influenciadora e para o próprio lead.

**GET:** Lista os registros da lista de espera da influenciadora autenticada, com filtro opcional por status.

## Request — POST

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "influencer_id": "uuid",
  "nome": "Maria",
  "whatsapp": "11999999999",
  "email": "maria@empresa.com",
  "empresa": "Minha Empresa",
  "mensagem": "Quero divulgar meu produto..."
}
```

## Response (sucesso) — POST

**Status:** `201`
```json
{ "message": "Solicitacao recebida!" }
```

**Se já é cliente ativo:**
```json
{ "redirect": "booking", "message": "Voce ja pode agendar!" }
```

**Se já está na lista:**
```json
{ "message": "Voce ja esta na lista de espera!" }
```

## Request — GET

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | `string` | Filtrar por status (`aguardando`, `contatado`, `aprovado`, `rejeitado`) |

## Response (sucesso) — GET

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "influencer_id": "uuid",
      "nome": "Maria",
      "whatsapp": "11999999999",
      "empresa": "Minha Empresa",
      "status": "aguardando",
      "criado_em": "2025-03-01T12:00:00Z"
    }
  ]
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `nome` ou `whatsapp` ausentes | `"nome e whatsapp sao obrigatorios"` |
| 401 | Sem autenticação (GET) | `"Não autenticado"` |
| 403 | Role sem permissão (GET) | `"Sem permissão"` |

## Regras de negócio aplicadas

- [RN-18] Não aceita entrada duplicada: verifica por `(influencer_id, whatsapp)` com status diferente de `rejeitado`
- Notificação WhatsApp para a influenciadora e confirmação para o lead
