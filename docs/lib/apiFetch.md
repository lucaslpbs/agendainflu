# apiFetch.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/apiFetch.ts`
> **Usado em:** `src/views/panel/AgendamentosPage.tsx`, `src/views/panel/ServicosPage.tsx`, `src/views/panel/ClientesPage.tsx`, `src/views/panel/WaitlistPage.tsx`, `src/views/panel/CalendarioPage.tsx`, `src/views/panel/PerfilPage.tsx`

## O que faz

Wrapper sobre o `fetch` nativo que lê automaticamente o JWT próprio do `localStorage` e o inclui no header `Authorization: Bearer`. Também lança um `Error` com a mensagem de erro da API quando a resposta não é `ok`, simplificando o tratamento de erros nas views do painel.

## Funções exportadas

### `apiFetch(url, init?)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `url` | `string` | URL da API (relativa, ex: `/api/bookings`) |
| `init` | `RequestInit` (opcional) | Opções do fetch (`method`, `body`, `headers`, etc.) |

**Retorna:** `Promise<any>` — dados JSON da resposta

**Lança:** `Error` com mensagem do campo `error` da resposta JSON, ou `'Erro {statusCode}'` se não houver campo `error`

**Exemplo:**
```typescript
// GET autenticado
const { data } = await apiFetch('/api/bookings')

// POST autenticado com body
await apiFetch('/api/services', {
  method: 'POST',
  body: JSON.stringify({ tipo: 'stories', preco: 150 }),
})
```

## Variáveis de ambiente necessárias

Nenhuma diretamente. Lê o token de `localStorage.getItem('agenda-token')`.

## Observações

- Funciona apenas no cliente (`window !== 'undefined'`). Não usar em Server Components ou API Routes.
- Sempre inclui `Content-Type: application/json`, podendo ser sobrescrito via `init.headers`.
- O token é lido de `localStorage` na chave `agenda-token`, que é preenchida pelo `AuthContext` após o exchange com `/api/auth/exchange`.
- Headers passados em `init.headers` são mesclados (não substituídos) com os headers padrão.
