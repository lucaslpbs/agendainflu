import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, MessageCircle, Calendar } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import BookingDetailDialog from "@/components/panel/BookingDetailDialog";

type BookingWithRelations = Tables<"bookings"> & { clients: Tables<"clients"> | null; services: Tables<"services"> | null };

const AgendamentosPage = () => {
  const { influencer } = useAuth();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);

  const fetchBookings = async () => {
    if (!influencer) return;
    let q = supabase.from("bookings").select("*, clients(*), services(*)").eq("influencer_id", influencer.id).order("data_agendada", { ascending: true });
    if (statusFilter) q = q.eq("status", statusFilter as any);
    const { data } = await q;
    setBookings((data as any) || []);
  };

  useEffect(() => { fetchBookings(); }, [influencer, statusFilter]);

  const updateStatus = async (id: string, status: "confirmado" | "cancelado" | "concluido") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Agendamento ${status}!`);
    fetchBookings();
  };

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    const groups: Record<string, BookingWithRelations[]> = {};
    bookings.forEach((b) => {
      const date = b.data_agendada;
      if (!groups[date]) groups[date] = [];
      groups[date].push(b);
    });
    // Sort dates
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const getDateTag = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "bg-primary/15 text-primary";
    if (isPast(date)) return "bg-muted text-muted-foreground";
    return "bg-accent/15 text-accent";
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendente: "bg-accent/20 text-accent",
      confirmado: "bg-primary/20 text-primary",
      concluido: "bg-green-100 text-green-700",
      cancelado: "bg-destructive/20 text-destructive",
    };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || ""}`}>{status}</span>;
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-display">Agendamentos</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-input bg-background text-sm">
            <option value="">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        {groupedBookings.length > 0 ? (
          <div className="space-y-6">
            {groupedBookings.map(([date, dayBookings]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getDateTag(date)}`}>
                    <Calendar size={12} />
                    {getDateLabel(date)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dayBookings.length} agendamento{dayBookings.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Bookings for this date */}
                <div className="space-y-2 ml-2">
                  {dayBookings.map((b) => (
                    <div key={b.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-rosa transition-all cursor-pointer" onClick={() => setSelectedBooking(b)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground">{b.codigo_confirmacao}</span>
                            {statusBadge(b.status)}
                          </div>
                          <h3 className="font-semibold">{b.clients?.nome || "Cliente"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {b.services?.tipo || "Serviço"} • R$ {Number(b.services?.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          {b.descricao_produto && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{b.descricao_produto}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {b.status === "pendente" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => updateStatus(b.id, "confirmado")}>
                                <Check size={14} className="mr-1" /> Confirmar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "cancelado")}>
                                <X size={14} className="mr-1" /> Recusar
                              </Button>
                            </>
                          )}
                          {b.status === "confirmado" && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatus(b.id, "concluido")}>
                              <Check size={14} className="mr-1" /> Concluir
                            </Button>
                          )}
                          {b.clients?.whatsapp && (
                            <a href={`https://wa.me/${b.clients.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><MessageCircle size={14} /></Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        onUpdateStatus={updateStatus}
      />
    </PanelLayout>
  );
};

export default AgendamentosPage;
