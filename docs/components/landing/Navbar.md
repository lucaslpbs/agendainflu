# Navbar

> **Status:** `Implementado`
> **Tipo:** `componente`
> **Caminho:** `src/components/landing/Navbar.tsx`
> **Client Component:** `sim`

## O que faz

Barra de navegação fixa no topo das páginas públicas (landing page, login, cadastros). Adapta seu conteúdo ao estado de autenticação do usuário: exibe links de cadastro e login quando não autenticado, ou botão de acesso ao painel e botão de logout quando autenticado. Possui versão desktop (inline) e menu hamburguer para mobile.

## Props

Nenhuma — componente sem props externas.

## Exemplo de uso

```tsx
<Navbar />
```

## Comportamentos especiais

- **Adaptação ao role:** usa `useAuth()` para determinar o link e label do painel:
  - `admin` → `/admin` / "Admin"
  - `influencer` → `/painel` / "Meu Painel"
  - `client` (padrão) → `/cliente` / "Minha Conta"
- **Estado de carregamento:** enquanto `loading` for `true`, os botões de autenticação ficam ocultos para evitar flash de conteúdo.
- **Menu mobile:** toggle hamburguer (`Menu`/`X`), menu dropdown animado com `animate-fade-in`. Clicar em qualquer link fecha o menu (`setIsOpen(false)`).
- **Posicionamento:** `fixed top-0 left-0 right-0 z-50` com `backdrop-blur-md`, garantindo visibilidade sobre o conteúdo da página.

## Dependências

- `useAuth()` — `AuthContext`
- `Button` (shadcn/ui)
- `Link` (Next.js)
- `lucide-react`: `Menu`, `X`, `LogOut`
