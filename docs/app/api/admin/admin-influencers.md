# GET /api/admin/influencers

> **Status:** `Implementado`
> **Auth:** `Admin`
> **Arquivo:** `src/app/api/admin/influencers/route.ts`

## O que faz

Lista influenciadoras para o painel administrativo. Por padrão retorna apenas as que estão `em_analise`. Suporta filtro para listar todas.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query params:**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `status` | `string` | `em_analise` | Status desejado. Use `todas` para sem filtro. |

**Exemplo:** `GET /api/admin/influencers?status=todas`

## Response (sucesso)

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "username": "mariasilva42",
      "nome": "Maria Silva",
      "nicho": "Moda",
      "seguidores": "50K",
      "status": "em_analise",
      "created_at": "2025-03-01T12:00:00Z"
    }
  ]
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role não é admin | `"Sem permissão"` |

## Observações

- Ordenação por `created_at` crescente (mais antigas primeiro — fila de análise)

---

# POST /api/admin/influencers/[id]/approve

> **Status:** `Implementado`
> **Auth:** `Admin`
> **Arquivo:** `src/app/api/admin/influencers/[id]/approve/route.ts`

## O que faz

Aprova uma influenciadora para a plataforma. Atualiza o status para `ativa`, salva o checklist de análise em `influencer_analysis` e notifica a influenciadora via WhatsApp.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "checklist": {
    "perfil_completo": true,
    "instagram_verificado": true,
    "nicho_definido": true,
    "foto_qualidade": true,
    "bio_preenchida": true
  },
  "notas": "Perfil excelente, aprovada sem ressalvas"
}
```

## Response (sucesso)

**Status:** `200`
```json
{ "approved": true }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | Checklist incompleto ou vazio | `"Checklist incompleto — todos os itens devem ser marcados"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role não é admin | `"Sem permissão"` |

---

# POST /api/admin/influencers/[id]/reject

> **Status:** `Implementado`
> **Auth:** `Admin`
> **Arquivo:** `src/app/api/admin/influencers/[id]/reject/route.ts`

## O que faz

Rejeita uma influenciadora, atualizando o status para `rejeitada`. Salva o motivo em `influencer_analysis` e notifica a influenciadora via WhatsApp com o motivo da rejeição.

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{ "motivo": "Instagram sem conteúdo consistente" }
```

## Response (sucesso)

**Status:** `200`
```json
{ "rejected": true }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `motivo` ausente | `"Motivo obrigatorio"` |
| 401 | Sem autenticação | `"Não autenticado"` |
| 403 | Role não é admin | `"Sem permissão"` |
