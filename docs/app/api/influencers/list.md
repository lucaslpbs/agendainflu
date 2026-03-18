# GET /api/influencers

> **Status:** `Implementado`
> **Auth:** `Pública`
> **Arquivo:** `src/app/api/influencers/route.ts`

## O que faz

Retorna uma lista paginada de influenciadoras com status `ativa`. Suporta filtros por nicho e busca por nome ou username. Usado pelo componente `FeaturedInfluencers` na landing page e pela página de exploração de clientes.

## Request

**Query params:**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `nicho` | `string` | - | Filtra por nicho (ILIKE) |
| `busca` | `string` | - | Busca por nome ou username (ILIKE) |
| `limit` | `number` | `20` | Máximo de resultados |

**Exemplo:** `GET /api/influencers?nicho=Moda&limit=8`

## Response (sucesso)

**Status:** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "username": "mariasilva42",
      "nome": "Maria Silva",
      "bio": "Influencer de moda...",
      "nicho": "Moda",
      "seguidores": "50K",
      "foto_url": "https://...",
      "status": "ativa"
    }
  ]
}
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 500 | Erro no banco de dados | `"Erro interno do servidor"` |

## Regras de negócio aplicadas

- Retorna apenas influenciadoras com `status = 'ativa'`
- Ordenação por `created_at` decrescente (mais recentes primeiro)
- Retorna apenas campos públicos: sem `whatsapp`, `instagram`, nem dados sensíveis
