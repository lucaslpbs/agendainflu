# InstagramFeed

> **Status:** `Implementado (mock)`
> **Tipo:** `componente`
> **Caminho:** `src/components/profile/InstagramFeed.tsx`
> **Client Component:** `não` (sem diretiva `'use client'`)

## O que faz

Exibe uma grade 2x3 com os posts do Instagram da influenciadora no perfil público. Atualmente usa dados mockados (6 imagens Unsplash com curtidas e comentários fictícios). Há um TODO no código para substituição futura pela Meta Graph API.

## Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `instagramUrl` | `string \| null` | Não | — | URL completa do Instagram (usada no link "Ver no Instagram") |
| `instagramHandle` | `string \| null` | Não | — | Handle sem `@` (fallback para montar URL caso `instagramUrl` não comece com `http`) |

## Exemplo de uso

```tsx
<InstagramFeed
  instagramUrl={influencer.instagram_url}
  instagramHandle={influencer.instagram}
/>
```

## Comportamentos especiais

- **Dados mockados:** os 6 posts são estáticos (`mockPosts`). A prop `instagramUrl` não afeta o conteúdo da grade — apenas controla o botão externo.
- **Botão "Ver no Instagram":** exibido apenas se `instagramUrl` estiver preenchido. Usa a URL direta se começar com `http`; caso contrário, constrói `https://instagram.com/{instagramHandle}`.
- **Overlay de hover:** ao passar o mouse sobre cada post, exibe curtidas e comentários com ícones preenchidos sobre um overlay semitransparente.
- **Formatação numérica:** valores >= 1000 são exibidos como `X.Xk` (ex.: `1.2k`).
- **Aviso ao usuário:** rodapé com `* Prévia do conteúdo. Visite o perfil no Instagram para ver todos os posts.`

## Pendências (TODO)

- Integrar com Meta Graph API (Instagram Basic Display API ou Instagram Graph API) para exibir posts reais da influenciadora autenticada.

## Dependências

- `Button` (shadcn/ui)
- `lucide-react`: `Instagram`, `Heart`, `MessageCircle`, `ExternalLink`
