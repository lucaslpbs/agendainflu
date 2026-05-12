import crypto from 'crypto'

export function generateBookingCode(): string {
  const hex = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `AI-${hex}`
}
