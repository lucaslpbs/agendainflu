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
  console.log('✅ Token encontrado, testando endpoint...')

  // Testa se o endpoint está disponível (sem fazer transferência real)
  const response = await fetch('https://api.mercadopago.com/v1/money-transfers', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.mp_access_token}`,
    },
  })

  console.log('Status HTTP:', response.status)
  const body = await response.json()
  console.log('Resposta MP:', JSON.stringify(body, null, 2))
}

testMoneyTransfer().catch(console.error)
