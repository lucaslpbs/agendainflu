import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, UserCheck, BarChart3, LogOut, Menu, X, CheckCircle, XCircle, Eye
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";


const AdminLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Influenciadoras", icon: UserCheck, path: "/admin/influenciadoras" },
    { label: "Clientes", icon: Users, path: "/admin/clientes" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link to="/" className="font-display text-xl font-bold text-primary">
              Admin<span className="text-gradient-gold">Panel</span>
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

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ influencers: 0, emAnalise: 0, bookings: 0, clients: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [infRes, bkRes, clRes] = await Promise.all([
        supabase.from("influencers").select("id, status", { count: "exact" }),
        supabase.from("bookings").select("id", { count: "exact" }),
        supabase.from("clients").select("id", { count: "exact" }),
      ]);
      setStats({
        influencers: infRes.data?.filter((i) => i.status === "ativa").length || 0,
        emAnalise: infRes.data?.filter((i) => i.status === "em_analise").length || 0,
        bookings: bkRes.count || 0,
        clients: clRes.count || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { label: "Influenciadoras ativas", value: stats.influencers, icon: UserCheck },
    { label: "Em análise", value: stats.emAnalise, icon: Eye },
    { label: "Agendamentos", value: stats.bookings, icon: BarChart3 },
    { label: "Clientes", value: stats.clients, icon: Users },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-6">
            <c.icon size={24} className="text-primary mb-3" />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export const AdminInfluenciadoras = () => {
  const { user } = useAuth();
  const [influencers, setInfluencers] = useState<Tables<"influencers">[]>([]);
  const [tab, setTab] = useState<"all" | "em_analise">("em_analise");
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

  const filtered = tab === "em_analise" ? influencers.filter((i) => i.status === "em_analise") : influencers;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      em_analise: "bg-yellow-100 text-yellow-700",
      ativa: "bg-green-100 text-green-700",
      suspensa: "bg-orange-100 text-orange-700",
      rejeitada: "bg-red-100 text-red-700",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || ""}`}>{status.replace("_", " ")}</span>;
  };

  return (
    <AdminLayout title="Influenciadoras">
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={tab === "em_analise" ? "default" : "outline"} size="sm" onClick={() => setTab("em_analise")}>
            Em análise ({influencers.filter((i) => i.status === "em_analise").length})
          </Button>
          <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>
            Todas ({influencers.length})
          </Button>
        </div>

        {selectedId && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
            <h3 className="font-semibold">Checklist de aprovação</h3>
            <div className="space-y-2">
              {Object.entries(checklist).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={val} onChange={() => setChecklist({ ...checklist, [key]: !val })} className="rounded" />
                  {key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Observações</label>
              <textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none" />
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
            <div key={inf.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                {inf.foto_url ? (
                  <img src={inf.foto_url} alt={inf.nome} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-rosa-light flex items-center justify-center text-primary font-bold">{inf.nome.charAt(0)}</div>
                )}
                <div>
                  <h3 className="font-semibold">{inf.nome}</h3>
                  <p className="text-xs text-muted-foreground">@{inf.username} • {inf.nicho} • {inf.seguidores} seguidores</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(inf.status)}
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

export const AdminClientes = () => {
  const [clients, setClients] = useState<(Tables<"clients"> & { influencers: Tables<"influencers"> | null })[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("clients").select("*, influencers(*)").order("criado_em", { ascending: false });
      setClients((data as any) || []);
    };
    fetch();
  }, []);

  return (
    <AdminLayout title="Clientes">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">Empresa</th>
                <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">{c.nome}</td>
                  <td className="px-4 py-3">{c.empresa || "—"}</td>
                  <td className="px-4 py-3">{c.influencers?.nome || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "ativo" ? "bg-green-100 text-green-700" : c.status === "bloqueado" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
