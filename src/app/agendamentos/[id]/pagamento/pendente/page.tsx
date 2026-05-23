'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PagamentoPendentePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <Clock className="mx-auto text-yellow-500" size={64} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Pagamento em análise</h1>
          <p className="text-muted-foreground text-sm">
            Seu pagamento está sendo analisado. Assim que for aprovado, você receberá
            a confirmação e o influenciador será notificado.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/cliente/agendamentos">Ver meus agendamentos</Link>
        </Button>
      </div>
    </div>
  )
}
