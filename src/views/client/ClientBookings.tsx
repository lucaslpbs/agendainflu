'use client'

import { useEffect, useState } from "react";
import Image from 'next/image';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarDays, Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/profile/ReviewForm";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClientLayout } from "./ClientLayout";

const timelineSteps = [
  { key: "pendente", label: "Pendente" },
  { key: "confirmado", label: "Confirmado" },
  { key: "concluido", label: "Concluído" },
];

const getStepIndex = (status: string) => {
  if (status === "cancelado") return -1;
  return timelineSteps.findIndex(s => s.key === status);
};

export const ClientBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        // Find client records linked to this user
        const { data: clients } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id);

        // Fallback: also check by email
        if (!clients || clients.length === 0) {
          const { data: clientsByEmail } = await supabase
            .from("clients")
            .select("id")
            .eq("email", user.email || "");

          if (!clientsByEmail || clientsByEmail.length === 0) {
            setLoading(false);
            return;
          }

          const clientIds = clientsByEmail.map((c) => c.id);
          const { data } = await supabase
            .from("bookings")
            .select("*, services(preco, tipo, formato), influencers(nome, username, foto_url)")
            .in("client_id", clientIds)
            .order("data_agendada", { ascending: false });
          setBookings(data || []);
          setLoading(false);
          return;
        }

        const clientIds = clients.map((c) => c.id);
        const { data } = await supabase
          .from("bookings")
          .select("*, services(preco, tipo, formato), influencers(nome, username, foto_url)")
          .in("client_id", clientIds)
          .order("data_agendada", { ascending: false });
        setBookings(data || []);
        setLoading(false);
      } catch {
        toast.error('Erro ao carregar agendamentos');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  useEffect(() => {
    const completedIds = bookings.filter((b) => b.status === "concluido").map((b) => b.id);
    if (completedIds.length === 0) return;
    supabase
      .from("reviews")
      .select("booking_id")
      .in("booking_id", completedIds)
      .then(({ data }) => {
        setReviewedIds(new Set((data || []).map((r: any) => r.booking_id as string)));
      });
  }, [bookings]);

  const filtered = bookings.filter((b) => statusFilter === "todos" || b.status === statusFilter);

  const stats = {
    total: bookings.length,
    pendentes: bookings.filter((b) => b.status === "pendente").length,
    confirmados: bookings.filter((b) => b.status === "confirmado").length,
    cancelados: bookings.filter((b) => b.status === "cancelado").length,
    gastoTotal: bookings
      .filter((b) => b.status === "confirmado" || b.status === "concluido")
      .reduce((s, b) => s + (b.services?.preco || 0), 0),
  };

  const serviceLabels: Record<string, string> = {
    stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
  };

  const filterButtons = [
    { key: "todos", label: "Todos", count: bookings.length },
    { key: "pendente", label: "Pendente", count: bookings.filter(b => b.status === "pendente").length },
    { key: "confirmado", label: "Confirmado", count: bookings.filter(b => b.status === "confirmado").length },
    { key: "concluido", label: "Concluído", count: bookings.filter(b => b.status === "concluido").length },
    { key: "cancelado", label: "Cancelado", count: bookings.filter(b => b.status === "cancelado").length },
  ];

  return (
    <ClientLayout title="Meus Agendamentos">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><CalendarDays size={20} className="text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total de Agendamentos</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><Clock size={20} className="text-accent" /></div>
            <div><p className="text-2xl font-bold">{stats.pendentes}</p><p className="text-xs text-muted-foreground">Pendentes</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><CheckCircle2 size={20} className="text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.confirmados}</p><p className="text-xs text-muted-foreground">Confirmados</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><DollarSign size={20} className="text-accent" /></div>
            <div><p className="text-2xl font-bold">R$ {stats.gastoTotal.toFixed(2)}</p><p className="text-xs text-muted-foreground">Total Investido</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-secondary"><XCircle size={20} className="text-destructive" /></div>
            <div><p className="text-2xl font-bold">{stats.cancelados}</p><p className="text-xs text-muted-foreground">Cancelados</p></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(({ key, label, count }) => (
            <Button key={key} variant={statusFilter === key ? "default" : "outline"} size="sm"
              onClick={() => setStatusFilter(key)}>
              {label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                statusFilter === key ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
              }`}>{count}</span>
            </Button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <CalendarDays size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Explore influenciadoras e agende seu primeiro serviço!</p>
            <Button variant="hero" asChild><Link href="/cliente/explorar">Explorar Influenciadoras</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {b.influencers?.foto_url ? (
                      <Image src={b.influencers.foto_url} alt={b.influencers.nome} width={48} height={48}
                        className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {b.influencers?.nome?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{b.influencers?.nome || "Influenciadora"}</h3>
                      <p className="text-xs text-muted-foreground">
                        {serviceLabels[b.services?.tipo] || b.services?.tipo} • {b.services?.formato} • {format(parseISO(b.data_agendada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">R$ {b.services?.preco?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.codigo_confirmacao}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={b.status} />
                      {b.status === "concluido" && (
                        reviewedIds.has(b.id) ? (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <CheckCircle2 size={12} /> Avaliado
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setReviewBooking(b)}>
                            Avaliar
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
                {b.observacoes && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{b.observacoes}</p>
                )}

                {/* Visual Timeline */}
                {b.status !== "cancelado" ? (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 top-3 h-0.5 bg-border -z-0" />
                      <div
                        className="absolute left-0 top-3 h-0.5 bg-primary transition-all duration-500 -z-0"
                        style={{ width: `${(getStepIndex(b.status) / (timelineSteps.length - 1)) * 100}%` }}
                      />
                      {timelineSteps.map((step, idx) => {
                        const stepIndex = getStepIndex(b.status);
                        const isDone = idx <= stepIndex;
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-1 relative z-10">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isDone
                                ? "bg-primary border-primary text-white"
                                : "bg-background border-border text-muted-foreground"
                            }`}>
                              {isDone ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            <span className={`text-xs ${isDone ? "text-primary font-medium" : "text-muted-foreground"}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-destructive text-xs">
                      <XCircle size={14} />
                      <span>Agendamento cancelado</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!reviewBooking} onOpenChange={(open) => { if (!open) setReviewBooking(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar serviço</DialogTitle>
          </DialogHeader>
          {reviewBooking && (
            <ReviewForm
              bookingId={reviewBooking.id}
              influencerNome={reviewBooking.influencers?.nome || "Influenciadora"}
              onSuccess={() => {
                setReviewedIds((prev) => { const next = new Set(prev); next.add(reviewBooking.id); return next; });
                setReviewBooking(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};
