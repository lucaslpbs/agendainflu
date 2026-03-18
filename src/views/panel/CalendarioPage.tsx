'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiFetch";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Lock, Unlock, CalendarCheck, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import BookingDetailDialog from "@/components/panel/BookingDetailDialog";

const CalendarioPage = () => {
  const { influencer } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Tables<"availability">[]>([]);
  const [bookings, setBookings] = useState<(Tables<"bookings"> & { clients: Tables<"clients"> | null; services: Tables<"services"> | null })[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSlots, setEditingSlots] = useState<number>(1);
  const [detailBooking, setDetailBooking] = useState<(Tables<"bookings"> & { clients: Tables<"clients"> | null; services: Tables<"services"> | null }) | null>(null);

  const fetchData = async () => {
    if (!influencer) return;
    const mes = format(currentMonth, "yyyy-MM");
    try {
      const [avData, bkData] = await Promise.all([
        apiFetch('/api/availability?mes=' + mes),
        apiFetch('/api/bookings?data_inicio=' + format(startOfMonth(currentMonth), "yyyy-MM-dd") + '&data_fim=' + format(endOfMonth(currentMonth), "yyyy-MM-dd")),
      ]);
      setAvailability(avData.data || []);
      setBookings((bkData.data as any) || []);
    } catch { }
  };

  useEffect(() => { fetchData(); }, [influencer, currentMonth]);

  const updateBookingStatus = async (id: string, status: "confirmado" | "cancelado" | "concluido") => {
    try {
      await apiFetch('/api/bookings/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success('Agendamento ' + status + '!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleBlock = async (date: string) => {
    const existing = availability.find((a) => a.data === date);
    try {
      await apiFetch('/api/availability', {
        method: 'POST',
        body: JSON.stringify({
          data: date,
          bloqueado: !existing?.bloqueado,
          slots_disponiveis: existing?.slots_disponiveis || 1,
        }),
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const saveSlots = async () => {
    if (!selectedDate) return;
    const existing = availability.find((a) => a.data === selectedDate);
    try {
      await apiFetch('/api/availability', {
        method: 'POST',
        body: JSON.stringify({
          data: selectedDate,
          bloqueado: existing?.bloqueado || false,
          slots_disponiveis: editingSlots,
        }),
      });
      toast.success("Limite atualizado!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const selectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    const av = availability.find((a) => a.data === dateStr);
    setEditingSlots(av?.slots_disponiveis || 1);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();

  const getDayStatus = (date: string) => {
    const av = availability.find((a) => a.data === date);
    const dayBookings = bookings.filter((b) => b.data_agendada === date);
    const hasConfirmed = dayBookings.some((b) => b.status === "confirmado");
    const hasPending = dayBookings.some((b) => b.status === "pendente");
    if (av?.bloqueado) return "blocked";
    if (hasConfirmed) return "booked";
    if (hasPending) return "pending";
    if (av && !av.bloqueado) return "available";
    return "none";
  };

  const getDayBookingCount = (date: string) => bookings.filter((b) => b.data_agendada === date && b.status !== "cancelado").length;

  const statusColors: Record<string, string> = {
    blocked: "bg-destructive/15 text-destructive border-destructive/30",
    booked: "bg-primary/15 text-primary border-primary/30",
    pending: "bg-accent/15 text-accent border-accent/30",
    available: "bg-green-100 text-green-700 border-green-300",
    none: "bg-card text-foreground border-border hover:bg-secondary",
  };

  const selectedBookings = selectedDate ? bookings.filter((b) => b.data_agendada === selectedDate) : [];
  const selectedAv = selectedDate ? availability.find((a) => a.data === selectedDate) : null;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendente: "bg-accent/20 text-accent",
      confirmado: "bg-primary/20 text-primary",
      concluido: "bg-green-100 text-green-700",
      cancelado: "bg-destructive/20 text-destructive",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || ""}`}>{status}</span>;
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display">Calendário</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={18} />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 text-xs flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" /> Disponível</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-accent" /> Pendente</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Agendado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-destructive" /> Bloqueado</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const status = getDayStatus(dateStr);
                const count = getDayBookingCount(dateStr);
                const isSelected = selectedDate === dateStr;
                const isPast = isBefore(day, startOfDay(new Date()));
                return (
                  <button
                    key={dateStr}
                    onClick={() => selectDay(dateStr)}
                    className={`relative aspect-square rounded-xl border text-sm font-medium transition-all ${statusColors[status]} ${isSelected ? "ring-2 ring-primary scale-105" : ""} ${isToday(day) ? "ring-2 ring-accent" : ""} ${isPast ? "opacity-50" : ""}`}
                  >
                    {format(day, "d")}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDate ? (
              <>
                <div className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold">
                      {format(new Date(selectedDate + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate(null)}>
                      <X size={14} />
                    </Button>
                  </div>

                  {/* Slots config */}
                  <div className="space-y-3 mb-4">
                    <label className="text-xs font-medium text-muted-foreground">Limite de agendamentos</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={editingSlots}
                        onChange={(e) => setEditingSlots(Number(e.target.value))}
                        className="w-20"
                      />
                      <Button size="sm" onClick={saveSlots}>Salvar</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getDayBookingCount(selectedDate)} / {selectedAv?.slots_disponiveis || editingSlots} agendamentos
                    </p>
                  </div>

                  {/* Block/Unblock */}
                  <Button
                    variant={selectedAv?.bloqueado ? "default" : "outline"}
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => toggleBlock(selectedDate)}
                  >
                    {selectedAv?.bloqueado ? <><Unlock size={14} /> Desbloquear dia</> : <><Lock size={14} /> Bloquear dia</>}
                  </Button>
                </div>

                {/* Day bookings */}
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <CalendarCheck size={16} className="text-primary" />
                    Agendamentos do dia
                  </h4>
                  {selectedBookings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedBookings.map((b) => (
                        <div key={b.id} className="p-3 rounded-xl bg-secondary/50 border border-border cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => setDetailBooking(b)}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{b.clients?.nome || "Cliente"}</span>
                            {statusBadge(b.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">{b.services?.tipo}</p>
                          {b.descricao_produto && <p className="text-xs text-muted-foreground mt-1">{b.descricao_produto}</p>}
                          <p className="text-xs font-semibold text-primary mt-1">
                            R$ {Number(b.services?.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <CalendarCheck size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Selecione um dia para ver detalhes e configurar limites</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingDetailDialog
        booking={detailBooking}
        open={!!detailBooking}
        onOpenChange={(open) => !open && setDetailBooking(null)}
        onUpdateStatus={updateBookingStatus}
      />
    </PanelLayout>
  );
};

export default CalendarioPage;
