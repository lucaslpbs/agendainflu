# supabase/types.ts

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `lib`
> **Caminho:** `src/integrations/supabase/types.ts`

## O que faz
Tipos TypeScript auto-gerados pelo CLI do Supabase (`supabase gen types typescript`). Define a interface `Database` com todas as tabelas, enums e relacionamentos do banco. Usado para tipagem estática em todo o projeto via helper `Tables<"nome_da_tabela">`.

## Tabelas documentadas nos tipos
| Tabela | Campos principais | Observações |
|--------|------------------|-------------|
| `influencers` | id, user_id, username, nome, bio, foto_url, nicho, seguidores, instagram_url, whatsapp, status, criado_em, aprovado_em, observacoes_admin | status: `em_analise` \| `ativa` \| `suspensa` \| `rejeitada` |
| `services` | id, influencer_id, tipo, formato, preco, descricao, ativo, max_por_dia | tipo: `stories` \| `reels` \| `reels_stories` \| `feed` \| `presencial` |
| `bookings` | id, influencer_id, client_id, service_id, data_agendada, status, codigo_confirmacao, descricao_produto, link_negocio, observacoes, material_url | status: `pendente` \| `confirmado` \| `concluido` \| `cancelado` |
| `clients` | id, influencer_id, user_id, nome, email, whatsapp, empresa, status, origem | origem: `site` \| `manual` \| `waitlist` |
| `waitlist` | id, influencer_id, nome, whatsapp, email, empresa, mensagem, status, criado_em | status: `aguardando` \| `contatado` \| `aprovado` \| `rejeitado` |
| `user_roles` | user_id, role | role: `admin` \| `influencer` \| `client` |
| `availability` | id, influencer_id, data, bloqueado, max_bookings | |

## Tabelas usadas com `as any` (não tipadas)
- `client_profiles` — usada em `CadastroCliente.tsx` e `AgendarServico.tsx` com cast `as any`
- `influencer_analysis` — usada em `AdminPages.tsx` para registro de aprovações

## Dependências
Gerado pelo Supabase CLI — não editar manualmente.

## Observações para o dev
Regenerar após qualquer migração no banco: `npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts`. As tabelas `client_profiles` e `influencer_analysis` precisam ser adicionadas ao schema ou os tipos precisam ser gerados novamente.
