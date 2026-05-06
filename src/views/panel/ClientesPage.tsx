'use client'

import { useState } from "react";
import { useClients, useAddClient, useUpdateClientStatus } from "@/hooks/usePanelData";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, MessageCircle, Ban, CheckCircle } from "lucide-react";

const ClientesPage = () => {
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", empresa: "", notas: "" });

  const { data: clients = [], isLoading } = useClients();
  const addClient = useAddClient();
  const updateStatus = useUpdateClientStatus();

  const handleAdd = async () => {
    try {
      await addClient.mutateAsync({
        nome: form.nome,
        whatsapp: form.whatsapp,
        email: form.email || null,
        empresa: form.empresa || null,
        notas: form.notas || null,
      });
      toast.success("Cliente adicionado!");
      setShowForm(false);
      setForm({ nome: "", whatsapp: "", email: "", empresa: "", notas: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: "ativo" | "bloqueado") => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success('Cliente ' + (status === "ativo" ? "ativado" : "bloqueado") + '!');
    } catch (err: any) {
      toast.error(err.message);
    }
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
            <Input
              type="text"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:w-60"
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
              <Input type="text" placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Input type="tel" placeholder="WhatsApp *" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              <Input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input type="text" placeholder="Empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            </div>
            <textarea rows={2} placeholder="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none" />
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={handleAdd} disabled={addClient.isPending}>Salvar</Button>
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
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>
                ) : (
                  filtered.map((c) => (
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateStatus(c.id, "ativo")}>
                              <CheckCircle size={14} />
                            </Button>
                          )}
                          {c.status !== "bloqueado" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateStatus(c.id, "bloqueado")}>
                              <Ban size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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
