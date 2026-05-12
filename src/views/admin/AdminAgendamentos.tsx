'use client'

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { AdminLayout } from "./AdminLayout";

export const AdminAgendamentos = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const fetchBookings = (p = 1) => {
    apiFetch(`/api/admin/bookings?page=${p}`).then((res) => {
      setBookings(res.data || []);
      setTotalPages(res.totalPages || 1);
      setHasNext(res.hasNext || false);
      setPage(p);
    }).catch(() => {
      toast.error('Erro ao carregar agendamentos');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings
    .filter((b) => statusFilter === "todos" || b.status === statusFilter)
    .filter((b) => !search || b.clients?.nome?.toLowerCase().includes(search.toLowerCase()) || b.influencers?.nome?.toLowerCase().includes(search.toLowerCase()) || b.codigo_confirmacao?.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch('/api/admin/bookings', { method: 'PATCH', body: JSON.stringify({ id, status }) });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast.success("Status atualizado!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout title="Agendamentos">
      {loading ? (
        <SkeletonTable rows={6} columns={8} />
      ) : (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {["todos", "pendente", "confirmado", "concluido", "cancelado"].map((s) => (
              <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
                {s}
              </Button>
            ))}
          </div>
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
                  <th className="text-left px-4 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Influenciadora</th>
                  <th className="text-left px-4 py-3 font-medium">Serviço</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.codigo_confirmacao}</td>
                    <td className="px-4 py-3">{b.clients?.nome || "—"}</td>
                    <td className="px-4 py-3">{b.influencers?.nome || "—"}</td>
                    <td className="px-4 py-3 capitalize">{b.services?.tipo?.replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-3">{format(parseISO(b.data_agendada), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3 font-medium">R$ {b.services?.preco?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="text-xs border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</td></tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              onPageChange={fetchBookings}
              className="border-t border-border"
            />
          </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
};
