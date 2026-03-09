import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { CalendarCheck, Users, Clock, ClipboardList, TrendingUp, DollarSign, BarChart3, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const { influencer } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, pending: 0, clients: 0, waitlist: 0 });
  const [revenue, setRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; agendamentos: number; receita: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [recentBookings, setRecentBookings] = useState<(Tables<"bookings"> & { clients: Tables<"clients"> | null; services: Tables<"services"> | null })[]>([]);

  useEffect(() => {
    if (!influencer) return;
    const fetchAll = async () => {
      const [bookingsRes, clientsRes, waitlistRes] = await Promise.all([
        supabase.from("bookings").select("*, clients(*), services(*)").eq("influencer_id", influencer.id),
        supabase.from("clients").select("id", { count: "exact" }).eq("influencer_id", influencer.id).eq("status", "ativo"),
        supabase.from("waitlist").select("id", { count: "exact" }).eq("influencer_id", influencer.id).eq("status", "aguardando"),
      ]);

      const allBookings = (bookingsRes.data as any) || [];
      const pending = allBookings.filter((b: any) => b.status === "pendente").length;
      const confirmed = allBookings.filter((b: any) => b.status === "confirmado").length;
      const completed = allBookings.filter((b: any) => b.status === "concluido").length;
      const cancelled = allBookings.filter((b: any) => b.status === "cancelado").length;

      setStats({
        bookings: allBookings.length,
        pending,
        clients: clientsRes.count || 0,
        waitlist: waitlistRes.count || 0,
      });

      // Revenue from completed + confirmed bookings
      const totalRevenue = allBookings
        .filter((b: any) => b.status === "concluido" || b.status === "confirmado")
        .reduce((sum: number, b: any) => sum + (b.services?.preco || 0), 0);
      setRevenue(totalRevenue);

      // Status pie chart
      setStatusData([
        { name: "Pendentes", value: pending, color: "hsl(43, 89%, 38%)" },
        { name: "Confirmados", value: confirmed, color: "hsl(340, 82%, 43%)" },
        { name: "Concluídos", value: completed, color: "hsl(150, 60%, 40%)" },
        { name: "Cancelados", value: cancelled, color: "hsl(0, 84%, 60%)" },
      ].filter(d => d.value > 0));

      // Monthly data (last 6 months)
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 5);
      const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) });
      const monthly = months.map(m => {
        const key = format(m, "yyyy-MM");
        const monthBookings = allBookings.filter((b: any) => b.data_agendada?.startsWith(key));
        const monthRevenue = monthBookings
          .filter((b: any) => b.status === "concluido" || b.status === "confirmado")
          .reduce((sum: number, b: any) => sum + (b.services?.preco || 0), 0);
        return {
          month: format(m, "MMM", { locale: ptBR }),
          agendamentos: monthBookings.length,
          receita: monthRevenue,
        };
      });
      setMonthlyData(monthly);

      // Recent bookings
      setRecentBookings(allBookings.slice(0, 5));
    };
    fetchAll();
  }, [influencer]);

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

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="relative overflow-hidden rounded-2xl p-6 shadow-rosa transition-all hover:scale-[1.02]">
              <div className={`absolute inset-0 ${c.gradient} opacity-90`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center`}>
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

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
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
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(30 30% 88%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [value, "Agendamentos"]}
                />
                <Bar dataKey="agendamentos" fill="hsl(340, 82%, 43%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
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
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
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

        {/* Recent Bookings */}
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
