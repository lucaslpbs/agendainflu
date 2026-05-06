'use client'

import { useEffect, useState, useRef } from "react";
import { Star, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image'

const NICHOS = ["Todos", "Moda", "Beleza", "Fitness", "Gastronomia", "Lifestyle"];

const fallbackInfluencers = [
  { username: "juliana", nome: "Juliana Martins", nicho: "Moda & Lifestyle", seguidores: "120K", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
  { username: "carla", nome: "Carla Souza", nicho: "Beleza & Skincare", seguidores: "85K", foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" },
  { username: "fernanda", nome: "Fernanda Lima", nicho: "Fitness & Saúde", seguidores: "200K", foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop" },
  { username: "beatriz", nome: "Beatriz Rocha", nicho: "Gastronomia", seguidores: "65K", foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" },
];

const FeaturedInfluencers = () => {
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nichoFiltro, setNichoFiltro] = useState("Todos");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await window.fetch('/api/influencers?limit=8').then(r => r.json());
        setInfluencers(data || []);
      } catch {
        setInfluencers([])
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const displayData = influencers.length > 0
    ? influencers.map(inf => ({
        username: inf.username,
        nome: inf.nome,
        nicho: inf.nicho || "Influenciadora",
        seguidores: inf.seguidores || "—",
        foto: inf.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(inf.nome)}&background=e8375e&color=fff&size=300`,
      }))
    : fallbackInfluencers;

  const filteredData = displayData.filter(inf => {
    const matchNicho = nichoFiltro === "Todos" || inf.nicho.toLowerCase().includes(nichoFiltro.toLowerCase());
    const matchSearch = debouncedSearch === "" ||
      inf.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      inf.nicho.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchNicho && matchSearch;
  });

  return (
    <section id="influenciadoras" className="py-16">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Influenciadoras em <span className="text-gradient-gold">destaque</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Conheça algumas das nossas influenciadoras verificadas e prontas para impulsionar sua marca.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {NICHOS.map(nicho => (
              <button
                key={nicho}
                onClick={() => setNichoFiltro(nicho)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  nichoFiltro === nicho
                    ? "gradient-rosa text-primary-foreground"
                    : "bg-secondary text-foreground/70 hover:text-primary"
                }`}
              >
                {nicho}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou nicho..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="sm:ml-auto px-4 py-1.5 rounded-full text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-56"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhuma influenciadora encontrada para este filtro.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-1">
            {filteredData.map((inf, i) => (
              <div
                key={inf.username}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-rosa hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={inf.foto}
                    alt={inf.nome}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Seguidores badge top-right */}
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-medium z-10">
                    <Instagram size={12} className="text-primary" />
                    {inf.seguidores}
                  </div>
                  {/* Bottom overlay: name + nicho */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 z-10">
                    <p className="text-white font-semibold text-sm leading-tight">{inf.nome}</p>
                    <p className="text-white/75 text-xs">{inf.nicho}</p>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={14} className="text-gold fill-gold" />
                    ))}
                  </div>
                  <Button variant="hero" size="sm" className="w-full mt-1" asChild>
                    <Link href={`/${inf.username}`} prefetch={false}>Ver perfil</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedInfluencers;
