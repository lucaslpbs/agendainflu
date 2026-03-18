# utils.ts

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `lib`
> **Caminho:** `src/lib/utils.ts`

## O que faz
Arquivo de utilitários compartilhados. Atualmente contém apenas a função `cn()` — helper para mesclar classes Tailwind de forma inteligente, combinando `clsx` (condicional) e `tailwind-merge` (resolução de conflitos de classes Tailwind).

## Como acessar / Como usar
```ts
import { cn } from "@/lib/utils"
<div className={cn("base-class", isActive && "active-class", className)} />
```

## Estado atual (Lovable)
- Função `cn()`: `clsx` + `tailwind-merge`
- Usado extensivamente em todos os componentes shadcn/ui e customizados

## Dependências
- `clsx`
- `tailwind-merge`

## Observações para o dev
Este arquivo crescerá com o desenvolvimento. Adicionar aqui helpers de formatação de moeda (`formatBRL`), formatação de datas, formatação de WhatsApp, etc.
