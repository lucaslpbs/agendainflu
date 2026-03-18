# painel/servicos/page.tsx

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `page`
> **Caminho:** `src/app/painel/servicos/page.tsx`

## O que faz
CRUD completo de serviços da influenciadora em `/painel/servicos`. Permite criar, editar, ativar/desativar e excluir serviços. Cada serviço tem tipo (Stories, Reels, Reels+Stories, Feed, Presencial), formato (online/presencial), preço, descrição e limite diário de agendamentos.

## Como acessar / Como usar
`http://localhost:3000/painel/servicos`

## Estado atual (Lovable)
- CRUD completo com dados reais do Supabase
- Toggle ativo/inativo via switch
- Formulário inline de criação/edição
- Exclusão com confirmação de botão
- Ordenado por criação (mais recentes primeiro)

## O que ainda não está implementado
- Validação de preço mínimo/máximo
- Duplicar serviço existente
- Preview de como o serviço aparece no perfil público
- Imagem/thumbnail por serviço

## Chamadas de API existentes
1. `supabase.from("services").select("*").eq("influencer_id", influencer.id).order("criado_em", desc)`
2. `supabase.from("services").insert({...})` — criar serviço
3. `supabase.from("services").update({...}).eq("id", id)` — editar
4. `supabase.from("services").delete().eq("id", id)` — excluir

## Dependências
- `src/views/panel/ServicosPage.tsx`
- `src/components/panel/PanelLayout.tsx`
- `src/contexts/AuthContext.tsx`

## Observações para o dev
O campo `max_por_dia` é armazenado na tabela `services` mas o calendário usa `availability.max_bookings` — verificar qual é a fonte de verdade para limite diário. Possível inconsistência de dados.
