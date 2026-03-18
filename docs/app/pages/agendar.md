# Agendar Serviço

> **Status:** `Implementado`
> **Rota:** `/agendar/[username]`
> **Auth:** `Requer autenticação (cliente)`
> **Arquivo:** `src/app/(public)/agendar/[username]/page.tsx` → `src/views/AgendarServico.tsx`

## O que faz

Formulário de agendamento de serviço com uma influenciadora. O usuário seleciona o serviço desejado, a data disponível (próximos 14 dias, a partir de D+2), descreve o produto, faz upload de até 5 fotos do kit mídia (obrigatório para serviços online), e submete o agendamento. Exibe tela de sucesso com código de confirmação e link para WhatsApp.

## O que o usuário vê

- Navbar
- Aviso de "Primeiro agendamento — sujeito a aprovação" ou "Cliente aprovado — confirmação imediata"
- Seleção de serviço (cards com tipo, formato e preço)
- Grade de datas disponíveis (14 dias a partir de D+2)
- Campo de descrição do produto
- Upload de kit mídia (fotos/PDF, máx. 5 arquivos — apenas para serviços online)
- Campo de link do negócio
- Campo de observações
- Resumo do agendamento com total
- Botão "Enviar para aprovação" ou "Confirmar e Pagar"
- Tela de sucesso com código de confirmação e link para WhatsApp da influenciadora

## Dados carregados

| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| Supabase (direto) | `influencers` por `username` | Ao montar |
| Supabase (direto) | `services` por `influencer_id` | Após influencer |
| Supabase (direto) | `client_profiles` por `user_id` | Ao montar |
| Supabase (direto) | `clients` por `influencer_id + user_id` | Ao montar |

## Ações disponíveis

| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Upload de fotos | Supabase Storage `materials` | Armazena arquivos e obtém URLs |
| Submeter agendamento | `POST /api/bookings` | Cria agendamento e exibe código |

## Componentes usados

- `ProtectedLayout`, `Navbar`, `Footer`, `Button` (shadcn)

## Proteção de rota

`ProtectedLayout` envolve a página. Redirect para `/login` se não autenticado. Se não tiver `client_profile`, exibe tela pedindo para completar o cadastro em `/cadastro-cliente`.

## Comportamentos especiais

- O campo `?service={id}` na URL pré-seleciona um serviço
- Kit mídia (upload) só aparece para serviços com `formato = 'online'`
- Status do agendamento: `confirmado` se o cliente já é `ativo`, `pendente` se for novo
