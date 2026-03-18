# utils.ts

> **Status:** `Implementado`
> **Tipo:** `utilitário`
> **Caminho:** `src/lib/utils.ts`
> **Usado em:** Componentes de UI (`src/components/ui/**`)

## O que faz

Exporta a função utilitária `cn` para composição segura de classes CSS Tailwind. Combina `clsx` (lógica condicional de classes) com `tailwind-merge` (resolução de conflitos entre classes Tailwind).

## Funções exportadas

### `cn(...inputs)`

**Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `...inputs` | `ClassValue[]` | Classes CSS, objetos condicionais, arrays |

**Retorna:** `string` — string de classes CSS mescladas e sem conflitos

**Exemplo:**
```typescript
cn('px-4 py-2', isActive && 'bg-primary text-white', 'px-6')
// Resultado: "py-2 bg-primary text-white px-6"
// (px-4 foi substituído por px-6 pelo tailwind-merge)
```

## Variáveis de ambiente necessárias

Nenhuma.

## Observações

- Padrão de mercado para projetos com shadcn/ui.
- `tailwind-merge` é essencial para evitar conflitos de classes Tailwind (ex: `px-4` vs `px-6`).
