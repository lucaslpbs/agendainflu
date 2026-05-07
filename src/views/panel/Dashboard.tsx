'use client'

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useClients, useWaitlist } from "@/hooks/usePanelData";
import PanelLayout from "@/components/panel/PanelLayout";
import { CalendarCheck, Users, Clock, ClipboardList, TrendingUp, DollarSign, BarChart3, ArrowUpRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, eachDayOfInterval, isToday, addMonths } from "date-fns";
import dynamic from 'next/dynamic'

const BarChart = dynamic<any>(() => import('recharts').then(m => ({ default: m.BarChart })), { ssr: false })
const Bar = dynamic<any>(() => import('recharts').then(m => ({ default: m.Bar })), { ssr: false })
const XAxis = dynamic<any>(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false })
const YAxis = dynamic<any>(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false })
const Tooltip = dynamic<any>(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic<any>(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false })
const PieChart = dynamic<any>(() => import('recharts').then(m => ({ default: m.PieChart })), { ssr: false })
const Pie = dynamic<any>(() => import('recharts').then(m => ({ default: m.Pie })), { ssr: false })
const Cell = dynamic<any>(() => import('recharts').then(m => ({ default: m.Cell })), { ssr: false })
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { SkeletonDashboard } from "@/components/ui/SkeletonDashboard";
import { StatusBadge } from "@/components/ui/status-badge";

const Dashboard = () => {
  const { influencer } = useAuth();
  const router = useRouter();
  const [dailyViewMonth, setDailyViewMonth] = useState(new Date());

  const { data: allBookings = [], isLoading } = useBookings();
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
    { name: "Pendentes", value: allBookings.filter(b => b.status === "pendente").length, color: "hsl(var(--accent))" },
    { name: "Confirmados", value: allBookings.filter(b => b.status === "confirmado").length, color: "hsl(var(--primary))" },
    { name: "Concluídos", value: allBookings.filter(b => b.status === "concluido").length, color: "hsl(150, 60%, 40%)" },
    { name: "Cancelados", value: allBookings.filter(b => b.status === "cancelado").length, color: "hsl(var(--destructive))" },
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
    { label: "Total Agendamentos", value: stats.bookings, icon: CalendarCheck, href: "/painel/agendamentos" },
    { label: "Pendentes", value: stats.pending, icon: ClipboardList, href: "/painel/agendamentos?status=pendente" },
    { label: "Clientes Ativos", value: stats.clients, icon: Users, href: "/painel/clientes" },
    { label: "Receita Total", value: `R$ ${revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, highlight: true, href: "/painel/agendamentos" },
  ];

  if (isLoading) {
    return (
      <PanelLayout>
        <SkeletonDashboard />
      </PanelLayout>
    );
  }

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
          {cards.map((c) =>
            c.highlight ? (
              <div
                key={c.label}
                className="bg-primary/5 rounded-2xl border border-primary/20 p-6 hover:shadow-sm transition-all hover:scale-[1.01] cursor-pointer active:scale-[0.98]"
                onClick={() => router.push(c.href)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(c.href)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <c.icon size={20} className="text-primary" />
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground/40" />
                </div>
                <p className="text-2xl font-bold text-primary">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
              </div>
            ) : (
              <div
                key={c.label}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-sm transition-all hover:scale-[1.01] cursor-pointer active:scale-[0.98]"
                onClick={() => router.push(c.href)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(c.href)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <c.icon size={20} className="text-primary" />
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground/40" />
                </div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
              </div>
            )
          )}
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
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [value, "Agendamentos"]}
                />
                <Bar dataKey="agendamentos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
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
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                      formatter={(value: number, name: string) => [value, name]}
                    />
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
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(value: number, name: string) => {
                  if (name === "receita") return [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"];
                  return [value, "Agendamentos"];
                }}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Bar dataKey="agendamentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="receita" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex gap-4 justify-center mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} /> Agendamentos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--accent))" }} /> Receita (R$)
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
                        <StatusBadge status={b.status} />
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
                    <StatusBadge status={b.status} />
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
