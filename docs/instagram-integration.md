# Instagram Integration — Meta Graph API OAuth

## Visão Geral

O sistema permite que influencers conectem sua conta do Instagram via OAuth da Meta. Após conectado:

- O feed real do Instagram é exibido na página pública do perfil (`/[username]`)
- A contagem de seguidores é atualizada automaticamente via cron job diário
- O token de acesso é renovado automaticamente antes de expirar

---

## Variáveis de Ambiente

```env
# Servidor (nunca expor ao browser)
META_APP_ID=              # App ID do seu app Meta
META_APP_SECRET=          # App Secret do seu app Meta
META_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
CRON_SECRET=              # Chave aleatória para autenticar o cron job

# Browser
NEXT_PUBLIC_META_APP_ID=  # Mesmo valor de META_APP_ID (usado futuramente no frontend)
```

---

## Configuração no Meta for Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um novo App (tipo: **Consumer** ou **Business**)
3. Em **Produtos**, adicione **Instagram Graph API**
4. Em **Configurações > Básico**, copie o **App ID** e **App Secret**
5. Em **Instagram > Configurações básicas**, adicione a URI de redirecionamento OAuth válida:
   - Desenvolvimento: `http://localhost:3000/api/auth/instagram/callback`
   - Produção: `https://seudominio.com/api/auth/instagram/callback`
6. Adicione os escopos necessários (ver abaixo)

### Escopos necessários

| Escopo | Para que serve |
|--------|---------------|
| `instagram_basic` | Acessar dados básicos do perfil (username, id) e mídia |
| `instagram_manage_insights` | Obter dados de insights incluindo `followers_count` |
| `pages_show_list` | Listar páginas do Facebook associadas (necessário para o fluxo OAuth) |

---

## Fluxo OAuth

```
1. Influencer clica "Conectar Instagram"
         ↓
2. GET /api/auth/instagram/connect
   → Redireciona para https://www.facebook.com/v19.0/dialog/oauth
         ↓
3. Usuário autoriza no Meta
         ↓
4. GET /api/auth/instagram/callback?code=...&state={influencer_id}
   → Troca code por short-lived token (Facebook)
   → Troca short-lived por long-lived token (Instagram, válido 60 dias)
   → Busca id, username, followers_count via /me
   → Salva no banco: instagram_user_id, instagram_access_token,
     instagram_token_expires_at, instagram_username,
     instagram_followers_count, instagram_connected=true
   → Redireciona para /painel/perfil?instagram=conectado
```

### Parâmetro `state`

O `state` contém o `influencer_id` do banco de dados. Isso é usado para:
1. Identificar qual influencer está conectando (sem exigir login ativo, pois o registro pode ser recente)
2. Proteção básica contra CSRF (vincula o callback a um influencer específico)

---

## Rotas de API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/auth/instagram/connect` | Inicia o fluxo OAuth |
| GET | `/api/auth/instagram/callback` | Callback da Meta, salva token |
| GET | `/api/instagram/feed?influencer_id={id}` | Retorna posts do feed (público) |
| POST | `/api/instagram/refresh-token` | Renova token do influencer logado |
| POST | `/api/cron/update-followers` | Job diário de atualização (protegido por CRON_SECRET) |

---

## Renovação de Tokens

- Tokens long-lived são válidos por **60 dias**
- O cron job diário (`/api/cron/update-followers`) renova automaticamente tokens com menos de **10 dias** para expirar
- Tokens expirados (erro código 190 da Graph API) marcam `instagram_connected = false` no banco

---

## Tratamento de Erros da Graph API

| Código | Significado | Ação |
|--------|-------------|------|
| 190 | Token expirado ou inválido | Marca `instagram_connected = false` |
| 200 | Permissão negada | Retorna `connected: false` na rota de feed |
| 4 / 17 | Rate limit | Log de erro, continua para próximo influencer no cron |

---

## Ambiente de Desenvolvimento

1. No painel da Meta, use `http://localhost:3000/api/auth/instagram/callback` como redirect URI
2. Adicione seu próprio usuário Instagram como "Tester" no app Meta (em **Funções > Testadores**)
3. O app precisa estar no modo de desenvolvimento para testar; em produção precisa de revisão da Meta para escopos avançados
