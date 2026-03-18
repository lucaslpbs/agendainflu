# Página Inicial (Landing Page)

> **Status:** `Implementado`
> **Rota:** `/`
> **Auth:** `Pública`
> **Arquivo:** `src/app/page.tsx` → `src/views/Index.tsx`

## O que faz

Página de apresentação da plataforma AgendaInflu. Exibe a proposta de valor, lista influenciadoras em destaque, explica o funcionamento da plataforma e contém CTAs para cadastro e agendamento.

## O que o usuário vê

- Navbar com links de navegação e botão de login (ou painel se já autenticado)
- Hero Section com chamada principal e botões "Quero divulgar" e "Sou influenciadora"
- Seção "Como funciona" com os passos do processo
- Grade de influenciadoras em destaque (carregadas da API ou fallback mockado)
- Seção de FAQ
- Footer com links
- Botão flutuante de WhatsApp

## Dados carregados

| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/influencers?limit=8` | Ao montar o componente `FeaturedInfluencers` (client-side) |

## Ações disponíveis

| Ação | Destino | Resultado |
|------|---------|-----------|
| "Quero divulgar" | `/lista-espera` | Redireciona para o formulário de lista de espera |
| "Sou influenciadora" | `/cadastro-influenciadora` | Redireciona para o cadastro |
| "Ver perfil" (card da influencer) | `/[username]` | Abre o perfil público |
| "Entrar" (Navbar) | `/login` | Redireciona para o login |

## Componentes usados

- `Navbar`, `HeroSection`, `HowItWorks`, `FeaturedInfluencers`, `FAQ`, `Footer`, `WhatsAppButton`

## Proteção de rota

Nenhuma — página totalmente pública.
