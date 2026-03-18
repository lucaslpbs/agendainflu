# db.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/db.ts`
> **Usado em:** Todos os arquivos de API routes (`src/app/api/**/*.ts`)

## O que faz

Cria e exporta um cliente Supabase configurado com a `service_role` key, que bypassa as políticas de Row Level Security (RLS). Isso é necessário porque as API Routes do Next.js rodam no servidor e precisam de acesso privilegiado ao banco de dados, sem as restrições impostas às requisições de clientes.

## Funções exportadas

### `db`

Instância do cliente Supabase tipada com `Database` (gerado por `@/integrations/supabase/types`). Não é uma função, mas um objeto exportado diretamente.

**Configuração:**
- `autoRefreshToken: false` — evita refresh automático de sessão no servidor
- `persistSession: false` — não persiste sessão (desnecessário em servidor stateless)
- Usa `SUPABASE_SERVICE_ROLE_KEY` se disponível; cai para `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback

**Exemplo:**
```typescript
import { db } from '@/lib/db'

const { data, error } = await db
  .from('influencers')
  .select('*')
  .eq('status', 'ativa')
```

## Variáveis de ambiente necessárias

| Variável | Tipo | Descrição |
|---------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `string` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `string` | Chave service_role (bypassa RLS) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `string` | Chave anon (fallback se service_role não configurada) |

## Observações

- Se `SUPABASE_SERVICE_ROLE_KEY` não estiver configurada e `NODE_ENV !== 'test'`, emite um `console.warn` em vez de lançar erro — isso permite que a aplicação inicialize mesmo sem a chave, mas operações privilegiadas falharão em tempo de execução.
- Nunca usar o `db` no lado do cliente — ele carrega a service_role key que não deve ser exposta ao navegador.
