'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiFetch";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const serviceLabels: Record<string, string> = {
  stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
};

const ServicosPage = () => {
  const { influencer } = useAuth();
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tables<"services"> | null>(null);
  const [form, setForm] = useState({ tipo: "stories" as any, formato: "online" as any, preco: "", descricao: "", max_por_dia: "1" });

  const fetchServices = async () => {
    if (!influencer) return;
    try {
      const { data } = await apiFetch('/api/services?influencer_id=' + influencer.id);
      setServices(data || []);
    } catch { setServices([]); }
  };

  useEffect(() => { fetchServices(); }, [influencer]);

  const handleSave = async () => {
    if (!influencer) return;
    const payload = {
      influencer_id: influencer.id,
      tipo: form.tipo,
      formato: form.formato,
      preco: parseFloat(form.preco),
      descricao: form.descricao,
      max_por_dia: parseInt(form.max_por_dia),
    };

    try {
      if (editing) {
        await apiFetch('/api/services/' + editing.id, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success("Serviço atualizado!");
      } else {
        await apiFetch('/api/services', { method: 'POST', body: JSON.stringify(payload) });
        toast.success("Serviço criado!");
      }
    } catch (err: any) {
      return toast.error(err.message);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ tipo: "stories", formato: "online", preco: "", descricao: "", max_por_dia: "1" });
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch('/api/services/' + id, { method: 'DELETE' });
      toast.success("Serviço removido!");
      fetchServices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const startEdit = (s: Tables<"services">) => {
    setEditing(s);
    setForm({ tipo: s.tipo, formato: s.formato, preco: s.preco.toString(), descricao: s.descricao || "", max_por_dia: (s.max_por_dia || 1).toString() });
    setShowForm(true);
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Meus Serviços</h2>
          <Button variant="hero" size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm({ tipo: "stories", formato: "online", preco: "", descricao: "", max_por_dia: "1" }); }}>
            <Plus size={16} className="mr-1" /> Novo serviço
          </Button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
            <h3 className="font-semibold">{editing ? "Editar serviço" : "Novo serviço"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm">
                  <option value="stories">Stories</option>
                  <option value="reels">Reels</option>
                  <option value="reels_stories">Reels + Stories</option>
                  <option value="feed">Feed</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Formato</label>
                <select value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm">
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Preço (R$)</label>
                <input type="number" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="150.00" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Máx. por dia</label>
                <input type="number" value={form.max_por_dia} onChange={(e) => setForm({ ...form, max_por_dia: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Descrição</label>
              <textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none" />
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={handleSave}>Salvar</Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-rosa transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{serviceLabels[s.tipo] || s.tipo}</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{s.formato}</span>
                </div>
                <span className="text-lg font-bold text-primary">R$ {s.preco.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{s.descricao}</p>
              <p className="text-xs text-muted-foreground mb-3">Máx. {s.max_por_dia}/dia • {s.ativo ? "Ativo" : "Inativo"}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(s)}><Pencil size={14} /></Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
          {services.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground col-span-2">Nenhum serviço cadastrado. Clique em "Novo serviço" para começar.</p>
          )}
        </div>
      </div>
    </PanelLayout>
  );
};

export default ServicosPage;
