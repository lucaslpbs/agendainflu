'use client'

import { ProtectedLayout } from '@/components/ProtectedLayout'
import AgendarServico from '@/views/AgendarServico'

export default function AgendarServicoPage() {
  return (
    <ProtectedLayout>
      <AgendarServico />
    </ProtectedLayout>
  )
}
