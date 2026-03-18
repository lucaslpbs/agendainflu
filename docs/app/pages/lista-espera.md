# Lista de Espera

> **Status:** `Implementado`
> **Rota:** `/lista-espera` e `/lista-espera/[username]`
> **Auth:** `Pública`
> **Arquivo:** `src/app/(public)/lista-espera/page.tsx` e `src/app/(public)/lista-espera/[username]/page.tsx` → `src/views/ListaEspera.tsx`

## O que faz

Formulário para leads que desejam divulgar com uma influenciadora mas ainda não são clientes aprovados. Quando acessado via `/lista-espera/[username]`, o formulário identifica automaticamente a influenciadora. Exibe tela de confirmação após submissão bem-sucedida.

## O que o usuário vê

- Navbar
- Título contextualizado (com ou sem nome da influenciadora)
- Campos: nome, WhatsApp, e-mail, empresa, mensagem
- Botão "Entrar na lista de espera"
- Tela de sucesso após envio
- Footer

## Dados carregados

| Fonte | Endpoint | Quando carrega |
|-------|----------|----------------|
| API | `GET /api/influencers/[username]` | Ao submeter (se `username` na URL) |

## Ações disponíveis

| Ação | Endpoint | Resultado |
|------|---------|-----------|
| Enviar formulário | `POST /api/waitlist` | Adiciona à lista de espera |

## Componentes usados

- `Navbar`, `Footer`, `Button` (shadcn)

## Proteção de rota

Nenhuma — página pública.

## Comportamentos especiais

- Se já for cliente ativo da influenciadora, a API retorna `{ redirect: 'booking' }` com mensagem "Você já pode agendar!"
- Se já estiver na lista de espera, exibe mensagem sem erro
