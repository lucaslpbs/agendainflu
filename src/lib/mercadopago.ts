import { MercadoPagoConfig, Payment, Preference, PaymentRefund } from 'mercadopago'
import { db } from '@/lib/db'

if (!process.env.MP_MARKETPLACE_ACCESS_TOKEN && process.env.NODE_ENV === 'production') {
  throw new Error('MP_MARKETPLACE_ACCESS_TOKEN não configurado')
}

// Client da plataforma (marketplace) — para reembolsos e operações gerais
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_MARKETPLACE_ACCESS_TOKEN || '',
})

export const mpPayment = new Payment(mpClient)
export const mpPreference = new Preference(mpClient)
export const mpRefund = new PaymentRefund(mpClient)

export const isSandbox = process.env.MP_ENVIRONMENT !== 'production'

// Cria um cliente MP com o token do vendedor (influenciador) para split de pagamentos
export function mpClientForSeller(sellerAccessToken: string) {
  const client = new MercadoPagoConfig({ accessToken: sellerAccessToken })
  return {
    preference: new Preference(client),
  }
}

export function calcPrecos(precoOriginal: number) {
  const precoCliente = parseFloat((precoOriginal * 1.10).toFixed(2))
  const taxaMP = parseFloat((precoCliente * 0.02).toFixed(2))
  const comissaoPlataforma = parseFloat((precoCliente - taxaMP - precoOriginal).toFixed(2))
  return { precoCliente, taxaMP, comissaoPlataforma }
}

type AdminMpConfig = {
  mp_access_token: string | null
  mp_connected: boolean
  mp_user_id: string | null
}

export async function getAdminMpToken(): Promise<string> {
  const result = await db
    .from('platform_mp_config' as any)
    .select('mp_access_token, mp_connected, mp_user_id')
    .eq('id', true)
    .maybeSingle()
  const error = result.error
  const data = result.data as unknown as AdminMpConfig | null

  if (error) {
    console.error('[getAdminMpToken] Erro ao buscar config MP do admin:', error)
    throw new Error('Erro ao buscar configuração do Mercado Pago do admin')
  }
  if (!data) {
    throw new Error('Configuração do Mercado Pago do admin não encontrada')
  }
  if (!data.mp_connected) {
    throw new Error('Admin não está conectado ao Mercado Pago')
  }
  if (!data.mp_access_token) {
    throw new Error('Token de acesso do admin ao Mercado Pago não está configurado')
  }
  return data.mp_access_token
}

export async function transferToInfluencer(params: {
  influencerMpUserId: string
  amount: number
  bookingId: string
}): Promise<void> {
  const { influencerMpUserId, amount, bookingId } = params

  const adminResult = await db
    .from('platform_mp_config' as any)
    .select('mp_access_token, mp_user_id, mp_connected')
    .eq('id', true)
    .maybeSingle()
  const adminError = adminResult.error
  const adminConfig = adminResult.data as unknown as AdminMpConfig | null

  if (adminError || !adminConfig?.mp_connected || !adminConfig?.mp_access_token) {
    console.error('[transferToInfluencer] Admin MP não configurado:', adminError)
    throw new Error('Admin não está conectado ao Mercado Pago')
  }

  const adminToken = adminConfig.mp_access_token
  const adminMpUserId = adminConfig.mp_user_id as string

  const body = {
    payments: [
      {
        payment_method_id: 'account_money',
        transaction_amount: amount,
      },
    ],
    disbursements: [
      {
        collector_id: influencerMpUserId,
        amount,
        external_reference: `release-${bookingId}`,
      },
    ],
    payer: { id: adminMpUserId },
    external_reference: `release-booking-${bookingId}`,
    description: `Liberação agendamento ${bookingId}`,
  }

  const response = await fetch('https://api.mercadopago.com/v1/advanced_payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[transferToInfluencer] Falha na transferência MP:', errorBody)
    throw new Error(`Falha ao transferir para influenciadora via Mercado Pago: ${response.status}`)
  }
}
