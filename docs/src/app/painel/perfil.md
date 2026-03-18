# painel/perfil/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/perfil/page.tsx`

## O que faz
Edição do perfil público da influenciadora em `/painel/perfil`. Permite alterar foto (upload para Supabase Storage), nome, bio, nicho, seguidores, Instagram e WhatsApp. Exibe o status atual do perfil (em_analise / ativa / suspensa / rejeitada) e o link público do perfil.

## Como acessar / Como usar
`http://localhost:3000/painel/perfil`

## Estado atual (Lovable)
- Pré-popula formulário com dados do `influencer` do `AuthContext`
- Upload de nova foto para bucket `avatars` (substitui avatar anterior)
- Atualiza tabela `influencers` e chama `refreshInfluencer()` do context
- Status exibido com badge colorido

## O que ainda não está implementado
- Validação de formato de Instagram (deve ser handle, não URL completa)
- Preview do perfil público antes de salvar
- Histórico de alterações
- Remoção de foto (voltar para inicial com letra)

## Chamadas de API existentes
1. `supabase.storage.from("avatars").upload(path, file, { upsert: true })` — troca de foto
2. `supabase.from("influencers").update({...}).eq("id", influencer.id)` — salvar perfil

## Dependências
- `src/views/panel/PerfilPage.tsx`
- `src/components/panel/PanelLayout.tsx`
- `src/contexts/AuthContext.tsx` (influencer + refreshInfluencer)

## Observações para o dev
`refreshInfluencer()` faz uma nova query ao Supabase para atualizar o context. O link público exibido é `${window.location.origin}/${influencer.username}` — no Next.js, `window.location` não está disponível no server render. Usar `NEXT_PUBLIC_APP_URL` env var.
