'use client'

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { AdminLayout } from "./AdminLayout";

export const AdminWaitlist = () => {
  const [waitlist, setWaitlist] = useState<(Tables<"waitlist"> & { influencers: Tables<"influencers"> | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const fetchWaitlist = (p = 1) => {
    apiFetch(`/api/admin/waitlist?page=${p}`).then((res) => {
      setWaitlist(res.data || []);
      setTotalPages(res.totalPages || 1);
      setHasNext(res.hasNext || false);
      setPage(p);
    }).catch(() => {
      toast.error('Erro ao carregar lista de espera');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWaitlist(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch('/api/admin/waitlist', { method: 'PATCH', body: JSON.stringify({ id, status }) });
      setWaitlist((prev) => prev.map((w) => w.id === id ? { ...w, status: status as any } : w));
      toast.success("Status atualizado!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = waitlist.filter((w) => statusFilter === "todos" || w.status === statusFilter);

  return (
    <AdminLayout title="Lista de Espera">
      {loading ? (
        <SkeletonTable rows={6} columns={8} />
      ) : (
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
            <PaginationControls
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              onPageChange={fetchWaitlist}
              className="border-t border-border"
            />
          </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
};
