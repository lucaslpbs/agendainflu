'use client'

import { useEffect, useState, useCallback } from "react"
import { apiFetch } from "@/lib/apiFetch"
import { AdminLayout } from "./AdminLayout"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CreditCard, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

const PAYMENT_FILTERS = [
  { value: "ALL",             label: "Todos",         color: "default" },
  { value: "PENDING_PAYMENT", label: "Aguard. pag.",  color: "yellow" },
  { value: "PAID",            label: "Pago",          color: "green" },
  { value: "IN_PROGRESS",     label: "Em andamento",  color: "blue" },
  { value: "COMPLETED",       label: "Concluído",     color: "primary" },
  { value: "CANCELLED",       label: "Cancelado",     color: "muted" },
  { value: "DISPUTED",        label: "Em disputa",    color: "red" },
]

const STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID:            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  IN_PROGRESS:     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED:       "bg-primary/10 text-primary",
  CANCELLED:       "bg-secondary text-muted-foreground",
  DISPUTED:        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Aguard. pagamento",
  PAID:            "Pago ✓",
  IN_PROGRESS:     "Em andamento",
  COMPLETED:       "Concluído",
  CANCELLED:       "Cancelado",
  DISPUTED:        "Em disputa",
}

export const AdminPagamentos = () => {
  const [filter, setFilter] = useState("ALL")
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [releasingId, setReleasingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (filter !== "ALL") params.set("status", filter)
      const res = await apiFetch(`/api/admin/pagamentos?${params}`)
      setData(res.data || [])
      setTotal(res.total || 0)
    } catch {
      toast.error("Erro ao carregar pagamentos")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleRelease = async (bookingId: string) => {
    setReleasingId(bookingId)
    try {
      await apiFetch(`/api/bookings/${bookingId}/complete`, { method: "POST" })
      toast.success("Pagamento liberado para o influenciador!")
      load()
    } catch (e: any) {
      toast.error(e.message || "Erro ao liberar pagamento")
    } finally {
      setReleasingId(null)
    }
  }

  // Summary totals from current data
  const totals = data.reduce(
    (acc, b) => ({
      cobrado:    acc.cobrado + Number(b.price_client || 0),
      taxaMP:     acc.taxaMP + Number(b.mp_fee || 0),
      comissao:   acc.comissao + Number(b.platform_fee || 0),
      influencer: acc.influencer + Number(b.price_original || 0),
    }),
    { cobrado: 0, taxaMP: 0, comissao: 0, influencer: 0 },
  )

  return (
    <AdminLayout title="Pagamentos">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Cobrado", value: totals.cobrado, color: "text-primary" },
            { label: "Taxas MP", value: totals.taxaMP, color: "text-red-500" },
            { label: "Comissão Plataforma", value: totals.comissao, color: "text-green-600" },
            { label: "Part. Influenciadoras", value: totals.influencer, color: "text-blue-500" },
          ].map((c) => (
            <div key={c.label} className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>R$ {c.value.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={load}>
            <RefreshCw size={14} className="mr-1" /> Atualizar
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{total} registros encontrados</p>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Código</th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Influenciadora</th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Serviço</th>
                  <th className="text-right px-4 py-3 font-medium whitespace-nowrap">Cobrado</th>
                  <th className="text-right px-4 py-3 font-medium whitespace-nowrap">Taxa MP</th>
                  <th className="text-right px-4 py-3 font-medium whitespace-nowrap">Comissão</th>
                  <th className="text-right px-4 py-3 font-medium whitespace-nowrap">P/ Influencer</th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                      <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
                      Nenhum pagamento encontrado
                    </td>
                  </tr>
                ) : (
                  data.map((b) => {
                    const canRelease = b.payment_status === "PAID" || b.payment_status === "IN_PROGRESS"
                    return (
                      <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{b.codigo_confirmacao}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{b.clients?.nome || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-muted-foreground">@</span>{b.influencers?.username || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap capitalize">{b.services?.tipo || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                          {b.price_client ? `R$ ${Number(b.price_client).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-red-500 whitespace-nowrap">
                          {b.mp_fee ? `-R$ ${Number(b.mp_fee).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium whitespace-nowrap">
                          {b.platform_fee ? `R$ ${Number(b.platform_fee).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-500 whitespace-nowrap">
                          {b.price_original ? `R$ ${Number(b.price_original).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[b.payment_status] || "bg-secondary text-muted-foreground"}`}>
                            {STATUS_LABEL[b.payment_status] || b.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {b.paid_at
                            ? format(parseISO(b.paid_at), "dd/MM/yy HH:mm", { locale: ptBR })
                            : format(parseISO(b.created_at), "dd/MM/yy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {canRelease && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-green-600 hover:bg-green-700"
                              disabled={releasingId === b.id}
                              onClick={() => handleRelease(b.id)}
                            >
                              {releasingId === b.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <><CheckCircle2 size={12} className="mr-1" /> Liberar</>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
