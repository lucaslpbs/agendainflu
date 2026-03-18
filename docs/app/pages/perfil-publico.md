# Perfil Público da Influenciadora

> **Status:** `Implementado`
> **Rota:** `/[username]`
> **Auth:** `Pública`
> **Arquivo:** `src/app/(public)/[username]/page.tsx` → `src/views/InfluencerProfile.tsx`

## O que faz

Página pública do perfil de uma influenciadora. Exibe foto, bio, nicho, seguidores, feed do Instagram (mockado), estatísticas, serviços disponíveis e depoimentos. Os preços dos serviços são ocultados para usuários não autenticados. O botão de agendamento redireciona para login se não autenticado.

## O que o usuário vê

- Navbar com estado de autenticação
- Banner hero com gradiente
- Card de perfil: foto, nome, badge "Verificada", nicho, seguidores, link Instagram, avaliação
- Botões: "Falar no WhatsApp" e "Agendar Serviço" (ou "Entrar para Agendar")
- Bio da influenciadora
- Grid de estatísticas (mockadas): campanhas realizadas, marcas, engajamento, satisfação
- Feed do Instagram (mockado com 6 posts do Unsplash)
- Grid de serviços com preços (visíveis apenas para autenticados)
- Depoimentos de clientes (mockados)
- CTA final para criar conta ou agendar

## Dados carregados

| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `influencers` por `username` | Ao montar |
| Supabase (direto) | `services` por `influencer_id` | Após carregar influencer |
| Supabase (direto) | `clients` por `user_id` + `influencer_id` | Se usuário autenticado |

## Ações disponíveis

| Ação | Destino | Resultado |
|------|---------|-----------|
| "Agendar Serviço" | `/agendar/[username]` | Redireciona (ou para `/login`) |
| "Falar no WhatsApp" | `https://wa.me/...` | Abre WhatsApp externo |
| "Agendar este serviço" (card) | `/agendar/[username]?service={id}` | Redireciona com serviço pré-selecionado |

## Componentes usados

- `Navbar`, `Footer`, `Button` (shadcn), `InstagramFeed`

## Proteção de rota

Nenhuma — página pública. Mas preços e botão de agendamento exigem autenticação.
