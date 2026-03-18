# HeroSection.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/landing/HeroSection.tsx`

## O que faz
Seção hero da landing page. Título principal com gradiente rosa, subtítulo descritivo, dois CTAs (Lista de Espera e Cadastro de Influenciadora) e badges de credibilidade ("+500 Influenciadoras", "+2.000 Campanhas", "+98% Satisfação"). Background com gradiente e imagem decorativa.

## Como acessar / Como usar
```tsx
import HeroSection from "@/components/landing/HeroSection"
<HeroSection />  // Usado em src/views/Index.tsx
```

## Estado atual (Lovable)
- Conteúdo **100% estático**
- Números de credibilidade **mockados** (500 influenciadoras, 2.000 campanhas, 98% satisfação)
- CTAs linkam para `/lista-espera` e `/cadastro-influenciadora`
- Animação `animate-fade-in` via Tailwind custom keyframe

## O que ainda não está implementado
- Números reais de métricas (via query ao banco ou configuração admin)
- A/B testing de CTAs
- Video background opcional

## Props
Nenhuma.

## Dependências
- `next/link`
- `lucide-react` (ArrowRight, Sparkles, Star, Users)

## Observações para o dev
Os números de credibilidade devem ser parametrizáveis — considerar buscar de uma tabela `platform_stats` ou configuração no admin.
