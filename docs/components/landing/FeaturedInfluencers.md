# FeaturedInfluencers

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/landing/FeaturedInfluencers.tsx`
> **Client Component:** `sim`

## O que faz

Seção da landing page que exibe uma grade com até 8 influenciadoras ativas em destaque. Busca os dados na API ao montar o componente. Se a requisição falhar ou retornar vazio, exibe um conjunto de influenciadoras mockadas como fallback.

## Props

Nenhuma — componente sem props externas.

## Exemplo de uso

```tsx
<FeaturedInfluencers />
```

## Dados carregados

| Fonte | Endpoint | Quando |
|-------|----------|--------|
| API | `GET /api/influencers?limit=8` | `useEffect` ao montar |

## Comportamentos especiais

- **Fallback mockado:** array `fallbackInfluencers` com 4 entradas (Unsplash) usado quando a API retorna lista vazia ou lança erro.
- **Avatar gerado:** se a influenciadora real não tiver `foto_url`, usa `https://ui-avatars.com/api/?name=...` com background rosa da marca.
- **Skeleton de carregamento:** enquanto `loading` for `true`, exibe 4 cards com `animate-pulse`.
- **Card:** imagem de 192px de altura com efeito `scale-105` no hover, badge com contagem de seguidores + ícone Instagram, botão "Ver perfil" → `/{username}`.
- **Animação de entrada:** cada card tem `animate-fade-in` com `animationDelay` de `i * 0.1s`.

## Dependências

- `Button`, `Link`
- `lucide-react`: `Star`, `Instagram`
- `GET /api/influencers`
