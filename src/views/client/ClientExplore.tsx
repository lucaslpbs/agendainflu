'use client'

import { useEffect, useState } from "react";
import Image from 'next/image';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Instagram, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { ClientLayout } from "./ClientLayout";

type InfluencerWithLastBooking = {
  id: string;
  nome: string;
  username: string;
  nicho: string | null;
  foto_url: string | null;
  seguidores: string | null;
  lastBookingStatus: string;
  lastBookingDate: string | null;
};

export const ClientExplore = () => {
  const { user } = useAuth();
  const [influencers, setInfluencers] = useState<InfluencerWithLastBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyInfluencers = async () => {
      try {
        // 1. Find client records for this user
        let clientIds: string[] = [];

        const { data: clients } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id);

        if (clients && clients.length > 0) {
          clientIds = clients.map((c) => c.id);
        } else {
          // fallback by email
          const { data: clientsByEmail } = await supabase
            .from("clients")
            .select("id")
            .eq("email", user.email || "");
          clientIds = (clientsByEmail || []).map((c) => c.id);
        }

        if (clientIds.length === 0) {
          setInfluencers([]);
          setLoading(false);
          return;
        }

        // 2. Fetch bookings for this client, with influencer info
        const { data: bookings } = await supabase
          .from("bookings")
          .select("influencer_id, status, data_agendada, influencers(id, nome, username, nicho, foto_url, seguidores)")
          .in("client_id", clientIds)
          .order("data_agendada", { ascending: false });

        if (!bookings || bookings.length === 0) {
          setInfluencers([]);
          setLoading(false);
          return;
        }

        // 3. Deduplicate — keep most recent booking per influencer
        const seen = new Set<string>();
        const uniqueInfluencers: InfluencerWithLastBooking[] = [];

        for (const b of bookings) {
          const inf = b.influencers as any;
          if (!inf || seen.has(b.influencer_id)) continue;
          seen.add(b.influencer_id);
          uniqueInfluencers.push({
            id: inf.id,
            nome: inf.nome,
            username: inf.username,
            nicho: inf.nicho,
            foto_url: inf.foto_url,
            seguidores: inf.seguidores,
            lastBookingStatus: b.status,
            lastBookingDate: b.data_agendada,
          });
        }

        setInfluencers(uniqueInfluencers);
      } catch {
        toast.error("Erro ao carregar suas influenciadoras");
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfluencers();
  }, [user]);

  const statusLabel: Record<string, { label: string; color: string }> = {
    pendente: { label: "Pendente", color: "#F59E0B" },
    confirmado: { label: "Confirmado", color: "#3B82F6" },
    concluido: { label: "Concluído", color: "#10B981" },
    cancelado: { label: "Cancelado", color: "#EF4444" },
  };

  return (
    <ClientLayout title="Minhas Influenciadoras">
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#13131A] rounded-2xl border border-white/8 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            {/* Empty state illustration */}
            <div className="w-20 h-20 rounded-2xl bg-[#FF2D87]/10 border border-[#FF2D87]/20 flex items-center justify-center mb-6">
              <Link2 size={36} className="text-[#FF2D87]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Você ainda não tem nenhuma influenciadora parceira
            </h3>
            <p className="text-white/50 text-sm max-w-sm mb-8 leading-relaxed">
              Acesse o link direto de uma influenciadora para começar. Após o seu primeiro agendamento, ela aparecerá aqui.
            </p>
            <div className="bg-[#13131A] border border-white/8 rounded-xl p-5 max-w-sm w-full text-left space-y-2">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Como funciona</p>
              <p className="text-sm text-white/70">
                1. Receba o link da influenciadora — ex:{" "}
                <span className="text-[#FF2D87] font-mono">agendainflu.com/seunome</span>
              </p>
              <p className="text-sm text-white/70">
                2. Acesse o link e agende um serviço
              </p>
              <p className="text-sm text-white/70">
                3. A influenciadora aparecerá aqui após o agendamento
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/40">
              {influencers.length} influenciadora{influencers.length !== 1 ? "s" : ""} com relacionamento ativo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {influencers.map((inf) => {
                const st = statusLabel[inf.lastBookingStatus] || statusLabel.pendente;
                return (
                  <div
                    key={inf.id}
                    className="group bg-[#13131A] rounded-2xl overflow-hidden border border-white/8 hover:border-white/16 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,45,135,0.1)] transition-all duration-300"
                  >
                    {/* Cover / foto */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#FF2D87]/20 to-[#7C3AED]/20">
                      {inf.foto_url ? (
                        <Image
                          src={inf.foto_url}
                          alt={inf.nome}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-white/20">
                            {inf.nome.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Seguidores badge */}
                      {inf.seguidores && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full px-2.5 py-1 flex items-center gap-1 text-xs">
                          <Instagram size={11} />
                          {inf.seguidores}
                        </div>
                      )}

                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0F] to-transparent p-4">
                        <p className="text-white font-semibold text-sm leading-tight">{inf.nome}</p>
                        <p className="text-white/60 text-xs">{inf.nicho || "Influenciadora"}</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Last booking status */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">Último agendamento</span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            color: st.color,
                            background: `${st.color}18`,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>

                      <Button
                        variant="hero"
                        size="sm"
                        className="w-full btn-shimmer"
                        asChild
                      >
                        <Link href={`/${inf.username}`}>
                          Ver perfil
                          <ExternalLink size={14} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ClientLayout>
  );
};
