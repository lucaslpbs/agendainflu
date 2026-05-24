'use client'

import { useState } from "react"
import { useBookings, useCompleteBooking } from "@/hooks/usePanelData"
import PanelLayout from "@/components/panel/PanelLayout"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  DollarSign, Clock, CheckCircle2, TrendingUp, Loader2, Calendar
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export const FinanceiroPage = () => {
  const { data: bookings = [], isLoading } = useBookings()
  const completeBooking = useCompleteBooking()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // Financial groupings
  const aReceber = bookings.filter(
    (b) => (b as any).payment_status === "PAID" || (b as any).payment_status === "IN_PROGRESS",
  )
  const liberados = bookings.filter((b) => (b as any).payment_status === "COMPLETED")
  const cancelados = bookings.filter((b) => (b as any).payment_status === "CANCELLED")

  const totalAReceber = aReceber.reduce((s, b) => s + Number((b as any).price_original || (b as any).services?.preco || 0), 0)
  const totalLiberado = liberados.reduce((s, b) => s + Number((b as any).price_original || (b as any).services?.preco || 0), 0)
  const totalGeral = totalAReceber + totalLiberado

  const handleComplete = async (id: string) => {
    setCompletingId(id)
    try {
      await completeBooking.mutateAsync(id)
      toast.success("Valor liberado com sucesso!")
      setConfirmId(null)
    } catch (e: any) {
      toast.error(e.message || "Erro ao liberar valor")
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Financeiro</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe os valores a receber e já liberados dos seus agendamentos
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-yellow-500/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">A Receber</p>
                <p className="text-xs text-muted-foreground">{aReceber.length} agendamento{aReceber.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-600">R$ {totalAReceber.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Aguardando conclusão</p>
          </div>

          <div className="bg-card rounded-xl border border-green-500/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Liberado</p>
                <p className="text-xs text-muted-foreground">{liberados.length} agendamento{liberados.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">R$ {totalLiberado.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Trabalho concluído</p>
          </div>

          <div className="bg-card rounded-xl border border-primary/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Acumulado</p>
                <p className="text-xs text-muted-foreground">{aReceber.length + liberados.length} agendamentos</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">R$ {totalGeral.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Soma de todos os períodos</p>
          </div>
        </div>

        {/* A Receber — com botão de liberar */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock size={15} className="text-yellow-600" />
            Valores a Receber
            {aReceber.length > 0 && (
              <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                {aReceber.length}
              </span>
            )}
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />)}
            </div>
          ) : aReceber.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <DollarSign size={32} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum valor pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aReceber.map((b) => {
                const valor = Number((b as any).price_original || (b as any).services?.preco || 0)
                return (
                  <div
                    key={b.id}
                    className="bg-card rounded-xl border border-yellow-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{b.clients?.nome || "Cliente"}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {b.services?.tipo} • {b.data_agendada ? format(parseISO(b.data_agendada), "dd 'de' MMM", { locale: ptBR }) : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">Cód: {b.codigo_confirmacao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                      <p className="font-bold text-lg text-yellow-600">R$ {valor.toFixed(2)}</p>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                        onClick={() => setConfirmId(b.id)}
                        disabled={completingId === b.id}
                      >
                        {completingId === b.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <><CheckCircle2 size={13} className="mr-1" /> Liberar valor</>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Liberados */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-600" />
            Valores Liberados
            {liberados.length > 0 && (
              <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                {liberados.length}
              </span>
            )}
          </h3>

          {isLoading ? (
            <div className="h-20 bg-card rounded-xl border border-border animate-pulse" />
          ) : liberados.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum valor liberado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liberados.map((b) => {
                const valor = Number((b as any).price_original || (b as any).services?.preco || 0)
                return (
                  <div
                    key={b.id}
                    className="bg-card rounded-xl border border-green-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{b.clients?.nome || "Cliente"}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {b.services?.tipo} • {(b as any).released_at ? format(parseISO((b as any).released_at), "dd 'de' MMM yyyy", { locale: ptBR }) : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">Cód: {b.codigo_confirmacao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full font-medium">
                        Concluído
                      </span>
                      <p className="font-bold text-lg text-green-600">R$ {valor.toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mx-4 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">Marcar divulgação como concluída?</h3>
            <p className="text-sm text-muted-foreground">
              Confirme que a divulgação foi realizada. O valor será liberado e o agendamento marcado como concluído.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleComplete(confirmId)}
                disabled={!!completingId}
              >
                {completingId ? <Loader2 size={15} className="animate-spin mr-1" /> : null}
                Confirmar
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setConfirmId(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  )
}
