import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { data: bookings, error } = await (db
      .from('bookings')
      .select('payment_status, price_original, price_client, platform_fee, mp_fee, paid_at, released_at, codigo_confirmacao, clients(nome), influencers(nome, username), services(tipo)') as any)

    if (error) throw error

    const rows: any[] = bookings || []

    // Volume total cobrado dos clientes (excluindo pendentes e cancelados)
    const volumeTotal = rows
      .filter((b) => !['PENDING_PAYMENT', 'CANCELLED'].includes(b.payment_status))
      .reduce((s, b) => s + Number(b.price_client || 0), 0)

    // Taxas MP pagas
    const taxasMP = rows
      .filter((b) => !['PENDING_PAYMENT', 'CANCELLED'].includes(b.payment_status))
      .reduce((s, b) => s + Number(b.mp_fee || 0), 0)

    // Em custódia (pagos mas não concluídos)
    const emCustodia = rows
      .filter((b) => ['PAID', 'IN_PROGRESS'].includes(b.payment_status))
      .reduce((s, b) => s + Number(b.price_client || 0), 0)

    // Valor a liberar p/ influenciadoras (custódia - o que influencer vai receber)
    const aLiberarInfluenciadoras = rows
      .filter((b) => ['PAID', 'IN_PROGRESS'].includes(b.payment_status))
      .reduce((s, b) => s + Number(b.price_original || 0), 0)

    // Já liberado p/ influenciadoras (concluídos)
    const liberadoInfluenciadoras = rows
      .filter((b) => b.payment_status === 'COMPLETED')
      .reduce((s, b) => s + Number(b.price_original || 0), 0)

    // Lucro confirmado (comissão plataforma de bookings concluídos)
    const lucroConfirmado = rows
      .filter((b) => b.payment_status === 'COMPLETED')
      .reduce((s, b) => s + Number(b.platform_fee || 0), 0)

    // Lucro pendente (comissão de bookings pagos mas não concluídos)
    const lucroPendente = rows
      .filter((b) => ['PAID', 'IN_PROGRESS'].includes(b.payment_status))
      .reduce((s, b) => s + Number(b.platform_fee || 0), 0)

    // Bookings concluídos com breakdown (para tabela)
    const concluidos = rows
      .filter((b) => b.payment_status === 'COMPLETED')
      .sort((a, b) => new Date(b.released_at || 0).getTime() - new Date(a.released_at || 0).getTime())

    // Bookings pagos aguardando conclusão
    const aguardando = rows
      .filter((b) => ['PAID', 'IN_PROGRESS'].includes(b.payment_status))
      .sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime())

    return NextResponse.json({
      resumo: {
        volumeTotal,
        taxasMP,
        emCustodia,
        aLiberarInfluenciadoras,
        liberadoInfluenciadoras,
        lucroConfirmado,
        lucroPendente,
        lucroTotal: lucroConfirmado + lucroPendente,
      },
      concluidos,
      aguardando,
    })
  } catch (e) {
    return apiError(e)
  }
}
