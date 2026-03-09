import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, MessageCircle, Ban, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const ClientesPage = () => {
  const { influencer } = useAuth();
  const [clients, setClients] = useState<Tables<"clients">[]>([]);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", empresa: "", notas: "" });

  const fetchClients = async () => {
    if (!influencer) return;
    const { data } = await supabase.from("clients").select("*").eq("influencer_id", influencer.id).order("criado_em", { ascending: false });
    setClients(data || []);
  };

  useEffect(() => { fetchClients(); }, [influencer]);

  const handleAdd = async () => {
    if (!influencer) return;
    const { error } = await supabase.from("clients").insert({
      influencer_id: influencer.id,
      nome: form.nome,
      whatsapp: form.whatsapp,
      email: form.email || null,
      empresa: form.empresa || null,
      notas: form.notas || null,
      origem: "cadastro_manual" as const,
    });
    if (error) return toast.error(error.message);
    toast.success("Cliente adicionado!");
    setShowForm(false);
    setForm({ nome: "", whatsapp: "", email: "", empresa: "", notas: "" });
    fetchClients();
  };

  const updateStatus = async (id: string, status: "ativo" | "bloqueado") => {
    const { error } = await supabase.from("clients").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Cliente ${status === "ativo" ? "ativado" : "bloqueado"}!`);
    fetchClients();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ativo: "bg-green-100 text-green-700",
      espera: "bg-yellow-100 text-yellow-700",
      bloqueado: "bg-red-100 text-red-700",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || ""}`}>{status}</span>;
  };

  const filtered = clients.filter((c) =>
    c.nome.toLowerCase().includes(filter.toLowerCase()) ||
    (c.empresa?.toLowerCase().includes(filter.toLowerCase()) ?? false)
  );

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Base de Clientes</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:w-60 px-4 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <Button variant="hero" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-1" /> Adicionar
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
            <h3 className="font-semibold">Novo cliente</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              <input type="tel" placeholder="WhatsApp *" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              <input type="text" placeholder="Empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className="px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
            <textarea rows={2} placeholder="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none" />
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={handleAdd}>Salvar</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">{c.nome}</td>
                    <td className="px-4 py-3">{c.whatsapp}</td>
                    <td className="px-4 py-3">{c.empresa || "—"}</td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MessageCircle size={14} /></Button>
                        </a>
                        {c.status !== "ativo" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(c.id, "ativo")}>
                            <CheckCircle size={14} />
                          </Button>
                        )}
                        {c.status !== "bloqueado" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(c.id, "bloqueado")}>
                            <Ban size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default ClientesPage;
