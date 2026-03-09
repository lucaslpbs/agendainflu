import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, ClipboardList, UserCircle, LogOut, Menu, X,
  CalendarDays, Clock, CheckCircle2, XCircle, DollarSign, Search
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

// ==================== CLIENT LAYOUT ====================
const ClientLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Meus Agendamentos", icon: ClipboardList, path: "/cliente" },
    { label: "Meu Perfil", icon: UserCircle, path: "/cliente/perfil" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link to="/cliente" className="font-display text-xl font-bold">
              <span className="text-primary">Minha</span><span className="text-accent">Conta</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}>
                <item.icon size={18} />{item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || "Cliente"}</p>
                <p className="text-xs text-muted-foreground">Cliente</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={async () => { await signOut(); navigate("/"); }}>
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

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pendente: "bg-accent/10 text-accent",
    confirmado: "bg-primary/10 text-primary",
    concluido: "bg-secondary text-foreground",
    cancelado: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || "bg-secondary text-foreground"}`}>{status}</span>;
};

// ==================== CLIENT BOOKINGS (main page) ====================
export const ClientBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      // Find client records linked to this user's email
      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("email", user.email || "");

      if (!clients || clients.length === 0) {
        setLoading(false);
        return;
      }

      const clientIds = clients.map((c) => c.id);
      const { data } = await supabase
        .from("bookings")
        .select("*, services(preco, tipo, formato), influencers(nome, username, foto_url)")
        .in("client_id", clientIds)
        .order("data_agendada", { ascending: false });

      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const filtered = bookings.filter((b) => statusFilter === "todos" || b.status === statusFilter);

  const stats = {
    total: bookings.length,
    pendentes: bookings.filter((b) => b.status === "pendente").length,
    confirmados: bookings.filter((b) => b.status === "confirmado").length,
    gastoTotal: bookings
      .filter((b) => b.status === "confirmado" || b.status === "concluido")
      .reduce((s, b) => s + (b.services?.preco || 0), 0),
  };

  const serviceLabels: Record<string, string> = {
    stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
  };

  return (
    <ClientLayout title="Meus Agendamentos">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><CalendarDays size={20} className="text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total de Agendamentos</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><Clock size={20} className="text-accent" /></div>
            <div><p className="text-2xl font-bold">{stats.pendentes}</p><p className="text-xs text-muted-foreground">Pendentes</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><CheckCircle2 size={20} className="text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.confirmados}</p><p className="text-xs text-muted-foreground">Confirmados</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><DollarSign size={20} className="text-accent" /></div>
            <div><p className="text-2xl font-bold">R$ {stats.gastoTotal.toFixed(2)}</p><p className="text-xs text-muted-foreground">Total Investido</p></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["todos", "pendente", "confirmado", "concluido", "cancelado"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
              {s}
            </Button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-card rounded-xl border border-border animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <CalendarDays size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Você ainda não tem agendamentos. Encontre uma influenciadora e agende agora!</p>
            <Button variant="hero" asChild><Link to="/">Explorar Influenciadoras</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {b.influencers?.foto_url ? (
                      <img src={b.influencers.foto_url} alt={b.influencers.nome} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {b.influencers?.nome?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{b.influencers?.nome || "Influenciadora"}</h3>
                      <p className="text-xs text-muted-foreground">
                        {serviceLabels[b.services?.tipo] || b.services?.tipo} • {b.services?.formato} • {format(parseISO(b.data_agendada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">R$ {b.services?.preco?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.codigo_confirmacao}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
                {b.observacoes && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{b.observacoes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

// ==================== CLIENT PROFILE ====================
export const ClientProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <ClientLayout title="Meu Perfil">
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {user?.email?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="text-lg font-bold">Minha Conta</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <label className="text-xs text-muted-foreground">E-mail</label>
              <p className="text-sm font-medium">{user?.email || "—"}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Membro desde</label>
              <p className="text-sm font-medium">
                {user?.created_at ? format(parseISO(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="destructive" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut size={14} className="mr-1" /> Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};
