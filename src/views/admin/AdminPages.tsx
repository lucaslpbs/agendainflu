'use client'

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, UserCheck, BarChart3, LogOut, Menu, X,
  CheckCircle, XCircle, Eye, DollarSign, Clock, TrendingUp,
  CalendarDays, ClipboardList, MessageSquare, Search, Filter,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, parseISO, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

const AdminLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Influenciadoras", icon: UserCheck, path: "/admin/influenciadoras" },
    { label: "Agendamentos", icon: ClipboardList, path: "/admin/agendamentos" },
    { label: "Clientes", icon: Users, path: "/admin/clientes" },
    { label: "Lista de Espera", icon: Clock, path: "/admin/lista-espera" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link href="/admin" className="font-display text-xl font-bold">
              <span className="text-primary">Admin</span><span className="text-accent">Panel</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}>
                <item.icon size={18} />{item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Administrador</p>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={async () => { await signOut(); router.push("/"); }}>
              <LogOut size={16} /> Sair
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center px-6 lg:px-8 bg-card">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

// ==================== ADMIN DASHBOARD ====================
export const AdminDashboard = () => {
  const [stats, setStats] = useState({ influencers: 0, emAnalise: 0, bookings: 0, clients: 0, waitlist: 0, receita: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchAll = async () => {
      const [infRes, bkRes, clRes, wlRes] = await Promise.all([
        supabase.from("influencers").select("id, status"),
        supabase.from("bookings").select("*, services(preco, tipo), clients(nome), influencers(nome)"),
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("waitlist").select("id", { count: "exact" }),
      ]);

      const allBookings = bkRes.data || [];
      const receita = allBookings
        .filter((b: any) => b.status === "confirmado" || b.status === "concluido")
        .reduce((sum: number, b: any) => sum + (b.services?.preco || 0), 0);

      setStats({
        influencers: infRes.data?.filter((i) => i.status === "ativa").length || 0,
        emAnalise: infRes.data?.filter((i) => i.status === "em_analise").length || 0,
        bookings: allBookings.length,
        clients: clRes.count || 0,
        waitlist: wlRes.count || 0,
        receita,
      });
      setBookings(allBookings);
    };
    fetchAll();
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
    pendente: "hsl(43, 89%, 38%)",
    confirmado: "hsl(142, 71%, 45%)",
    concluido: "hsl(210, 70%, 50%)",
    cancelado: "hsl(0, 84%, 60%)",
  };

  const recentBookings = bookings.slice(0, 8);

  const cards = [
    { label: "Influenciadoras Ativas", value: stats.influencers, icon: UserCheck, color: "text-primary" },
    { label: "Em Análise", value: stats.emAnalise, icon: Eye, color: "text-accent" },
    { label: "Total Agendamentos", value: stats.bookings, icon: CalendarDays, color: "text-primary" },
    { label: "Receita Total", value: `R$ ${stats.receita.toFixed(2)}`, icon: DollarSign, color: "text-accent" },
    { label: "Clientes", value: stats.clients, icon: Users, color: "text-primary" },
    { label: "Lista de Espera", value: stats.waitlist, icon: Clock, color: "text-accent" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-secondary">
                <c.icon size={20} className={c.color} />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
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
            <h3 className="font-semibold">Agendamentos Recentes</h3>
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

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pendente: "bg-accent/10 text-accent",
    confirmado: "bg-primary/10 text-primary",
    concluido: "bg-secondary text-foreground",
    cancelado: "bg-destructive/10 text-destructive",
    em_analise: "bg-accent/10 text-accent",
    ativa: "bg-primary/10 text-primary",
    suspensa: "bg-accent/10 text-accent",
    rejeitada: "bg-destructive/10 text-destructive",
    aguardando: "bg-accent/10 text-accent",
    contatado: "bg-primary/10 text-primary",
    aprovado: "bg-primary/10 text-primary",
    rejeitado: "bg-destructive/10 text-destructive",
    ativo: "bg-primary/10 text-primary",
    espera: "bg-accent/10 text-accent",
    bloqueado: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || "bg-secondary text-foreground"}`}>{status.replace(/_/g, " ")}</span>;
};

// ==================== ADMIN INFLUENCIADORAS ====================
export const AdminInfluenciadoras = () => {
  const { user } = useAuth();
  const [influencers, setInfluencers] = useState<Tables<"influencers">[]>([]);
  const [tab, setTab] = useState<"all" | "em_analise">("em_analise");
  const [search, setSearch] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    perfil_completo: false, instagram_verificado: false, nicho_definido: false, foto_qualidade: false, bio_preenchida: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");

  const fetchInfluencers = async () => {
    const { data } = await supabase.from("influencers").select("*").order("criado_em", { ascending: false });
    setInfluencers(data || []);
  };

  useEffect(() => { fetchInfluencers(); }, []);

  const approve = async (id: string) => {
    await supabase.from("influencers").update({ status: "ativa", aprovado_em: new Date().toISOString(), observacoes_admin: observacoes }).eq("id", id);
    await supabase.from("influencer_analysis").insert({
      influencer_id: id, checklist: checklist as any, aprovado_por: user?.id, resultado: "aprovado", notas: observacoes,
    });
    toast.success("Influenciadora aprovada!");
    setSelectedId(null);
    fetchInfluencers();
  };

  const reject = async (id: string) => {
    await supabase.from("influencers").update({ status: "rejeitada", observacoes_admin: observacoes }).eq("id", id);
    await supabase.from("influencer_analysis").insert({
      influencer_id: id, checklist: checklist as any, aprovado_por: user?.id, resultado: "rejeitado", notas: observacoes,
    });
    toast.success("Influenciadora rejeitada.");
    setSelectedId(null);
    fetchInfluencers();
  };

  const filtered = (tab === "em_analise" ? influencers.filter((i) => i.status === "em_analise") : influencers)
    .filter((i) => !search || i.nome.toLowerCase().includes(search.toLowerCase()) || i.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Influenciadoras">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-2">
            <Button variant={tab === "em_analise" ? "default" : "outline"} size="sm" onClick={() => setTab("em_analise")}>
              Em análise ({influencers.filter((i) => i.status === "em_analise").length})
            </Button>
            <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>
              Todas ({influencers.length})
            </Button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {selectedId && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
            <h3 className="font-semibold">Checklist de aprovação</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(checklist).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors">
                  <input type="checkbox" checked={val} onChange={() => setChecklist({ ...checklist, [key]: !val })} className="rounded" />
                  {key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Observações</label>
              <textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={() => approve(selectedId)}>
                <CheckCircle size={14} className="mr-1" /> Aprovar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => reject(selectedId)}>
                <XCircle size={14} className="mr-1" /> Rejeitar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Cancelar</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((inf) => (
            <div key={inf.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                {inf.foto_url ? (
                  <img src={inf.foto_url} alt={inf.nome} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">{inf.nome.charAt(0)}</div>
                )}
                <div>
                  <h3 className="font-semibold">{inf.nome}</h3>
                  <p className="text-xs text-muted-foreground">@{inf.username} • {inf.nicho || "—"} • {inf.seguidores || "—"} seguidores</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={inf.status} />
                {inf.status === "em_analise" && (
                  <Button variant="outline" size="sm" onClick={() => { setSelectedId(inf.id); setObservacoes(""); setChecklist({ perfil_completo: false, instagram_verificado: false, nicho_definido: false, foto_qualidade: false, bio_preenchida: false }); }}>
                    Analisar
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma influenciadora encontrada.</p>}
        </div>
      </div>
    </AdminLayout>
  );
};

// ==================== ADMIN AGENDAMENTOS ====================
export const AdminAgendamentos = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, services(preco, tipo), clients(nome, whatsapp, empresa), influencers(nome, username)")
        .order("data_agendada", { ascending: false });
      setBookings(data || []);
    };
    fetch();
  }, []);

  const filtered = bookings
    .filter((b) => statusFilter === "todos" || b.status === statusFilter)
    .filter((b) => !search || b.clients?.nome?.toLowerCase().includes(search.toLowerCase()) || b.influencers?.nome?.toLowerCase().includes(search.toLowerCase()) || b.codigo_confirmacao?.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status } as any).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    toast.success("Status atualizado!");
  };

  return (
    <AdminLayout title="Agendamentos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {["todos", "pendente", "confirmado", "concluido", "cancelado"].map((s) => (
              <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
                {s}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                  <th className="text-left px-4 py-3 font-medium">Serviço</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.codigo_confirmacao}</td>
                    <td className="px-4 py-3">{b.clients?.nome || "—"}</td>
                    <td className="px-4 py-3">{b.influencers?.nome || "—"}</td>
                    <td className="px-4 py-3 capitalize">{b.services?.tipo?.replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-3">{format(parseISO(b.data_agendada), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3 font-medium">R$ {b.services?.preco?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="text-xs border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==================== ADMIN CLIENTES ====================
export const AdminClientes = () => {
  const [clients, setClients] = useState<(Tables<"clients"> & { influencers: Tables<"influencers"> | null })[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("clients").select("*, influencers(*)").order("criado_em", { ascending: false });
      setClients((data as any) || []);
    };
    fetch();
  }, []);

  const filtered = clients.filter((c) => !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.empresa?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex justify-end">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                  <th className="text-left px-4 py-3 font-medium">Origem</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{c.nome}</td>
                    <td className="px-4 py-3">{c.empresa || "—"}</td>
                    <td className="px-4 py-3">{c.whatsapp}</td>
                    <td className="px-4 py-3">{c.influencers?.nome || "—"}</td>
                    <td className="px-4 py-3 capitalize text-xs">{c.origem.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==================== ADMIN LISTA DE ESPERA ====================
export const AdminWaitlist = () => {
  const [waitlist, setWaitlist] = useState<(Tables<"waitlist"> & { influencers: Tables<"influencers"> | null })[]>([]);
  const [statusFilter, setStatusFilter] = useState("todos");

  const fetchWaitlist = async () => {
    const { data } = await supabase.from("waitlist").select("*, influencers(nome, username)").order("criado_em", { ascending: false });
    setWaitlist((data as any) || []);
  };

  useEffect(() => { fetchWaitlist(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("waitlist").update({ status } as any).eq("id", id);
    setWaitlist((prev) => prev.map((w) => w.id === id ? { ...w, status: status as any } : w));
    toast.success("Status atualizado!");
  };

  const filtered = waitlist.filter((w) => statusFilter === "todos" || w.status === statusFilter);

  return (
    <AdminLayout title="Lista de Espera">
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {["todos", "aguardando", "contatado", "aprovado", "rejeitado"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
              {s}
            </Button>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                  <th className="text-left px-4 py-3 font-medium">Mensagem</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{w.nome}</td>
                    <td className="px-4 py-3">{w.empresa || "—"}</td>
                    <td className="px-4 py-3">{w.whatsapp}</td>
                    <td className="px-4 py-3">{(w as any).influencers?.nome || "Geral"}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-xs">{w.mensagem || "—"}</td>
                    <td className="px-4 py-3 text-xs">{format(parseISO(w.criado_em), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={w.status}
                        onChange={(e) => updateStatus(w.id, e.target.value)}
                        className="text-xs border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value="aguardando">Aguardando</option>
                        <option value="contatado">Contatado</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum item na lista de espera.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
