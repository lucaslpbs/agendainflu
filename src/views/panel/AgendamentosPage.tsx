'use client'

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useUpdateBookingStatus } from "@/hooks/usePanelData";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, MessageCircle, Calendar } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import BookingDetailDialog from "@/components/panel/BookingDetailDialog";
import type { BookingWithRelations } from "@/hooks/usePanelData";

const AgendamentosPage = () => {
  const { influencer } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);

  const { data: bookings = [], isLoading } = useBookings(statusFilter ? { status: statusFilter } : undefined);
  const updateStatus = useUpdateBookingStatus();

  const handleUpdateStatus = async (id: string, status: "confirmado" | "cancelado" | "concluido") => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success('Agendamento ' + status + '!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Hoje";
    if (isTomorrow(d)) return "Amanhã";
    return format(d, "dd 'de' MMM", { locale: ptBR });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendente: "bg-accent/20 text-accent",
      confirmado: "bg-primary/20 text-primary",
      concluido: "bg-green-100 text-green-700",
      cancelado: "bg-destructive/20 text-destructive",
    };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || "bg-secondary"}`}>{status}</span>;
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Agendamentos</h2>
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
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-primary text-sm">R$ {Number(b.services?.preco || 0).toFixed(2)}</p>
                      {statusBadge(b.status)}
                      {b.status === "pendente" && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handleUpdateStatus(b.id, "confirmado")} title="Confirmar">
                            <Check size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => handleUpdateStatus(b.id, "cancelado")} title="Cancelar">
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                      {b.clients?.whatsapp && (
                        <a href={`https://wa.me/${b.clients.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Sobre o agendamento " + b.codigo_confirmacao)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
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

      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </PanelLayout>
  );
};

export default AgendamentosPage;
