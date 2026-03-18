# FeaturedInfluencers.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/landing/FeaturedInfluencers.tsx`

## O que faz
Grid de influenciadoras em destaque na landing page. É o único componente da landing que faz uma query real ao Supabase — busca até 8 influenciadoras com status `ativa`. Cada card exibe foto, nome, nicho, contador de seguidores, avaliação (mockada em 5 estrelas) e botão "Ver Perfil".

## Como acessar / Como usar
```tsx
import FeaturedInfluencers from "@/components/landing/FeaturedInfluencers"
<FeaturedInfluencers />  // Usado em src/views/Index.tsx
```

## Estado atual (Lovable)
- Busca real no Supabase: `influencers` status `ativa`, limit 8
- Avaliação: **mockada** (5 estrelas fixas)
- Fallback: dados mockados se não houver influenciadoras cadastradas (`mockInfluencers` array local)
- Skeleton loader durante carregamento
- Link "Ver perfil" aponta para `/${inf.username}`

## O que ainda não está implementado
- Sistema de destaque (permitir que o admin marque quais aparecem)
- Avaliação real média calculada dos bookings concluídos
- Paginação ou "Ver mais"

## Chamadas de API existentes
1. `supabase.from("influencers").select("*").eq("status", "ativa").order("criado_em", desc).limit(8)`

## Dependências
- `src/integrations/supabase/client.ts`
- `next/link`
- `lucide-react` (Star, Users)

## Observações para o dev
Contém array `mockInfluencers` hardcoded como fallback (5 influenciadoras fictícias com `i.pravatar.cc`). Remover ou mover para fixture de desenvolvimento após ter dados reais suficientes.
