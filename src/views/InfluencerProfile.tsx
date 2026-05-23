'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image'
import { Star, Instagram, Calendar, MessageCircle, ExternalLink, Users, TrendingUp, Award, Heart, Sparkles, CheckCircle2, Lock, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import type { Tables } from "@/integrations/supabase/types";

const serviceLabels: Record<string, string> = {
  stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
};

const serviceIcons: Record<string, string> = {
  stories: "📱", reels: "🎬", reels_stories: "🎬📱", feed: "📸", presencial: "🤝",
};

const InfluencerProfile = () => {
  const params = useParams();
  const username = params?.username as string;
  const { user } = useAuth();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<Tables<"influencers"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [realStats, setRealStats] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      const { data: inf } = await supabase
        .from("influencers")
        .select("*")
        .eq("username", username)
        .eq("status", "ativa")
        .maybeSingle();
      setInfluencer(inf);

      if (inf) {
        fetch(`/api/influencers/${username}/stats`).then(r => r.json()).then(setRealStats).catch(() => {});
      }

      if (inf) {
        const { data: svc } = await supabase
          .from("services")
          .select("*")
          .eq("influencer_id", inf.id)
          .eq("ativo", true);
        setServices(svc || []);

        // Check if logged-in user is already a client of this influencer
        if (user) {
          const { data: clientData } = await supabase
            .from("clients")
            .select("id")
            .eq("influencer_id", inf.id)
            .eq("user_id", user.id)
            .maybeSingle();
          setIsExistingClient(!!clientData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [username, user]);

  const handleAgendar = (serviceId?: string) => {
    if (!user) {
      const destination = `/agendar/${username}${serviceId ? `?service=${serviceId}` : ""}`
      if (typeof window !== 'undefined') {
        localStorage.setItem('post-auth-redirect', destination)
      }
      router.push(`/login?redirect=${encodeURIComponent(destination)}`);
      return;
    }
    router.push(`/agendar/${username}${serviceId ? `?service=${serviceId}` : ""}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Perfil não encontrado</h1>
            <p className="text-muted-foreground mb-4">Esta influenciadora não está disponível.</p>
            <Button variant="hero" asChild><Link href="/">Voltar ao início</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const instagramHandle = influencer.instagram
    ? influencer.instagram.replace(/https?:\/\/(www\.)?instagram\.com\/?/i, "").replace(/\/$/, "").replace(/^@/, "")
    : null;

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative pt-16">
        <div className="h-48 md:h-64 relative overflow-hidden">
          {influencer.cover_url ? (
            <>
              <Image src={influencer.cover_url} alt="Capa" fill priority className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_70%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </>
          )}
        </div>

        {/* Profile Card */}
        <div className="container max-w-5xl -mt-20 relative z-10">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {influencer.foto_url ? (
                  <Image src={influencer.foto_url!} alt={influencer.nome}
                    width={144} height={144} priority
                    className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-card shadow-xl" />
                ) : (
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-5xl font-bold shadow-xl">
                    {influencer.nome.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                  <CheckCircle2 size={18} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">{influencer.nome}</h1>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full self-center md:self-auto">
                    <Sparkles size={12} /> Verificada
                  </span>
                </div>

                {influencer.nicho && (
                  <p className="text-muted-foreground mt-1 text-sm">{influencer.nicho}</p>
                )}

                {/* Social & Followers */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  {influencer.seguidores && (
                    <span className="flex items-center gap-1.5 text-sm font-medium bg-secondary px-3 py-1.5 rounded-full">
                      <Users size={14} className="text-primary" />
                      {influencer.seguidores} seguidores
                    </span>
                  )}

                  {instagramHandle && (
                    <a href={influencer.instagram!.startsWith("http") ? influencer.instagram! : `https://instagram.com/${instagramHandle}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium bg-primary/10 text-foreground px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                      <Instagram size={14} className="text-primary" />
                      @{instagramHandle}
                      <ExternalLink size={10} className="text-muted-foreground" />
                    </a>
                  )}

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className="fill-accent text-accent" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(5.0)</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
                  {influencer.whatsapp && (
                    <a href={`https://wa.me/${influencer.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="gold" size="lg" className="flex items-center gap-2">
                        <MessageCircle size={18} /> Falar no WhatsApp
                      </Button>
                    </a>
                  )}
                  {isLoggedIn ? (
                    <Button variant="hero" size="lg" onClick={() => handleAgendar()}>
                      <Calendar size={18} className="mr-1" /> Agendar Serviço
                    </Button>
                  ) : (
                    <Button variant="hero" size="lg" onClick={() => handleAgendar()}>
                      <Lock size={18} className="mr-1" /> Entrar para Agendar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {influencer.bio && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">Sobre</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{influencer.bio}</p>
              </div>
            )}

            {/* Galeria de fotos */}
            {influencer.fotos && influencer.fotos.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  Portfólio
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {influencer.fotos.slice(0, 6).map((foto, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedPhoto(foto)}
                    >
                      <Image
                        src={foto}
                        alt={`Foto ${idx + 1} de ${influencer.nome}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container max-w-5xl mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Campanhas realizadas", value: realStats?.completed_bookings ?? '—', icon: Award },
            { label: "Marcas atendidas", value: realStats?.unique_clients ?? '—', icon: Users },
            { label: "Taxa de engajamento", value: realStats?.conversion_rate != null ? `${realStats.conversion_rate}%` : '—', icon: TrendingUp },
            { label: "Satisfação dos clientes", value: "98%", icon: Heart },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 text-center hover:shadow-md transition-shadow">
              <stat.icon className="mx-auto text-primary mb-2" size={24} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Feed */}
      <div className="container max-w-5xl mt-10">
        <InstagramFeed
          influencerId={influencer.id}
          instagramUrl={influencer.instagram}
          instagramHandle={instagramHandle}
        />
      </div>

      {/* Services - show types always, prices only for logged in */}
      <div className="container max-w-5xl mt-10">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-display">Serviços disponíveis</h2>
          {services.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{services.length}</span>
          )}
        </div>

        {services.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {services.map((s) => (
              <div key={s.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{serviceIcons[s.tipo] || "📋"}</span>
                    <div>
                      <h3 className="font-semibold text-base">{serviceLabels[s.tipo] || s.tipo}</h3>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{s.formato}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {isLoggedIn ? (
                      <span className="text-xl font-bold text-primary">R$ {Number(s.preco).toFixed(2)}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        <Lock size={12} /> Faça login
                      </span>
                    )}
                  </div>
                </div>
                {s.descricao && <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{s.descricao}</p>}
                {isLoggedIn ? (
                  <Button variant="hero" size="sm" className="w-full group-hover:shadow-rosa transition-shadow" onClick={() => handleAgendar(s.id)}>
                    <Calendar size={14} className="mr-1" /> Agendar este serviço
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full"
                    onClick={() => handleAgendar(s.id)}>
                    <Lock size={14} className="mr-1" /> Entrar para ver preço e agendar
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Esta influenciadora ainda não cadastrou serviços.</p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="container max-w-5xl mt-12 mb-16">
        <h2 className="text-xl md:text-2xl font-bold font-display mb-6">
          O que dizem os <span className="text-primary">clientes</span>
        </h2>
        <ReviewList influencerId={influencer.id} />
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-12 mb-0">
        <div className="container max-w-3xl text-center">
          <h2 className="text-xl md:text-2xl font-bold font-display mb-3">
            Pronta para impulsionar sua marca?
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Entre em contato com {influencer.nome} e descubra como uma parceria pode transformar seus resultados.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {!isLoggedIn ? (
              <>
                <Button variant="hero" size="lg" onClick={() => {
                  const destination = `/agendar/${username}`
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('post-auth-redirect', destination)
                  }
                  router.push(`/cadastro-cliente?redirect=${encodeURIComponent(destination)}`)
                }}>
                  <Building2 size={18} className="mr-1" /> Criar conta empresarial
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleAgendar()}>
                  Já tenho conta
                </Button>
              </>
            ) : (
              <>
                {influencer.whatsapp && (
                  <a href={`https://wa.me/${influencer.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="gold" size="lg" className="flex items-center gap-2">
                      <MessageCircle size={18} /> WhatsApp
                    </Button>
                  </a>
                )}
                <Button variant="hero" size="lg" onClick={() => handleAgendar()}>
                  <Calendar size={18} className="mr-1" /> Agendar agora
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={selectedPhoto}
              alt="Foto ampliada"
              fill
              className="object-contain"
              sizes="90vw"
            />
            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={20} />
            </button>
            {influencer.fotos && influencer.fotos.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {influencer.fotos.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setSelectedPhoto(foto); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      selectedPhoto === foto ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import { Building2 } from "lucide-react";
import dynamic from 'next/dynamic'
const InstagramFeed = dynamic(() => import('@/components/profile/InstagramFeed'), { ssr: false })
const ReviewList = dynamic(() => import('@/components/profile/ReviewList').then(m => m.ReviewList), { ssr: false })

export default InfluencerProfile;
