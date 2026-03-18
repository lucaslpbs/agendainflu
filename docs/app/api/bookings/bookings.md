# POST / GET /api/bookings

> **Status:** `Implementado`
> **Auth:** `POST: Requer JWT` | `GET: Influencer`
> **Arquivo:** `src/app/api/bookings/route.ts`

## O que faz

**POST:** Cria um novo agendamento. Valida disponibilidade da data, cria/atualiza o registro do cliente, gera o código de confirmação e envia notificações WhatsApp tanto para o cliente quanto para a influenciadora.

**GET:** Lista os agendamentos da influenciadora autenticada, com join em `clients` e `services`. Suporta filtros por status e período.

## Request — POST

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "influencer_id": "uuid",
  "service_id": "uuid",
  "data_agendada": "2025-04-20",
  "descricao_produto": "Lançamento da coleção primavera",
  "link_negocio": "https://minhaempresa.com",
  "material_url": ["https://storage.supabase.co/..."],
  "observacoes": "Mencionar o desconto de 20%"
}
```

## Response (sucesso) — POST

**Status:** `201`
```json
{
  "booking": {
    "id": "uuid",
    "codigo_confirmacao": "AI-2025-0042",
    "status": "pendente",
    "data_agendada": "2025-04-20"
  },
  "wa_link": "https://wa.me/5511999999999?text=...",
  "mensagens_enviadas": true
}
```

## Request — GET

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | `string` | Filtrar por status (`pendente`, `confirmado`, `concluido`, `cancelado`) |
| `data_inicio` | `string` | Data mínima (yyyy-MM-dd) |
| `data_fim` | `string` | Data máxima (yyyy-MM-dd) |

## Response (sucesso) — GET

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo_confirmacao": "AI-2025-0042",
      "status": "pendente",
      "data_agendada": "2025-04-20",
      "clients": { "nome": "...", "whatsapp": "..." },
      "services": { "tipo": "stories", "preco": 150 }
    }
  ]
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | Campos obrigatórios ausentes | `"influencer_id, service_id, data_agendada e descricao_produto sao obrigatorios"` |
| 400 | Data com menos de 2 dias de antecedência | `"Agendamento minimo com 2 dias de antecedencia"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 404 | Serviço não encontrado | `"NOT_FOUND: Servico nao encontrado"` |
| 409 | Data bloqueada ou sem slots disponíveis | `"Data nao disponivel para este servico"` |

## Regras de negócio aplicadas

- [RN-14] Agendamento mínimo: 2 dias de antecedência
- [RN-15] Se o cliente já está ativo (`status = 'ativo'`) na base da influenciadora, o agendamento é criado com `status = 'confirmado'` automaticamente; caso contrário, fica `pendente`
- [RN-16] Se o cliente não existir, é criado automaticamente com dados do `client_profile`
- Notificações WhatsApp são enviadas para o cliente e para a influenciadora
- `material_url` aceita array de URLs, armazenado como string separada por vírgulas
