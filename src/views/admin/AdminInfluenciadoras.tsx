'use client'

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminLayout } from "./AdminLayout";

export const AdminInfluenciadoras = () => {
  const [influencers, setInfluencers] = useState<Tables<"influencers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "em_analise">("em_analise");
  const [search, setSearch] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    perfil_completo: false, instagram_verificado: false, nicho_definido: false, foto_qualidade: false, bio_preenchida: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");

  const fetchInfluencers = async () => {
    const res = await apiFetch('/api/admin/influencers?status=todas');
    setInfluencers(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInfluencers(); }, []);

  const approve = async (id: string) => {
    try {
      await apiFetch(`/api/admin/influencers/${id}/approve`, { method: 'POST', body: JSON.stringify({ checklist, notas: observacoes }) });
      toast.success("Influenciadora aprovada!");
      setSelectedId(null);
      fetchInfluencers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const reject = async (id: string) => {
    if (!observacoes.trim()) { toast.error("Informe o motivo da rejeição."); return; }
    try {
      await apiFetch(`/api/admin/influencers/${id}/reject`, { method: 'POST', body: JSON.stringify({ motivo: observacoes }) });
      toast.success("Influenciadora rejeitada.");
      setSelectedId(null);
      fetchInfluencers();
    } catch (err: any) {
      toast.error(err.message);
    }
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

        {selectedId && (() => {
          const checklistCount = Object.values(checklist).filter(Boolean).length;
          const checklistTotal = Object.keys(checklist).length;
          return (
            <div className="bg-card rounded-xl border border-primary/20 p-6 space-y-5 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Checklist de aprovação</h3>
                <span className="text-sm font-medium text-primary">
                  {checklistCount}/{checklistTotal} itens
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(checklistCount / checklistTotal) * 100}%` }}
                />
              </div>

              {/* Itens do checklist */}
              <div className="grid sm:grid-cols-2 gap-2">
                {Object.entries(checklist).map(([key, val]) => (
                  <label key={key} className={`flex items-center gap-3 text-sm cursor-pointer p-3 rounded-lg border transition-all ${
                    val
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-secondary"
                  }`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                      val ? "bg-primary" : "border-2 border-border bg-background"
                    }`}>
                      {val && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={() => setChecklist({ ...checklist, [key]: !val })}
                      className="sr-only"
                    />
                    {key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </label>
                ))}
              </div>

              {/* Observações */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Observações</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Notas sobre a análise..."
                />
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => approve(selectedId)}
                  disabled={checklistCount < checklistTotal}
                  className="gap-1"
                >
                  <CheckCircle size={14} /> Aprovar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => reject(selectedId)} className="gap-1">
                  <XCircle size={14} /> Rejeitar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Cancelar</Button>
              </div>

              {checklistCount < checklistTotal && (
                <p className="text-xs text-muted-foreground">
                  Complete todos os {checklistTotal} itens do checklist para aprovar.
                </p>
              )}
            </div>
          );
        })()}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : null}

        <div className="space-y-3">
          {!loading && filtered.map((inf) => (
            <div key={inf.id} className={`bg-card rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-all ${
              inf.status === "em_analise"
                ? "border-accent/30 bg-accent/2"
                : "border-border"
            }`}>
              <div className="flex items-center gap-4">
                {inf.foto_url ? (
                  <Image src={inf.foto_url} alt={inf.nome} width={48} height={48}
                    className="w-12 h-12 rounded-xl object-cover" />
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
          {!loading && filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma influenciadora encontrada.</p>}
        </div>
      </div>
    </AdminLayout>
  );
};
