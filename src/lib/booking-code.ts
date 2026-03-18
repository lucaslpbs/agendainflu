import { db } from './db'

export async function generateBookingCode(): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await db
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('data_agendada', `${year}-01-01`)
  const seq = String((count || 0) + 1).padStart(4, '0')
  return `AI-${year}-${seq}`
}
