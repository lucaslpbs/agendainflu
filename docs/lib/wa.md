# wa.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/wa.ts`
> **Usado em:** `src/app/api/bookings/route.ts`, `src/app/api/bookings/[id]/status/route.ts`, `src/app/api/waitlist/route.ts`, `src/app/api/waitlist/[id]/status/route.ts`, `src/app/api/auth/register/influencer/route.ts`, `src/app/api/admin/influencers/[id]/approve/route.ts`, `src/app/api/admin/influencers/[id]/reject/route.ts`

## O que faz

Envia mensagens de texto via WhatsApp usando a Evolution API. É usado para notificações automáticas em eventos importantes: novo agendamento, confirmação, cancelamento, aprovação de influencer, aprovação/rejeição de lista de espera. Retorna `false` silenciosamente em caso de falha para não bloquear o fluxo principal.

## Funções exportadas

### `sendWhatsApp(number, text)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `number` | `string` | Número do destinatário (formato internacional, ex: `5511999999999`) |
| `text` | `string` | Texto da mensagem |

**Retorna:** `Promise<boolean>` — `true` se enviado com sucesso, `false` em caso de erro ou configuração ausente

**Exemplo:**
```typescript
await sendWhatsApp('5511999999999', 'Seu agendamento foi confirmado! Código: AI-2025-0001')
```

## Variáveis de ambiente necessárias

| Variável | Tipo | Descrição |
|---------|------|-----------|
| `EVOLUTION_API_URL` | `string` | URL base da Evolution API (ex: `https://evolution.seudominio.com`) |
| `EVOLUTION_INSTANCE` | `string` | Nome da instância criada na Evolution API |
| `EVOLUTION_API_KEY` | `string` | Chave de API para autenticação |

## Observações

- Se qualquer uma das três variáveis de ambiente estiver ausente, a função retorna `false` imediatamente sem tentar a requisição.
- Erros de rede ou HTTP são capturados pelo `try/catch` e logados via `console.error`, sem propagar a exceção.
- A função não valida o formato do número — garantir que o número está no formato correto antes de chamar.
- A Evolution API é compatível com WhatsApp via QR code (não é a API oficial da Meta).
