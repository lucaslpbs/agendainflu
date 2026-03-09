import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Lock, Unlock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

const CalendarioPage = () => {
  const { influencer } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Tables<"availability">[]>([]);
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);

  const fetchData = async () => {
    if (!influencer) return;
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const [avRes, bkRes] = await Promise.all([
      supabase.from("availability").select("*").eq("influencer_id", influencer.id).gte("data", start).lte("data", end),
      supabase.from("bookings").select("*").eq("influencer_id", influencer.id).gte("data_agendada", start).lte("data_agendada", end),
    ]);
    setAvailability(avRes.data || []);
    setBookings(bkRes.data || []);
  };

  useEffect(() => { fetchData(); }, [influencer, currentMonth]);

  const toggleAvailability = async (date: string) => {
    if (!influencer) return;
    const existing = availability.find((a) => a.data === date);
    if (existing) {
      if (existing.bloqueado) {
        await supabase.from("availability").update({ bloqueado: false }).eq("id", existing.id);
      } else {
        await supabase.from("availability").update({ bloqueado: true }).eq("id", existing.id);
      }
    } else {
      await supabase.from("availability").insert({ influencer_id: influencer.id, data: date, slots_disponiveis: 1 });
    }
    fetchData();
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();

  const getDayStatus = (date: string) => {
    const av = availability.find((a) => a.data === date);
    const bk = bookings.filter((b) => b.data_agendada === date);
    const hasConfirmed = bk.some((b) => b.status === "confirmado");
    const hasPending = bk.some((b) => b.status === "pendente");

    if (av?.bloqueado) return "blocked";
    if (hasConfirmed) return "booked";
    if (hasPending) return "pending";
    if (av) return "available";
    return "none";
  };

  const statusColors: Record<string, string> = {
    blocked: "bg-red-100 text-red-700 border-red-200",
    booked: "bg-muted text-muted-foreground border-border",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    available: "bg-green-100 text-green-700 border-green-200",
    none: "bg-card text-foreground border-border hover:bg-secondary",
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Calendário</h2>
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
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200" /> Disponível</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200" /> Pendente</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted" /> Agendado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200" /> Bloqueado</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
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
              return (
                <button
                  key={dateStr}
                  onClick={() => toggleAvailability(dateStr)}
                  className={`aspect-square rounded-lg border text-sm font-medium transition-colors ${statusColors[status]} ${isToday(day) ? "ring-2 ring-primary" : ""}`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Clique em um dia para alternar entre disponível e bloqueado.
        </p>
      </div>
    </PanelLayout>
  );
};

export default CalendarioPage;
