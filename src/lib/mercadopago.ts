import { MercadoPagoConfig, Payment, Preference, PaymentRefund } from 'mercadopago'

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
