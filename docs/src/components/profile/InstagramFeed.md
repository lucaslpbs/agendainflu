# InstagramFeed.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/profile/InstagramFeed.tsx`

## O que faz
Exibe um grid de 6 posts "do Instagram" no perfil público da influenciadora. Atualmente é **100% mockado** com imagens do `picsum.photos` e dados fictícios de likes e comentários. Inclui efeito hover com overlay de estatísticas e link para o perfil real do Instagram.

## Como acessar / Como usar
```tsx
import InstagramFeed from "@/components/profile/InstagramFeed"
<InstagramFeed instagramUrl={influencer.instagram_url} instagramHandle={instagramHandle} />
```

## Estado atual (Lovable)
- 6 posts **mockados** com IDs aleatórios do picsum.photos
- Likes e comentários gerados randomicamente
- Link para perfil real do Instagram (se `instagramUrl` fornecido)
- Exibe handle `@username` no header da seção
- Comentário no código: `// TODO: Future integration with Meta Graph API`

## O que ainda não está implementado
- **Integração real com Meta Graph API** (Instagram Basic Display API)
- Cache das fotos reais
- Carregamento lazy das imagens

## Props
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| instagramUrl | `string \| null` | Não | URL completa do perfil Instagram |
| instagramHandle | `string \| null` | Não | Handle sem @ (ex: "anasantos") |

## Chamadas de API existentes
Nenhuma — dados completamente mockados.

## Dependências
- `lucide-react` (Instagram, Heart, MessageCircle)

## Observações para o dev
Para a Meta Graph API, precisar de: App ID + Secret no Meta Developer, OAuth token de longa duração da influenciadora, permissão `instagram_basic`. Considerar usar webhooks para atualizar cache de posts quando influenciadora publicar. Armazenar tokens no Supabase com campo de expiração.
