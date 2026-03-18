# Navbar.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/landing/Navbar.tsx`

## O que faz
Barra de navegação principal do site, usada em todas as páginas públicas e de autenticação. Responsiva (menu hamburger em mobile). Detecta autenticação e role do usuário para mostrar links contextuais: não logado → Login/Cadastro, admin → "Admin", influencer → "Meu Painel", cliente → "Explorar" + "Meus Agendamentos". Fundo transparente que fica branco ao rolar (scroll detector).

## Como acessar / Como usar
```tsx
import Navbar from "@/components/landing/Navbar"
<Navbar />
```

## Estado atual (Lovable)
- Logo "AgendaInflu" com link para `/`
- Links de navegação: "Para Empresas", "Para Influenciadoras", "Como funciona"
- Detecção de auth via `useAuth()` com loading state
- Menu mobile com overlay
- Efeito de scroll: `bg-background/95 backdrop-blur shadow-sm` após 10px de scroll

## Props
Nenhuma prop — usa contexto interno.

## Dependências
- `src/contexts/AuthContext.tsx` (user, isAdmin, isInfluencer, signOut)
- `next/link`
- `lucide-react` (Menu, X)
- `src/components/ui/button.tsx`

## Observações para o dev
O scroll listener usa `window.addEventListener("scroll")` — adicionar cleanup no return do useEffect (já implementado). Links "Para Empresas" e "Para Influenciadoras" são âncoras internas da landing page — não funcionam em outras páginas que usam a Navbar.
