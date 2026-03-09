import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { CalendarCheck, Users, Clock, ClipboardList } from "lucide-react";

const Dashboard = () => {
  const { influencer } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, pending: 0, clients: 0, waitlist: 0 });

  useEffect(() => {
    if (!influencer) return;
    const fetchStats = async () => {
      const [bookingsRes, clientsRes, waitlistRes] = await Promise.all([
        supabase.from("bookings").select("id, status", { count: "exact" }).eq("influencer_id", influencer.id),
        supabase.from("clients").select("id", { count: "exact" }).eq("influencer_id", influencer.id).eq("status", "ativo"),
        supabase.from("waitlist").select("id", { count: "exact" }).eq("influencer_id", influencer.id).eq("status", "aguardando"),
      ]);
      const pending = bookingsRes.data?.filter((b) => b.status === "pendente").length || 0;
      setStats({
        bookings: bookingsRes.count || 0,
        pending,
        clients: clientsRes.count || 0,
        waitlist: waitlistRes.count || 0,
      });
    };
    fetchStats();
  }, [influencer]);

  const cards = [
    { label: "Agendamentos", value: stats.bookings, icon: CalendarCheck, color: "text-primary" },
    { label: "Pendentes", value: stats.pending, icon: ClipboardList, color: "text-accent" },
    { label: "Clientes ativos", value: stats.clients, icon: Users, color: "text-primary" },
    { label: "Em espera", value: stats.waitlist, icon: Clock, color: "text-accent" },
  ];

  return (
    <PanelLayout>
      <div className="space-y-8">
        {influencer?.status === "em_analise" && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm">
            ⏳ Seu perfil está <strong>em análise</strong>. Você será notificada quando for aprovado.
          </div>
        )}
        {influencer?.status === "suspensa" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm">
            ⚠️ Seu perfil está <strong>suspenso</strong>. Entre em contato com o suporte.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-card rounded-xl border border-border p-6 hover:shadow-rosa transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <c.icon size={24} className={c.color} />
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Próximas divulgações</h3>
          <p className="text-sm text-muted-foreground">Nenhuma divulgação agendada ainda.</p>
        </div>
      </div>
    </PanelLayout>
  );
};

export default Dashboard;
