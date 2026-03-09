import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Instagram, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import type { Tables } from "@/integrations/supabase/types";

const serviceLabels: Record<string, string> = {
  stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
};

const InfluencerProfile = () => {
  const { username } = useParams();
  const [influencer, setInfluencer] = useState<Tables<"influencers"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <p className="text-muted-foreground">Carregando...</p>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Profile header */}
          <div className="bg-card rounded-2xl border border-border p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {influencer.foto_url ? (
                <img src={influencer.foto_url} alt={influencer.nome} className="w-28 h-28 rounded-2xl object-cover border-4 border-rosa-light" />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-rosa-light flex items-center justify-center text-primary text-4xl font-bold">
                  {influencer.nome.charAt(0)}
                </div>
              )}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{influencer.nome}</h1>
                <p className="text-muted-foreground text-sm mt-1">{influencer.nicho}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                  {influencer.seguidores && <span className="flex items-center gap-1"><Instagram size={14} /> {influencer.seguidores} seguidores</span>}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
                </div>
              </div>
              {influencer.whatsapp && (
                <a href={`https://wa.me/${influencer.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="gold" size="lg" className="flex items-center gap-2">
                    <MessageCircle size={18} /> WhatsApp
                  </Button>
                </a>
              )}
            </div>
            {influencer.bio && <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{influencer.bio}</p>}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">Serviços disponíveis</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {services.map((s) => (
                  <div key={s.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-rosa transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{serviceLabels[s.tipo] || s.tipo}</h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{s.formato}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">R$ {s.preco.toFixed(2)}</span>
                    </div>
                    {s.descricao && <p className="text-sm text-muted-foreground mb-4">{s.descricao}</p>}
                    <Button variant="hero" size="sm" className="w-full" asChild>
                      <Link to={`/lista-espera/${username}`}>
                        <Calendar size={14} className="mr-1" /> Agendar
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {services.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground">Esta influenciadora ainda não cadastrou serviços.</p>
              <Button variant="hero" size="sm" className="mt-4" asChild>
                <Link to={`/lista-espera/${username}`}>Entrar na lista de espera</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InfluencerProfile;
