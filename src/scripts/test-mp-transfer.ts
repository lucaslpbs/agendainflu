import { db } from '@/lib/db'

async function testMoneyTransfer() {
  const result = await db
    .from('platform_mp_config' as any)
    .select('mp_access_token, mp_user_id, mp_connected')
    .eq('id', true)
    .maybeSingle()

  const config = result.data as any
  if (!config?.mp_access_token) {
    console.log('❌ Admin não está conectado ao MP')
    return
  }

  console.log('✅ Admin MP user_id:', config.mp_user_id)
  console.log('✅ Token encontrado')

  // Verifica saldo da conta admin
  console.log('\n--- Verificando saldo da conta admin ---')
  const balanceRes = await fetch(`https://api.mercadopago.com/v1/users/${config.mp_user_id}/mercadopago_account/balance`, {
    headers: { Authorization: `Bearer ${config.mp_access_token}` },
  })
  console.log('Status saldo:', balanceRes.status)
  console.log('Saldo:', JSON.stringify(await balanceRes.json(), null, 2))

  // Verifica se o endpoint /v1/transfers está acessível
  console.log('\n--- Testando endpoint /v1/transfers ---')
  const transfersRes = await fetch('https://api.mercadopago.com/v1/transfers', {
    method: 'GET',
    headers: { Authorization: `Bearer ${config.mp_access_token}` },
  })
  console.log('Status transfers endpoint:', transfersRes.status)
  console.log('Resposta:', JSON.stringify(await transfersRes.json(), null, 2))

  // Busca uma influenciadora com MP conectado para simular
  console.log('\n--- Buscando influenciadora com MP conectado ---')
  const { data: influencer } = await db
    .from('influencers' as any)
    .select('id, username, mp_user_id, mp_connected')
    .eq('mp_connected', true)
    .not('mp_user_id', 'is', null)
    .limit(1)
    .maybeSingle()

  if (!influencer) {
    console.log('⚠️ Nenhuma influenciadora com MP conectado encontrado para testar')
    return
  }

  console.log('Influenciadora para teste:', (influencer as any).username, '| MP user_id:', (influencer as any).mp_user_id)

  // Simula o body da transferência sem executar (dry-run visual)
  const body = {
    origin: { type: 'account', id: config.mp_user_id },
    destination: { type: 'account', id: (influencer as any).mp_user_id },
    amount: 1.00, // R$ 1,00 de teste
    currency_id: 'BRL',
    description: 'Teste de repasse AgendaInflu',
    external_reference: `test-transfer-${Date.now()}`,
  }

  console.log('\n--- Body que seria enviado na transferência ---')
  console.log(JSON.stringify(body, null, 2))

  // Descomente para executar a transferência real de R$ 1,00:
  // console.log('\n--- Executando transferência de R$ 1,00 ---')
  // const res = await fetch('https://api.mercadopago.com/v1/transfers', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.mp_access_token}` },
  //   body: JSON.stringify(body),
  // })
  // console.log('Status:', res.status)
  // console.log('Resposta:', JSON.stringify(await res.json(), null, 2))
}

testMoneyTransfer().catch(console.error)
