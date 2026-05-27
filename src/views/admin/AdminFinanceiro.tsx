'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/apiFetch"
import { AdminLayout } from "./AdminLayout"
import { toast } from "sonner"
import {
  TrendingUp, DollarSign, ArrowDownLeft, ArrowUpRight, Clock,
  CheckCircle2, CreditCard, Loader2, ExternalLink, Link2Off, ShieldCheck, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Resumo {
  volumeTotal: number
  taxasMP: number
  emCustodia: number
  aLiberarInfluenciadoras: number
  liberadoInfluenciadoras: number
  lucroConfirmado: number
  lucroPendente: number
  lucroTotal: number
}

interface MpConfig {
  mp_connected: boolean
  mp_user_id?: string
  mp_connected_at?: string
}

export const AdminFinanceiro = () => {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [concluidos, setConcluidos] = useState<any[]>([])
  const [aguardando, setAguardando] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"concluidos" | "aguardando">("aguardando")
  const [mpConfig, setMpConfig] = useState<MpConfig | null>(null)
  const [mpDisconnecting, setMpDisconnecting] = useState(false)
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([])
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const mp = searchParams.get('mp')
    if (mp === 'conectado') toast.success('Conta Mercado Pago conectada com sucesso!')
    if (mp === 'erro') {
      const reason = searchParams.get('reason')
      toast.error(`Falha ao conectar MP${reason ? `: ${reason}` : ''}`)
    }
  }, [searchParams])

  useEffect(() => {
    apiFetch("/api/admin/financeiro")
      .then((res) => {
        setResumo(res.resumo)
        setConcluidos(res.concluidos || [])
        setAguardando(res.aguardando || [])
      })
      .catch(() => toast.error("Erro ao carregar dados financeiros"))
      .finally(() => setLoading(false))

    apiFetch("/api/admin/mp-config")
      .then((res) => setMpConfig(res))
      .catch(() => {})

    apiFetch("/api/admin/pagamentos?status=AWAITING_TRANSFER&limit=100")
      .then((res: any) => setPendingTransfers(res.data || []))
      .catch(() => {})
  }, [])

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id)
    try {
      await apiFetch(`/api/admin/pagamentos/${id}/mark-paid`, { method: 'PATCH' })
      setPendingTransfers(prev => prev.filter(b => b.id !== id))
      toast.success('Pagamento marcado como realizado!')
    } catch {
      toast.error('Erro ao marcar pagamento')
    } finally {
      setMarkingPaid(null)
    }
  }

  const handleDisconnectMP = async () => {
    setMpDisconnecting(true)
    try {
      await apiFetch("/api/auth/mercadopago/admin/disconnect", { method: "POST" })
      setMpConfig({ mp_connected: false })
      toast.success("Conta Mercado Pago desconectada")
    } catch {
      toast.error("Erro ao desconectar")
    } finally {
      setMpDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Financeiro">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    )
  }

  const r = resumo!

  const cards = [
    {
      label: "Volume Total Cobrado",
      desc: "Total recebido dos clientes",
      value: r.volumeTotal,
      icon: CreditCard,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Taxas Mercado Pago",
      desc: "Deduções automáticas do MP",
      value: -r.taxasMP,
      icon: ArrowDownLeft,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Em Custódia",
      desc: "Pagos, aguardando conclusão",
      value: r.emCustodia,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
    {
      label: "A Liberar p/ Influenciadoras",
      desc: "Parte delas que está retida",
      value: r.aLiberarInfluenciadoras,
      icon: ArrowUpRight,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Liberado p/ Influenciadoras",
      desc: "Já transferido / pago",
      value: r.liberadoInfluenciadoras,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Meu Lucro Total",
      desc: `Confirmado: R$ ${r.lucroConfirmado.toFixed(2)} + Pendente: R$ ${r.lucroPendente.toFixed(2)}`,
      value: r.lucroTotal,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      highlight: true,
    },
  ]

  const tableRows = tab === "concluidos" ? concluidos : aguardando

  return (
    <AdminLayout title="Financeiro — Lucro & Pagamentos">
      <div className="space-y-6">
        {/* Pending manual transfers alert */}
        {pendingTransfers.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-5">
            <h3 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-4">
              <AlertTriangle size={18} />
              Pagamentos Pendentes de Transferência ({pendingTransfers.length})
            </h3>
            <div className="space-y-3">
              {pendingTransfers.map((b) => (
                <div key={b.id} className="bg-card rounded-lg border border-amber-500/30 p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{b.influencers?.nome || '—'}</span>
                      <span className="text-muted-foreground text-xs">@{b.influencers?.username || '—'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{b.codigo_confirmacao}</span>
                      <span>·</span>
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">
                        R$ {Number(b.price_original || 0).toFixed(2)}
                      </span>
                      {b.completed_at && (
                        <>
                          <span>·</span>
                          <span>Concluído {format(parseISO(b.completed_at), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={markingPaid === b.id}
                    onClick={() => handleMarkPaid(b.id)}
                  >
                    {markingPaid === b.id
                      ? <Loader2 size={14} className="animate-spin mr-1" />
                      : <CheckCircle2 size={14} className="mr-1" />}
                    Marcar como Pago
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MP Platform connection card */}
        <div className={`bg-card rounded-xl border p-5 flex items-center justify-between gap-4 ${mpConfig?.mp_connected ? "border-green-500/40" : "border-yellow-500/40"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${mpConfig?.mp_connected ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
              <ShieldCheck size={20} className={mpConfig?.mp_connected ? "text-green-500" : "text-yellow-600"} />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                Conta Marketplace (Plataforma)
                {mpConfig?.mp_connected && (
                  <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> Conectada
                  </span>
                )}
              </h3>
              {mpConfig?.mp_connected ? (
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono">{mpConfig.mp_user_id}</span>
                  {mpConfig.mp_connected_at && (
                    <> · Desde {new Date(mpConfig.mp_connected_at).toLocaleDateString("pt-BR")}</>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Conecte sua conta MP para receber a comissão da plataforma via split de pagamentos
                </p>
              )}
            </div>
          </div>
          {mpConfig?.mp_connected ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
              disabled={mpDisconnecting}
              onClick={handleDisconnectMP}
            >
              {mpDisconnecting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Link2Off size={14} className="mr-1" />}
              Desconectar
            </Button>
          ) : (
            <a href="/api/auth/mercadopago/admin/connect">
              <Button variant="hero" size="sm" className="shrink-0">
                <CreditCard size={14} className="mr-1.5" />
                Conectar MP
              </Button>
            </a>
          )}
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <DollarSign size={18} className="text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Como funciona o fluxo financeiro</p>
            <p className="text-muted-foreground mt-1">
              O cliente paga o valor total (serviço + 10%). Tudo entra na sua conta Mercado Pago.
              Quando o influenciador conclui o trabalho, o valor dele é marcado para transferência.
              <strong className="text-foreground"> Seu lucro</strong> = comissão de ~8% já disponível para saque no MP.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className={`bg-card rounded-xl border p-5 ${c.highlight ? "border-primary/40 shadow-sm shadow-primary/10" : "border-border"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${c.bg}`}>
                  <c.icon size={16} className={c.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{c.label}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${c.highlight ? "text-primary" : c.value < 0 ? "text-red-500" : c.color}`}>
                {c.value < 0 ? `-R$ ${Math.abs(c.value).toFixed(2)}` : `R$ ${c.value.toFixed(2)}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Lucro breakdown */}
        <div className="bg-card rounded-xl border border-primary/30 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Breakdown do Lucro
          </h3>
          <div className="space-y-3">
            {[
              { label: "Volume cobrado dos clientes", value: r.volumeTotal, sign: "+" },
              { label: "Taxas Mercado Pago", value: r.taxasMP, sign: "-" },
              { label: "Repasse às influenciadoras (concluído)", value: r.liberadoInfluenciadoras, sign: "-" },
              { label: "Repasse às influenciadoras (pendente)", value: r.aLiberarInfluenciadoras, sign: "-" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={row.sign === "-" ? "text-red-500" : "text-green-600"}>
                  {row.sign}R$ {row.value.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-semibold">= Meu Lucro Total</span>
              <span className="font-bold text-xl text-primary">R$ {r.lucroTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
            <p className="text-xs text-muted-foreground flex-1">
              O valor do seu lucro já está na sua conta Mercado Pago. Para sacar, acesse o painel do MP.
            </p>
            <Button size="sm" variant="outline" asChild>
              <a href="https://www.mercadopago.com.br/money-out" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} className="mr-1.5" /> Sacar no MP
              </a>
            </Button>
          </div>
        </div>

        {/* Tabs: aguardando / concluídos */}
        <div>
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={tab === "aguardando" ? "default" : "outline"}
              onClick={() => setTab("aguardando")}
            >
              <Clock size={13} className="mr-1.5" />
              Aguardando Conclusão ({aguardando.length})
            </Button>
            <Button
              size="sm"
              variant={tab === "concluidos" ? "default" : "outline"}
              onClick={() => setTab("concluidos")}
            >
              <CheckCircle2 size={13} className="mr-1.5" />
              Concluídos ({concluidos.length})
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 font-medium">Código</th>
                    <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                    <th className="text-left px-4 py-3 font-medium">Cliente</th>
                    <th className="text-right px-4 py-3 font-medium">Cobrado</th>
                    <th className="text-right px-4 py-3 font-medium">Taxa MP</th>
                    <th className="text-right px-4 py-3 font-medium">P/ Influencer</th>
                    <th className="text-right px-4 py-3 font-medium">Meu Lucro</th>
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                        Nenhum registro
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((b) => (
                      <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{b.codigo_confirmacao}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-muted-foreground text-xs">@</span>
                          {b.influencers?.username || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{b.clients?.nome || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                          R$ {Number(b.price_client || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-500 whitespace-nowrap">
                          -R$ {Number(b.mp_fee || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-500 whitespace-nowrap">
                          R$ {Number(b.price_original || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold whitespace-nowrap">
                          R$ {Number(b.platform_fee || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {b.released_at
                            ? format(parseISO(b.released_at), "dd/MM/yy HH:mm", { locale: ptBR })
                            : b.paid_at
                            ? format(parseISO(b.paid_at), "dd/MM/yy HH:mm", { locale: ptBR })
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {tableRows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-secondary/30">
                      <td colSpan={3} className="px-4 py-3 font-semibold text-sm">Total</td>
                      <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                        R$ {tableRows.reduce((s, b) => s + Number(b.price_client || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-500 font-bold whitespace-nowrap">
                        -R$ {tableRows.reduce((s, b) => s + Number(b.mp_fee || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-500 font-bold whitespace-nowrap">
                        R$ {tableRows.reduce((s, b) => s + Number(b.price_original || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-bold whitespace-nowrap">
                        R$ {tableRows.reduce((s, b) => s + Number(b.platform_fee || 0), 0).toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
