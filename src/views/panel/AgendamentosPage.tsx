'use client'

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useUpdateBookingStatus, useCompleteBooking } from "@/hooks/usePanelData";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, MessageCircle, Calendar, CheckCircle2, DollarSign, Clock } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import dynamic from 'next/dynamic'
const BookingDetailDialog = dynamic(() => import('@/components/panel/BookingDetailDialog'), { ssr: false })
import type { BookingWithRelations } from "@/hooks/usePanelData";
import { StatusBadge } from "@/components/ui/status-badge";

const PAYMENT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Aguard. pagamento', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PAID:            { label: 'Pago ✓', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  IN_PROGRESS:     { label: 'Em andamento', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED:       { label: 'Concluído', className: 'bg-primary/10 text-primary' },
  CANCELLED:       { label: 'Cancelado', className: 'bg-secondary text-muted-foreground' },
  DISPUTED:        { label: 'Em disputa', className: 'bg-red-100 text-red-800' },
}

const AgendamentosPage = () => {
  const { influencer } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const { data: bookings = [], isLoading } = useBookings(statusFilter ? { status: statusFilter } : undefined);
  const updateStatus = useUpdateBookingStatus();
  const completeBooking = useCompleteBooking();

  // Financial summary
  const saldoAReceber = bookings
    .filter((b) => (b as any).payment_status === 'PAID' || (b as any).payment_status === 'IN_PROGRESS')
    .reduce((sum, b) => sum + Number((b as any).price_original || (b as any).services?.preco || 0), 0);

  const saldoLiberado = bookings
    .filter((b) => (b as any).payment_status === 'COMPLETED')
    .reduce((sum, b) => sum + Number((b as any).price_original || (b as any).services?.preco || 0), 0);

  const handleUpdateStatus = async (id: string, status: "confirmado" | "cancelado" | "concluido") => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success('Agendamento ' + status + '!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeBooking.mutateAsync(id);
      toast.success('Divulgação marcada como concluída! Pagamento liberado.');
      setCompletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao concluir agendamento');
      setCompletingId(null);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Hoje";
    if (isTomorrow(d)) return "Amanhã";
    return format(d, "dd 'de' MMM", { locale: ptBR });
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Agendamentos</h2>
        </div>

        {/* Financial summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">A receber</p>
              <p className="font-bold text-sm">R$ {saldoAReceber.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Liberado</p>
              <p className="font-bold text-sm">R$ {saldoLiberado.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[{ value: "", label: "Todos" }, { value: "pendente", label: "Pendentes" }, { value: "confirmado", label: "Confirmados" }, { value: "concluido", label: "Concluídos" }, { value: "cancelado", label: "Cancelados" }].map((f) => (
            <Button key={f.value} variant={statusFilter === f.value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Calendar size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const isPastDate = isPast(parseISO(b.data_agendada));
              const paymentStatus = (b as any).payment_status as string | undefined;
              const canComplete = paymentStatus === 'PAID' || paymentStatus === 'IN_PROGRESS';
              const paymentBadge = paymentStatus ? PAYMENT_STATUS_LABELS[paymentStatus] : null;

              return (
                <div
                  key={b.id}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isPastDate ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                        {getDateLabel(b.data_agendada)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{b.clients?.nome || "Cliente"}</p>
                        <p className="text-xs text-muted-foreground">{b.services?.tipo} • {b.descricao_produto}</p>
                        {paymentBadge && (
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${paymentBadge.className}`}>
                            {paymentBadge.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
                      <p className="font-bold text-primary text-sm">R$ {Number(b.services?.preco || 0).toFixed(2)}</p>
                      <StatusBadge status={b.status} />

                      {/* Complete button — only for paid bookings */}
                      {canComplete && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => setCompletingId(b.id)}
                        >
                          <CheckCircle2 size={14} className="mr-1" /> Concluir
                        </Button>
                      )}

                      {b.status === "pendente" && !canComplete && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost"
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            onClick={() => handleUpdateStatus(b.id, "confirmado")}
                            title="Confirmar">
                            <Check size={16} />
                          </Button>
                          <Button size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => setCancelingId(b.id)}
                            title="Cancelar">
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                      {b.clients?.whatsapp && (
                        <a href={`https://wa.me/${b.clients.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Sobre o agendamento " + b.codigo_confirmacao)}`} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost" className="h-8 w-8"><MessageCircle size={16} /></Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Confirmar conclusão */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mx-4 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">Marcar como concluído?</h3>
            <p className="text-sm text-muted-foreground">
              Ao confirmar, a divulgação será marcada como concluída e o pagamento será
              liberado para a sua conta no Mercado Pago.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleComplete(completingId)}
                disabled={completeBooking.isPending}
              >
                {completeBooking.isPending ? 'Processando...' : 'Sim, concluir'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCompletingId(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar cancelamento */}
      {cancelingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mx-4 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">Cancelar agendamento?</h3>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja cancelar? Se o pagamento já foi efetuado, o estorno
              será iniciado automaticamente.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  handleUpdateStatus(cancelingId, "cancelado")
                  setCancelingId(null)
                }}
              >
                Sim, cancelar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCancelingId(null)}
              >
                Não, voltar
              </Button>
            </div>
          </div>
        </div>
      )}

      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        onUpdateStatus={handleUpdateStatus}
        onComplete={(id) => { setSelectedBooking(null); setCompletingId(id); }}
      />
    </PanelLayout>
  );
};

export default AgendamentosPage;
