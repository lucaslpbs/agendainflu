'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PagamentoErroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <XCircle className="mx-auto text-destructive" size={64} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Pagamento não aprovado</h1>
          <p className="text-muted-foreground text-sm">
            Seu pagamento não foi processado. Verifique os dados do cartão ou tente
            outro método de pagamento.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/cliente/agendamentos">Tentar novamente</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
