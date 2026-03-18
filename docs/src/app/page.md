# page.tsx (Landing)

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/page.tsx`

## O que faz
Página raiz da aplicação (`/`). Renderiza a landing page pública da plataforma AgendaInflu, composta por seções sequenciais: Navbar, Hero, Como Funciona, Influenciadoras em Destaque, FAQ, Footer e botão flutuante do WhatsApp.

## Como acessar / Como usar
Acessar `http://localhost:3000/` no browser. Thin wrapper que importa e renderiza `src/views/Index.tsx`.

## Estado atual (Lovable)
- Página estática com componentes landing
- `FeaturedInfluencers` busca dados reais do Supabase (tabela `influencers`, status `ativa`)
- Todo o restante é conteúdo estático/mockado
- Não requer autenticação

## O que ainda não está implementado
- SEO dinâmico (metadata por página)
- Internacionalização
- Analytics

## Chamadas de API existentes
Via `FeaturedInfluencers.tsx`: `supabase.from("influencers").select("*").eq("status", "ativa").limit(8)`

## Dependências
- `src/views/Index.tsx`
- Todos os componentes em `src/components/landing/`

## Observações para o dev
A página é server component no Next.js mas `Index.tsx` é `"use client"` via seus componentes filhos interativos (Navbar, FAQ accordion, etc).
