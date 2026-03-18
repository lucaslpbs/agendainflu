# PanelLayout

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/panel/PanelLayout.tsx`
> **Client Component:** `sim`

## O que faz

Layout principal do painel da influenciadora. Renderiza uma sidebar de navegação colapsável (mobile/desktop), header com nome da página atual e área de conteúdo principal. Inclui avatar e nome da influenciadora na parte inferior da sidebar, com botão de logout.

## Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `children` | `ReactNode` | Sim | — | Conteúdo da página |

## Exemplo de uso

```tsx
const Dashboard = () => {
  return (
    <PanelLayout>
      <div>Conteúdo do dashboard</div>
    </PanelLayout>
  )
}
```

## Comportamentos especiais

- **Sidebar responsiva:** em telas menores que `lg`, a sidebar é ocultada por padrão e aberta via botão hamburguer. Em `lg+`, é estática (sempre visível).
- **Overlay mobile:** ao abrir a sidebar no mobile, um overlay escuro é exibido. Clicar fora fecha a sidebar.
- **Item ativo:** o link correspondente ao pathname atual recebe estilo `bg-primary text-primary-foreground`.
- **Menu items:** Dashboard (`/painel`), Calendário, Agendamentos, Serviços, Clientes, Lista de Espera, Perfil.
- Usa `useAuth()` para exibir o nome e inicial da influenciadora e para fazer logout.
