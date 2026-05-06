'use client'

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { AdminLayout } from "./AdminLayout";

export const AdminClientes = () => {
  const [clients, setClients] = useState<(Tables<"clients"> & { influencers: Tables<"influencers"> | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [search, setSearch] = useState("");

  const fetchClients = (p = 1) => {
    apiFetch(`/api/admin/clients?page=${p}`).then((res) => {
      setClients(res.data || []);
      setTotalPages(res.totalPages || 1);
      setHasNext(res.hasNext || false);
      setPage(p);
    }).catch(() => {
      toast.error('Erro ao carregar clientes');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter((c) => !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.empresa?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Clientes">
      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : (
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
            <PaginationControls
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              onPageChange={fetchClients}
              className="border-t border-border"
            />
          </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
};
