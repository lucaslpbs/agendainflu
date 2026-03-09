import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Instagram, MapPin, Calendar, MessageCircle, ExternalLink, Users, TrendingUp, Award, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import type { Tables } from "@/integrations/supabase/types";

const serviceLabels: Record<string, string> = {
  stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
};

const serviceIcons: Record<string, string> = {
  stories: "📱", reels: "🎬", reels_stories: "🎬📱", feed: "📸", presencial: "🤝",
};

const mockTestimonials = [
  { nome: "Maria Silva", empresa: "Boutique Elegance", texto: "Resultado incrível! O engajamento da campanha superou todas as expectativas. Vendas aumentaram 40% no mês seguinte.", rating: 5, avatar: "M" },
  { nome: "Carlos Mendes", empresa: "Tech Solutions", texto: "Profissional, pontual e criativa. Os conteúdos gerados foram autênticos e trouxeram leads qualificados para nosso negócio.", rating: 5, avatar: "C" },
  { nome: "Ana Costa", empresa: "Café Artesanal", texto: "Nossa marca ganhou visibilidade real. Os stories foram tão naturais que o público amou. Parceria que deu muito certo!", rating: 5, avatar: "A" },
];

const mockStats = [
  { label: "Campanhas realizadas", value: "50+", icon: Award },
  { label: "Marcas atendidas", value: "30+", icon: Users },
  { label: "Taxa de engajamento", value: "4.8%", icon: TrendingUp },
  { label: "Satisfação dos clientes", value: "98%", icon: Heart },
];

const InfluencerProfile = () => {
  const { username } = useParams();
  const [influencer, setInfluencer] = useState<Tables<"influencers"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [loading, setLoading] = useState(true);

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
        const { data: svc } = await supabase
          .from("services")
          .select("*")
          .eq("influencer_id", inf.id)
          .eq("ativo", true);
        setServices(svc || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [username]);

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
            <Button variant="hero" asChild><Link to="/">Voltar ao início</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const instagramHandle = influencer.instagram_url
    ? influencer.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\/?/i, "").replace(/\/$/, "")
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative pt-16">
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Profile Card overlapping banner */}
        <div className="container max-w-5xl -mt-20 relative z-10">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {influencer.foto_url ? (
                  <img
                    src={influencer.foto_url}
                    alt={influencer.nome}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-card shadow-xl"
                  />
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
                    <a
                      href={influencer.instagram_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-foreground px-3 py-1.5 rounded-full hover:from-purple-500/20 hover:to-pink-500/20 transition-colors"
                    >
                      <Instagram size={14} className="text-pink-500" />
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
                  <Button variant="hero" size="lg" asChild>
                    <Link to={`/lista-espera/${username}`}>
                      <Calendar size={18} className="mr-1" /> Agendar Serviço
                    </Link>
                  </Button>
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
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container max-w-5xl mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockStats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 text-center hover:shadow-md transition-shadow">
              <stat.icon className="mx-auto text-primary mb-2" size={24} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
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
                    <span className="text-xl font-bold text-primary">R$ {s.preco.toFixed(2)}</span>
                  </div>
                </div>
                {s.descricao && <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{s.descricao}</p>}
                <Button variant="hero" size="sm" className="w-full group-hover:shadow-rosa transition-shadow" asChild>
                  <Link to={`/lista-espera/${username}`}>
                    <Calendar size={14} className="mr-1" /> Agendar este serviço
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Esta influenciadora ainda não cadastrou serviços.</p>
            <Button variant="hero" size="sm" className="mt-4" asChild>
              <Link to={`/lista-espera/${username}`}>Entrar na lista de espera</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Testimonials / Results */}
      <div className="container max-w-5xl mt-12 mb-16">
        <h2 className="text-xl md:text-2xl font-bold font-display mb-6">
          O que dizem os <span className="text-primary">clientes</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {mockTestimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow relative"
            >
              <div className="absolute -top-3 left-6 bg-primary/10 text-primary text-lg px-2 rounded-md">"</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 mt-2">{t.texto}</p>
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-accent text-accent" />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.empresa}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            {influencer.whatsapp && (
              <a href={`https://wa.me/${influencer.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button variant="gold" size="lg" className="flex items-center gap-2">
                  <MessageCircle size={18} /> WhatsApp
                </Button>
              </a>
            )}
            <Button variant="hero" size="lg" asChild>
              <Link to={`/lista-espera/${username}`}>
                <Calendar size={18} className="mr-1" /> Agendar agora
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InfluencerProfile;
