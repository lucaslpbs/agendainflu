# BookingDetailDialog

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/panel/BookingDetailDialog.tsx`
> **Client Component:** `não` (sem diretiva `'use client'`, renderizado pelo pai)

## O que faz

Dialog modal que exibe os detalhes completos de um agendamento selecionado no painel da influenciadora. Apresenta dados do cliente, serviço contratado, kit mídia/produto enviado, observações e botões de ação para transitar o status do agendamento.

## Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `booking` | `BookingWithRelations \| null` | Sim | — | Agendamento a exibir; se `null`, o componente retorna `null` |
| `open` | `boolean` | Sim | — | Controla visibilidade do dialog |
| `onOpenChange` | `(open: boolean) => void` | Sim | — | Callback de abertura/fechamento |
| `onUpdateStatus` | `(id: string, status: "confirmado" \| "cancelado" \| "concluido") => void` | Não | — | Callback chamado ao clicar nos botões de ação |

### Tipo `BookingWithRelations`

```ts
type BookingWithRelations = Tables<"bookings"> & {
  clients: Tables<"clients"> | null;
  services: Tables<"services"> | null;
};
```

## Exemplo de uso

```tsx
<BookingDetailDialog
  booking={selectedBooking}
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onUpdateStatus={handleStatusUpdate}
/>
```

## Seções exibidas

| Seção | Condição | Conteúdo |
|-------|----------|----------|
| Status | sempre | Badge colorido com status atual + badge "Pago" se `pagamento_confirmado` |
| Cliente | sempre | Nome, empresa, WhatsApp, email, link do Instagram |
| Serviço | sempre | Tipo, formato, data formatada (pt-BR), valor em R$ |
| Kit Mídia / Produto | se `descricao_produto`, `link_negocio` ou `material_url` preenchidos | Descrição, link externo, arquivos de material (split por vírgula) |
| Observações | se `observacoes` preenchido | Texto livre |
| Ações | conforme status | Botões de transição de status + link WhatsApp do cliente |

## Comportamentos especiais

- **Ações por status:**
  - `pendente` → botões "Confirmar" e "Recusar"
  - `confirmado` → botão "Concluir"
  - `concluido` / `cancelado` → sem botões de status
- **Botão WhatsApp:** exibido sempre que `clients.whatsapp` estiver preenchido; abre `https://wa.me/<numero>` removendo caracteres não numéricos.
- **Material URL:** suporta múltiplos arquivos separados por vírgula — cada um renderizado como link individual.
- **Data:** formatada com `date-fns` + locale `ptBR` no formato `dd 'de' MMMM 'de' yyyy`.
- **Chamada de `onUpdateStatus`:** fecha o dialog automaticamente após a chamada (`onOpenChange(false)`).
