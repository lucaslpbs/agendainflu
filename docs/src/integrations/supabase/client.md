# supabase/client.ts

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `lib`
> **Caminho:** `src/integrations/supabase/client.ts`

## O que faz
Instância única do cliente Supabase usada em todo o frontend. Criado com `createClient<Database>()` tipado pelo schema gerado. Configura persistência de sessão, auto-refresh de tokens e remove referência direta ao `localStorage` (compatível com SSR).

## Como acessar / Como usar
```ts
import { supabase } from "@/integrations/supabase/client"
const { data } = await supabase.from("influencers").select("*")
```

## Estado atual (Lovable)
- Usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `persistSession: true` — sessão salva no localStorage (padrão do Supabase)
- `autoRefreshToken: true` — renova token antes de expirar
- Tipagem completa via `Database` do `types.ts`

## O que ainda não está implementado
- Row Level Security (RLS) policies — verificar se estão ativas no projeto Supabase
- Service Role key para operações admin (deve ficar APENAS no servidor)

## Dependências
- `@supabase/supabase-js`
- `src/integrations/supabase/types.ts`
- `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Observações para o dev
Este arquivo usa a **anon key** — nunca usar a service_role key no frontend. Operações que requerem acesso privilegiado (ex: aprovar influenciadora) devem ser feitas via API Routes com a service_role key no servidor.
