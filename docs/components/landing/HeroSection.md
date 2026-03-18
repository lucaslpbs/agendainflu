# HeroSection

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/landing/HeroSection.tsx`
> **Client Component:** `sim`

## O que faz

Seção hero da landing page. Exibe imagem de fundo com overlay gradiente, título principal, subtítulo e dois botões de CTA: um para clientes que querem divulgar e outro para influenciadoras que desejam se cadastrar.

## Props

Nenhuma — componente sem props externas.

## Exemplo de uso

```tsx
<HeroSection />
```

## Comportamentos especiais

- **Background:** imagem local `src/assets/hero-bg.jpg` renderizada com `opacity-30` + gradiente `from-background/60 via-background/40 to-background` para legibilidade do texto.
- **Animações de entrada:** título, subtítulo e botões usam classe `animate-fade-in` com `animationDelay` progressivo (0s, 0.1s, 0.2s, 0.3s).
- **CTAs:**
  - "Quero divulgar" → `/lista-espera`
  - "Sou influenciadora" → `/cadastro-influenciadora`
- **Layout:** seção com `min-h-[90vh]`, conteúdo centralizado com `max-w-2xl`.

## Dependências

- `Button` (shadcn/ui)
- `Link` (Next.js)
- `hero-bg.jpg` (asset local)
