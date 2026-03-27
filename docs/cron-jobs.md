# Cron Jobs

## Job: Atualização de Seguidores do Instagram

**Rota:** `POST /api/cron/update-followers`
**Schedule:** Todo dia às 06:00 UTC (`0 6 * * *`)

### O que faz

1. Busca todos os influencers com `instagram_connected = true`
2. Para cada influencer, chama a Graph API para obter `followers_count`
3. Atualiza `instagram_followers_count` e `instagram_followers_updated_at` no banco
4. Se o token estiver a menos de **10 dias** para expirar, renova automaticamente
5. Tokens expirados (erro 190) marcam o influencer como `instagram_connected = false`

### Autenticação

A rota é protegida pelo header `x-cron-secret`. Configure a variável de ambiente:

```env
CRON_SECRET=sua_chave_aleatoria_forte_aqui
```

---

## Configuração na Vercel

O arquivo `vercel.json` na raiz do projeto já configura o cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-followers",
      "schedule": "0 6 * * *"
    }
  ]
}
```

> **Nota:** Cron jobs na Vercel são disponíveis nos planos Pro e superiores.
> Na Vercel, o cron chama a rota com um token de autenticação interno — não é o `CRON_SECRET`.
> Para compatibilidade, defina `CRON_SECRET` como variável de ambiente na Vercel e a rota verifica este header quando presente.

---

## Configuração com servidor próprio (node-cron)

Se você rodar em servidor próprio em vez da Vercel:

```bash
npm install node-cron
```

```js
// scripts/cron.js
const cron = require('node-cron')

cron.schedule('0 6 * * *', async () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${appUrl}/api/cron/update-followers`, {
      method: 'POST',
      headers: { 'x-cron-secret': process.env.CRON_SECRET },
    })
    const data = await res.json()
    console.log(`[Cron] Seguidores atualizados: ${data.updated}/${data.total}`)
    if (data.errors?.length) console.warn('[Cron] Erros:', data.errors)
  } catch (err) {
    console.error('[Cron] Falha ao atualizar seguidores:', err)
  }
})
```

---

## Como testar manualmente

```bash
curl -X POST http://localhost:3000/api/cron/update-followers \
  -H "x-cron-secret: SUA_CRON_SECRET"
```

Resposta esperada:
```json
{
  "updated": 3,
  "total": 3,
  "errors": []
}
```

---

## Resposta da rota

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `updated` | number | Quantos influencers foram atualizados com sucesso |
| `total` | number | Total de influencers com Instagram conectado |
| `errors` | string[] | Lista de erros por influencer (formato: `{id}: {mensagem}`) |
