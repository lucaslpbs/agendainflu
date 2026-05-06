'use client'

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UserCheck, Eye, DollarSign, Users, Clock, CalendarDays, ArrowUpRight, ChevronLeft, ChevronRight, TrendingUp, TrendingDown
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import dynamic from 'next/dynamic';
import { SkeletonDashboard } from "@/components/ui/SkeletonDashboard";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminLayout } from "./AdminLayout";

const BarChart = dynamic<any>(() => import('recharts').then(m => ({ default: m.BarChart })), { ssr: false })
const Bar = dynamic<any>(() => import('recharts').then(m => ({ default: m.Bar })), { ssr: false })
const XAxis = dynamic<any>(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false })
const YAxis = dynamic<any>(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false })
const CartesianGrid = dynamic<any>(() => import('recharts').then(m => ({ default: m.CartesianGrid })), { ssr: false })
const Tooltip = dynamic<any>(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic<any>(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false })
const PieChart = dynamic<any>(() => import('recharts').then(m => ({ default: m.PieChart })), { ssr: false })
const Pie = dynamic<any>(() => import('recharts').then(m => ({ default: m.Pie })), { ssr: false })
const Cell = dynamic<any>(() => import('recharts').then(m => ({ default: m.Cell })), { ssr: false })

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ influencers: 0, emAnalise: 0, bookings: 0, clients: 0, waitlist: 0, receita: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/dashboard').then((res) => {
      setStats(res.stats);
      setBookings(res.allBookings?.data || []);
    }).catch(() => {
      toast.error('Erro ao carregar dashboard');
    }).finally(() => setLoading(false));
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayBookings = bookings.filter((b) => b.data_agendada === dayStr);
      const revenue = dayBookings
        .filter((b) => b.status === "confirmado" || b.status === "concluido")
        .reduce((s: number, b: any) => s + (b.services?.preco || 0), 0);
      return { date: format(day, "dd"), fullDate: dayStr, bookings: dayBookings.length, receita: revenue };
    });
  }, [bookings, currentMonth]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const statusColors: Record<string, string> = {
    pendente: "hsl(var(--accent))",
    confirmado: "hsl(142, 71%, 45%)",
    concluido: "hsl(var(--primary))",
    cancelado: "hsl(var(--destructive))",
  };

  const recentBookings = bookings.slice(0, 8);

  const cards = [
    { label: "Influenciadoras Ativas", value: stats.influencers, icon: UserCheck, color: "text-primary", bg: "bg-primary/8", trend: "+12%", trendUp: true },
    { label: "Em Análise", value: stats.emAnalise, icon: Eye, color: "text-accent", bg: "bg-accent/8", trend: "aguardando", trendUp: null },
    { label: "Total Agendamentos", value: stats.bookings, icon: CalendarDays, color: "text-primary", bg: "bg-primary/8", trend: "+8%", trendUp: true },
    { label: "Receita Total", value: `R$ ${stats.receita.toFixed(2)}`, icon: DollarSign, color: "text-accent", bg: "bg-accent/8", trend: "+23%", trendUp: true },
    { label: "Clientes", value: stats.clients, icon: Users, color: "text-primary", bg: "bg-primary/8", trend: "+5%", trendUp: true },
    { label: "Lista de Espera", value: stats.waitlist, icon: Clock, color: "text-muted-foreground", bg: "bg-secondary", trend: "pendente", trendUp: null },
  ];

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <SkeletonDashboard cardCount={6} cardCols="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${c.bg}`}>
                  <c.icon size={18} className={c.color} />
                </div>
                {c.trendUp !== null ? (
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    c.trendUp ? "bg-green-50 text-green-600" : "bg-destructive/10 text-destructive"
                  }`}>
                    {c.trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {c.trend}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {c.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Agendamentos & Receita por Dia</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={16} /></Button>
                <span className="text-sm font-medium min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={16} /></Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Agendamentos" />
                <Bar dataKey="receita" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Receita (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Status dos Agendamentos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name] || "hsl(var(--muted))"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[s.name] || "hsl(var(--muted))" }} />
                    <span className="capitalize">{s.name}</span>
                  </div>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Agendamentos Recentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {recentBookings.length} agendamentos exibidos
              </p>
            </div>
            <Link href="/admin/agendamentos" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.codigo_confirmacao}</td>
                    <td className="px-4 py-3">{b.clients?.nome || "—"}</td>
                    <td className="px-4 py-3">{b.influencers?.nome || "—"}</td>
                    <td className="px-4 py-3">{format(parseISO(b.data_agendada), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3 font-medium">R$ {b.services?.preco?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
