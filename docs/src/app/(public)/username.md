# (public)/[username]/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/(public)/[username]/page.tsx`

## O que faz
Perfil público da influenciadora em `/:username`. Exibe foto, nome, nicho, seguidores, links de Instagram, avaliação (mockada em 5 estrelas), estatísticas mockadas, feed Instagram mockado, lista de serviços disponíveis (preços visíveis apenas para logados) e depoimentos mockados.

## Como acessar / Como usar
`http://localhost:3000/[username]` — ex: `http://localhost:3000/ana123`

## Estado atual (Lovable)
- Busca influenciadora por username na tabela `influencers` (status `ativa`)
- Busca serviços ativos da influenciadora
- Verifica se usuário logado já é cliente (para mostrar status de relacionamento)
- Avaliação: **mockada** (sempre 5 estrelas)
- Estatísticas (campanhas, marcas, engajamento, satisfação): **mockadas**
- Depoimentos: **mockados** (3 fixos)
- Feed Instagram: **mockado** (6 imagens `picsum.photos`)
- Preços de serviços ocultos para não-logados

## O que ainda não está implementado
- Avaliações reais de clientes
- Estatísticas reais (campanhas via bookings concluídos)
- Feed Instagram real (Meta Graph API)
- Depoimentos reais
- SEO com metadata dinâmica por influenciadora

## Chamadas de API existentes
1. `supabase.from("influencers").select("*").eq("username", username).eq("status", "ativa")`
2. `supabase.from("services").select("*").eq("influencer_id", inf.id).eq("ativo", true)`
3. `supabase.from("clients").select("id").eq("influencer_id", inf.id).eq("user_id", user.id)` (se logado)

## Dependências
- `src/views/InfluencerProfile.tsx`
- `src/components/profile/InstagramFeed.tsx`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
Esta rota usa `useParams()` do `next/navigation` para ler o username. Como é rota catch-all dinâmica, qualquer slug não reconhecido cai aqui antes do `not-found`. Verificar se conflita com outras rotas estáticas.
