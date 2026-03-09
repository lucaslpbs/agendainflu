import { Star, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mockInfluencers = [
  { username: "juliana", nome: "Juliana Martins", nicho: "Moda & Lifestyle", seguidores: "120K", rating: 4.9, foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
  { username: "carla", nome: "Carla Souza", nicho: "Beleza & Skincare", seguidores: "85K", rating: 4.8, foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" },
  { username: "fernanda", nome: "Fernanda Lima", nicho: "Fitness & Saúde", seguidores: "200K", rating: 5.0, foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop" },
  { username: "beatriz", nome: "Beatriz Rocha", nicho: "Gastronomia", seguidores: "65K", rating: 4.7, foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" },
];

const FeaturedInfluencers = () => {
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockInfluencers.map((inf, i) => (
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

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={j < Math.floor(inf.rating) ? "fill-accent text-accent" : "text-border"}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{inf.rating}</span>
                </div>

                <Button variant="hero" size="sm" className="w-full" asChild>
                  <Link to={`/${inf.username}`}>Ver perfil</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInfluencers;
