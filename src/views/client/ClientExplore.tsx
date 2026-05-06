'use client'

import { useEffect, useState } from "react";
import Image from 'next/image';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Instagram, Search, Star } from "lucide-react";
import { SkeletonProfile } from "@/components/ui/SkeletonProfile";
import type { Tables } from "@/integrations/supabase/types";
import Link from "next/link";
import { toast } from "sonner";
import { ClientLayout } from "./ClientLayout";

const nichos = ["Todos", "Moda", "Beleza", "Fitness", "Gastronomia", "Lifestyle"];

export const ClientExplore = () => {
  const [influencers, setInfluencers] = useState<Tables<"influencers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nichoFiltro, setNichoFiltro] = useState("Todos");

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const { data } = await supabase
          .from("influencers")
          .select("*")
          .eq("status", "ativa")
          .order("nome");
        setInfluencers(data || []);
      } catch {
        toast.error('Erro ao carregar influenciadoras');
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  const filtered = influencers.filter(inf => {
    const matchSearch = inf.nome.toLowerCase().includes(search.toLowerCase()) ||
      (inf.nicho && inf.nicho.toLowerCase().includes(search.toLowerCase()));
    const matchNicho = nichoFiltro === "Todos" ||
      (inf.nicho && inf.nicho.toLowerCase().includes(nichoFiltro.toLowerCase()));
    return matchSearch && matchNicho;
  });

  return (
    <ClientLayout title="Explorar Influenciadoras">
      <div className="space-y-6">
        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {nichos.map(n => (
              <button key={n} onClick={() => setNichoFiltro(n)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  nichoFiltro === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}>
                {n}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou nicho..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonProfile key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma influenciadora encontrada</h3>
            <p className="text-sm text-muted-foreground">Tente buscar com outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((inf) => (
              <div key={inf.id} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                  {inf.foto_url ? (
                    <Image src={inf.foto_url} alt={inf.nome} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-primary/30">{inf.nome.charAt(0)}</span>
                    </div>
                  )}
                  {/* Seguidores badge — top right */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white rounded-full px-2.5 py-1 flex items-center gap-1 text-xs">
                    <Instagram size={11} />
                    {inf.seguidores || "—"}
                  </div>
                  {/* Overlay com nome + nicho */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-semibold text-sm leading-tight">{inf.nome}</p>
                    <p className="text-white/70 text-xs">{inf.nicho || "Influenciadora"}</p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {inf.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{inf.bio}</p>
                  )}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <Button variant="hero" size="sm" className="w-full" asChild>
                    <Link href={`/${inf.username}`}>Ver perfil e serviços</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};
