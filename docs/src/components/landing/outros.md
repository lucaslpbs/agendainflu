# Componentes Landing — HowItWorks, FAQ, Footer, WhatsAppButton

> **Status:** `LOVABLE — aguardando implementação real`
> **Tipo:** `component`
> **Caminho:** `src/components/landing/`

---

## HowItWorks.tsx

> **Caminho:** `src/components/landing/HowItWorks.tsx`

### O que faz
Seção "Como Funciona" da landing page. Explica o processo em 3 passos para empresas e 3 passos para influenciadoras, com ícones e numeração. Conteúdo 100% estático.

### Estado atual
- Conteúdo estático mockado
- Usa grid responsivo Tailwind
- Sem interatividade

### Observações
Nenhuma chamada de API. Pode ser Server Component puro.

---

## FAQ.tsx

> **Caminho:** `src/components/landing/FAQ.tsx`

### O que faz
Seção de Perguntas Frequentes com Accordion (shadcn/ui). Lista 7 perguntas fixas sobre a plataforma. Conteúdo 100% estático.

### Estado atual
- 7 FAQs hardcoded em array
- Usa `Accordion` do shadcn/ui (radix-ui)
- Sem carregamento de dados

### O que ainda não está implementado
- FAQs editáveis via painel admin
- Busca nas perguntas

---

## Footer.tsx

> **Caminho:** `src/components/landing/Footer.tsx`

### O que faz
Rodapé do site com logo, links de navegação (Para Empresas, Para Influenciadoras, Como Funciona, FAQ), links de social media (Instagram, Twitter) e copyright. Conteúdo 100% estático.

### Estado atual
- Links sociais apontam para `#` (placeholders)
- Copyright usa `new Date().getFullYear()` (dinâmico)
- Usa `next/link` para navegação interna

### O que ainda não está implementado
- Links reais de redes sociais
- Política de Privacidade e Termos de Uso
- Newsletter signup

---

## WhatsAppButton.tsx

> **Caminho:** `src/components/landing/WhatsAppButton.tsx`

### O que faz
Botão flutuante fixo do WhatsApp exibido em todas as páginas públicas. Fica no canto inferior direito. Ao clicar, abre conversa WhatsApp com número configurado.

### Estado atual
- Número WhatsApp **hardcoded** no componente: `+55 85 9 9999-0000` (placeholder)
- Ícone personalizado SVG do WhatsApp
- Animação `animate-float` (sobe e desce)
- Link `wa.me/` com mensagem pré-definida em português

### O que ainda não está implementado
- Número configurável via variável de ambiente ou painel admin
- Tracking de cliques (analytics)

### Observações para o dev
Trocar o número hardcoded pela variável `NEXT_PUBLIC_WHATSAPP_SUPPORT` ou ler de uma configuração no banco.
