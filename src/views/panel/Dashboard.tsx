'use client'

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useClients, useWaitlist } from "@/hooks/usePanelData";
import PanelLayout from "@/components/panel/PanelLayout";
import { CalendarCheck, Users, Clock, ClipboardList, TrendingUp, DollarSign, BarChart3, ArrowUpRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, eachDayOfInterval, isToday, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { influencer } = useAuth();
  const [dailyViewMonth, setDailyViewMonth] = useState(new Date());

  const { data: allBookings = [] } = useBookings();
  const { data: clients = [] } = useClients();
  const { data: waitlistItems = [] } = useWaitlist();

  const stats = useMemo(() => ({
    bookings: allBookings.length,
    pending: allBookings.filter(b => b.status === "pendente").length,
    clients: clients.filter(c => c.status === "ativo").length,
    waitlist: waitlistItems.filter(w => w.status === "aguardando").length,
  }), [allBookings, clients, waitlistItems]);

  const revenue = useMemo(() =>
    allBookings
      .filter(b => b.status === "concluido" || b.status === "confirmado")
      .reduce((sum, b) => sum + (b.services?.preco || 0), 0),
    [allBookings]
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) });
    return months.map(m => {
      const key = format(m, "yyyy-MM");
      const mb = allBookings.filter(b => b.data_agendada?.startsWith(key));
      return {
        month: format(m, "MMM", { locale: ptBR }),
        agendamentos: mb.length,
        receita: mb.filter(b => b.status === "concluido" || b.status === "confirmado").reduce((s, b) => s + (b.services?.preco || 0), 0),
      };
    });
  }, [allBookings]);

  const statusData = useMemo(() => [
    { name: "Pendentes", value: allBookings.filter(b => b.status === "pendente").length, color: "hsl(43, 89%, 38%)" },
    { name: "Confirmados", value: allBookings.filter(b => b.status === "confirmado").length, color: "hsl(340, 82%, 43%)" },
    { name: "Concluídos", value: allBookings.filter(b => b.status === "concluido").length, color: "hsl(150, 60%, 40%)" },
    { name: "Cancelados", value: allBookings.filter(b => b.status === "cancelado").length, color: "hsl(0, 84%, 60%)" },
  ].filter(d => d.value > 0), [allBookings]);

  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(dailyViewMonth), end: endOfMonth(dailyViewMonth) });
    return days.map(d => {
      const key = format(d, "yyyy-MM-dd");
      const dayBookings = allBookings.filter(b => b.data_agendada === key);
      const dayRevenue = dayBookings
        .filter(b => b.status === "concluido" || b.status === "confirmado")
        .reduce((s, b) => s + (b.services?.preco || 0), 0);
      return { dia: format(d, "dd"), date: d, agendamentos: dayBookings.length, receita: dayRevenue, bookings: dayBookings };
    });
  }, [allBookings, dailyViewMonth]);

  const dailyMonthRevenue = useMemo(() => dailyData.reduce((s, d) => s + d.receita, 0), [dailyData]);
  const dailyMonthBookings = useMemo(() => dailyData.reduce((s, d) => s + d.agendamentos, 0), [dailyData]);
  const recentBookings = allBookings.slice(0, 5);

  const cards = [
    { label: "Total Agendamentos", value: stats.bookings, icon: CalendarCheck, gradient: "gradient-rosa", iconColor: "text-primary-foreground" },
    { label: "Pendentes", value: stats.pending, icon: ClipboardList, gradient: "bg-accent", iconColor: "text-accent-foreground" },
    { label: "Clientes Ativos", value: stats.clients, icon: Users, gradient: "gradient-gold", iconColor: "text-accent-foreground" },
    { label: "Receita Total", value: `R$ ${revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, gradient: "gradient-rosa", iconColor: "text-primary-foreground" },
  ];

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
      <div className="space-y-8">
        {influencer?.status === "em_analise" && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm flex items-center gap-2">
            <Clock size={16} className="text-accent shrink-0" />
            Seu perfil está <strong>em análise</strong>. Você será notificada quando for aprovado.
          </div>
        )}
        {influencer?.status === "suspensa" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm">
            ⚠️ Seu perfil está <strong>suspenso</strong>. Entre em contato com o suporte.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="relative overflow-hidden rounded-2xl p-6 shadow-rosa transition-all hover:scale-[1.02]">
              <div className={`absolute inset-0 ${c.gradient} opacity-90`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <c.icon size={20} className={c.iconColor} />
                  </div>
                  <ArrowUpRight size={16} className={c.iconColor + " opacity-60"} />
                </div>
                <p className="text-2xl font-bold text-white">{c.value}</p>
                <p className="text-sm text-white/80">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="font-display font-semibold">Agendamentos por Mês</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(30 30% 88%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(value: number) => [value, "Agendamentos"]} />
                <Bar dataKey="agendamentos" fill="hsl(340, 82%, 43%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-accent" />
              <h3 className="font-display font-semibold">Status</h3>
            </div>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {statusData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Sem dados ainda</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h3 className="font-display font-semibold">Visão Diária</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDailyViewMonth(m => subMonths(m, 1))}>
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-medium capitalize min-w-[120px] text-center">
                {format(dailyViewMonth, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDailyViewMonth(m => addMonths(m, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Agendamentos do mês</p>
              <p className="text-2xl font-bold text-primary">{dailyMonthBookings}</p>
            </div>
            <div className="bg-accent/5 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Receita do mês</p>
              <p className="text-2xl font-bold text-accent">R$ {dailyMonthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={1} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(30 30% 88%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(value: number, name: string) => {
                  if (name === "receita") return [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"];
                  return [value, "Agendamentos"];
                }}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Bar dataKey="agendamentos" fill="hsl(340, 82%, 43%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="receita" fill="hsl(43, 89%, 38%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex gap-4 justify-center mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(340, 82%, 43%)" }} /> Agendamentos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(43, 89%, 38%)" }} /> Receita (R$)
            </span>
          </div>

          <div className="mt-6 space-y-2 max-h-[400px] overflow-y-auto">
            {dailyData.filter(d => d.agendamentos > 0).map((d) => (
              <div key={d.dia} className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isToday(d.date) ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {isToday(d.date) ? "Hoje" : format(d.date, "dd/MM - EEEE", { locale: ptBR })}
                    </span>
                    <span className="text-xs text-muted-foreground">{d.agendamentos} agendamento{d.agendamentos > 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-sm font-semibold text-accent">R$ {d.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-1">
                  {d.bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{b.clients?.nome || "Cliente"}</span>
                        <span className="text-xs text-muted-foreground">• {b.services?.tipo}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium">R$ {Number(b.services?.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        {statusBadge(b.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {dailyData.every(d => d.agendamentos === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento neste mês.</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold mb-4">Últimos Agendamentos</h3>
          {recentBookings.length > 0 ? (
            <div className="divide-y divide-border">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{b.clients?.nome || "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.services?.tipo || "Serviço"} • {new Date(b.data_agendada).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      R$ {Number(b.services?.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {statusBadge(b.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento encontrado.</p>
          )}
        </div>
      </div>
    </PanelLayout>
  );
};

export default Dashboard;
