import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, MessageCircle, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const AgendamentosPage = () => {
  const { influencer } = useAuth();
  const [bookings, setBookings] = useState<(Tables<"bookings"> & { clients: Tables<"clients"> | null; services: Tables<"services"> | null })[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBookings = async () => {
    if (!influencer) return;
    let q = supabase.from("bookings").select("*, clients(*), services(*)").eq("influencer_id", influencer.id).order("data_agendada", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data } = await q;
    setBookings((data as any) || []);
  };

  useEffect(() => { fetchBookings(); }, [influencer, statusFilter]);

  const updateStatus = async (id: string, status: "confirmado" | "cancelado" | "concluido") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Agendamento ${status}!`);
    fetchBookings();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-700",
      confirmado: "bg-green-100 text-green-700",
      concluido: "bg-muted text-muted-foreground",
      cancelado: "bg-red-100 text-red-700",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || ""}`}>{status}</span>;
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Agendamentos</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-rosa transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{b.codigo_confirmacao}</span>
                    {statusBadge(b.status)}
                  </div>
                  <h3 className="font-semibold">{b.clients?.nome || "Cliente"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {b.services?.tipo || "Serviço"} • {new Date(b.data_agendada).toLocaleDateString("pt-BR")}
                  </p>
                  {b.descricao_produto && <p className="text-sm text-muted-foreground mt-1">{b.descricao_produto}</p>}
                </div>
                <div className="flex gap-1">
                  {b.status === "pendente" && (
                    <>
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => updateStatus(b.id, "confirmado")}>
                        <Check size={14} className="mr-1" /> Confirmar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => updateStatus(b.id, "cancelado")}>
                        <X size={14} className="mr-1" /> Recusar
                      </Button>
                    </>
                  )}
                  {b.status === "confirmado" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(b.id, "concluido")}>
                      <Check size={14} className="mr-1" /> Concluir
                    </Button>
                  )}
                  {b.clients?.whatsapp && (
                    <a href={`https://wa.me/${b.clients.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MessageCircle size={14} /></Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum agendamento encontrado.</p>
          )}
        </div>
      </div>
    </PanelLayout>
  );
};

export default AgendamentosPage;
