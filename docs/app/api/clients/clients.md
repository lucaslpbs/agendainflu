# GET / POST /api/clients

> **Status:** `Implementado`
> **Auth:** `Influencer`
> **Arquivo:** `src/app/api/clients/route.ts`

## O que faz

**GET:** Lista os clientes da influenciadora autenticada, com filtros opcionais por status e busca textual.

**POST:** Adiciona manualmente um novo cliente à base da influenciadora (cadastro manual, sem self-service).

## Request — GET

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | `string` | Filtrar por status (`ativo`, `espera`, `bloqueado`) |
| `busca` | `string` | Busca por nome, empresa ou WhatsApp |

## Response (sucesso) — GET

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "influencer_id": "uuid",
      "nome": "João da Silva",
      "empresa": "Empresa LTDA",
      "whatsapp": "11999999999",
      "email": "joao@empresa.com",
      "status": "ativo",
      "origem": "site"
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
  "nome": "João da Silva",
  "whatsapp": "11999999999",
  "email": "joao@empresa.com",
  "empresa": "Empresa LTDA",
  "notas": "Cliente VIP"
}
```

## Response (sucesso) — POST

**Status:** `201`
```json
{ "data": { /* cliente criado */ } }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `nome` ou `whatsapp` ausentes | `"nome e whatsapp sao obrigatorios"` |
| 400 | Token sem `influencer_id` | `"Sem influencer_id"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role sem permissão | `"Sem permissão"` |
| 409 | WhatsApp já cadastrado para esta influenciadora | `"CONFLICT: Cliente com este WhatsApp ja cadastrado"` |

## Regras de negócio aplicadas

- Clientes adicionados manualmente são criados com `status = 'ativo'` e `origem = 'cadastro_manual'`
- Unicidade garantida por `(influencer_id, whatsapp)`
