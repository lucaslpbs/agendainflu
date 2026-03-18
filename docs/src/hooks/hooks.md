# Hooks Customizados

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `hook`
> **Caminho:** `src/hooks/`

---

## use-mobile.tsx

> **Caminho:** `src/hooks/use-mobile.tsx`

### O que faz
Hook que detecta se o dispositivo atual é mobile (largura < 768px). Usa `window.matchMedia` com listener de mudança para reagir a redimensionamento. Retorna `boolean`.

### Como usar
```tsx
import { useIsMobile } from "@/hooks/use-mobile"
const isMobile = useIsMobile()
```

### Estado atual
- Breakpoint fixo em 768px (corresponde ao `md:` do Tailwind)
- Usado em componentes do shadcn/ui (sidebar, drawer)

### Dependências
- `react` (useState, useEffect)

---

## use-toast.ts

> **Caminho:** `src/hooks/use-toast.ts`

### O que faz
Hook do sistema de toast do shadcn/ui. Gerencia fila de toasts com estado global via reducer. Expõe `toast()`, `dismiss()` e `toasts[]`. É o sistema legado de toast (shadcn) — o projeto também usa `sonner` diretamente.

### Como usar
```tsx
import { useToast } from "@/hooks/use-toast"
const { toast } = useToast()
toast({ title: "Sucesso!", description: "Operação concluída." })
```

### Estado atual
- Sistema shadcn/ui de toasts (via `src/components/ui/toaster.tsx`)
- Coexiste com `sonner` — o projeto usa ambos dependendo do componente
- Gerado pelo Lovable como parte do shadcn

### Observações para o dev
O projeto usa dois sistemas de toast: `sonner` (chamadas diretas `toast.success()` / `toast.error()`) e o toast do shadcn via `useToast`. Unificar em apenas um para consistência — recomendado manter `sonner` por ser mais simples.
