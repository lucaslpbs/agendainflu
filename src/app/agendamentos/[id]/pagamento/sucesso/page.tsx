'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PagamentoSucessoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <CheckCircle2 className="mx-auto text-green-500" size={64} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Pagamento confirmado!</h1>
          <p className="text-muted-foreground text-sm">
            Seu agendamento foi pago com sucesso. O influenciador será notificado e a
            divulgação será realizada na data combinada.
          </p>
        </div>
        <div className="bg-muted rounded-xl p-4 text-sm text-left space-y-1">
          <p className="font-medium">Próximos passos:</p>
          <ul className="text-muted-foreground list-disc list-inside space-y-1">
            <li>Aguarde a confirmação do influenciador</li>
            <li>Acompanhe o status em Meus Agendamentos</li>
            <li>O pagamento fica em custódia até a conclusão</li>
          </ul>
        </div>
        <Button asChild className="w-full">
          <Link href="/cliente/agendamentos">Ver meus agendamentos</Link>
        </Button>
      </div>
    </div>
  )
}
