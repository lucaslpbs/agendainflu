# booking-code.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/booking-code.ts`
> **Usado em:** `src/app/api/bookings/route.ts`

## O que faz

Gera um código de confirmação único e legível para cada agendamento. O código tem formato `AI-AAAA-NNNN`, onde `AAAA` é o ano atual e `NNNN` é um número sequencial com 4 dígitos, baseado na contagem de agendamentos do ano corrente.

## Funções exportadas

### `generateBookingCode()`

**Params:** Nenhum

**Retorna:** `Promise<string>` — código no formato `AI-2025-0001`

**Exemplo:**
```typescript
const code = await generateBookingCode()
// Resultado: "AI-2025-0042" (se houver 41 agendamentos no ano)
```

## Variáveis de ambiente necessárias

Depende do cliente `db` (ver `src/lib/db.ts`).

## Observações

- A contagem é feita consultando todos os agendamentos do ano atual (filtro `data_agendada >= AAAA-01-01`) e incrementando em 1.
- Em caso de alta concorrência, pode haver duplicação de código se dois agendamentos forem criados simultaneamente. Para produção com alto volume, considerar uma sequence do PostgreSQL.
- O prefixo `AI` é fixo (sigla de AgendaInflu).
