# errors.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/errors.ts`
> **Usado em:** Todos os arquivos de API routes

## O que faz

Centraliza o tratamento de erros nas API Routes, mapeando strings de erro padronizadas para respostas HTTP com os códigos de status corretos. Elimina a necessidade de `try/catch` com lógica de status repetida em cada rota.

## Funções exportadas

### `apiError(error)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `error` | `unknown` | Qualquer erro capturado no `catch` |

**Retorna:** `NextResponse` — resposta JSON com campo `error` e status HTTP apropriado

**Tabela de mapeamento:**

| Prefixo da mensagem | Status HTTP | Mensagem retornada |
|---------------------|-------------|-------------------|
| `UNAUTHORIZED` | 401 | `"Não autenticado"` |
| `FORBIDDEN` | 403 | `"Sem permissão"` |
| `NOT_FOUND: ...` | 404 | Parte após `NOT_FOUND: ` |
| `CONFLICT: ...` | 409 | Parte após `CONFLICT: ` |
| `VALIDATION: ...` | 400 | Parte após `VALIDATION: ` |
| Qualquer outro erro | 500 | `"Erro interno do servidor"` |

**Exemplo:**
```typescript
export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req) // lança 'UNAUTHORIZED' ou 'FORBIDDEN'
    // ...
  } catch (e) {
    return apiError(e) // converte automaticamente para response correta
  }
}
```

## Observações

- Erros que não correspondem a nenhum prefixo mapeado são logados via `console.error('[API Error]', error)` e retornam 500.
- Para lançar um erro `NOT_FOUND`, basta fazer `throw new Error('NOT_FOUND: Recurso não encontrado')`.
- Os erros `UNAUTHORIZED` e `FORBIDDEN` são lançados pelas funções de `src/lib/auth.ts`.
