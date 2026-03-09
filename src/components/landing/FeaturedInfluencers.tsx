import { useEffect, useState } from "react";
import { Star, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const fallbackInfluencers = [
  { username: "juliana", nome: "Juliana Martins", nicho: "Moda & Lifestyle", seguidores: "120K", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
  { username: "carla", nome: "Carla Souza", nicho: "Beleza & Skincare", seguidores: "85K", foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" },
  { username: "fernanda", nome: "Fernanda Lima", nicho: "Fitness & Saúde", seguidores: "200K", foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop" },
  { username: "beatriz", nome: "Beatriz Rocha", nicho: "Gastronomia", seguidores: "65K", foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" },
];

const FeaturedInfluencers = () => {
  const [influencers, setInfluencers] = useState<Tables<"influencers">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("influencers")
        .select("*")
        .eq("status", "ativa")
        .limit(8);
      setInfluencers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const displayData = influencers.length > 0
    ? influencers.map(inf => ({
        username: inf.username,
        nome: inf.nome,
        nicho: inf.nicho || "Influenciadora",
        seguidores: inf.seguidores || "—",
        foto: inf.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(inf.nome)}&background=e8375e&color=fff&size=300`,
      }))
    : fallbackInfluencers;

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Influenciadoras em <span className="text-gradient-gold">destaque</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Conheça algumas das nossas influenciadoras verificadas e prontas para impulsionar sua marca.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayData.map((inf, i) => (
              <div
                key={inf.username}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-rosa transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={inf.foto}
                    alt={inf.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-medium">
                    <Instagram size={12} className="text-primary" />
                    {inf.seguidores}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base">{inf.nome}</h3>
                    <p className="text-xs text-muted-foreground">{inf.nicho}</p>
                  </div>

                  <Button variant="hero" size="sm" className="w-full" asChild>
                    <Link to={`/${inf.username}`}>Ver perfil</Link>
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
