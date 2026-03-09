import { useParams } from "react-router-dom";
import { Star, Instagram, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const mockServices = [
  { tipo: "Stories", formato: "Online", preco: "R$ 150", descricao: "Sequência de 3 stories com marcação e link" },
  { tipo: "Reels", formato: "Online", preco: "R$ 350", descricao: "Reels criativo de até 60s com produto" },
  { tipo: "Reels + Stories", formato: "Online", preco: "R$ 450", descricao: "Combo: Reels + 3 stories" },
  { tipo: "Presencial", formato: "Presencial", preco: "A combinar", descricao: "Visita presencial ao estabelecimento com cobertura completa" },
];

const InfluencerProfile = () => {
  const { username } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Profile header */}
          <div className="bg-card rounded-2xl border border-border p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                alt="Foto de perfil"
                className="w-28 h-28 rounded-2xl object-cover border-4 border-rosa-light"
              />
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">@{username || "influenciadora"}</h1>
                <p className="text-muted-foreground text-sm mt-1">Moda & Lifestyle</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Instagram size={14} /> 120K seguidores</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> São Paulo, SP</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">5.0</span>
                </div>
              </div>
              <Button variant="gold" size="lg" className="flex items-center gap-2">
                <MessageCircle size={18} />
                WhatsApp
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Apaixonada por moda e lifestyle! Ajudo marcas a se conectarem com o público certo através de conteúdo autêntico e criativo. Trabalho com stories, reels e visitas presenciais.
            </p>
          </div>

          {/* Services */}
          <h2 className="text-xl font-bold mb-4">Serviços disponíveis</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {mockServices.map((s, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 hover:shadow-rosa transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{s.tipo}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{s.formato}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{s.preco}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{s.descricao}</p>
                <Button variant="hero" size="sm" className="w-full">
                  <Calendar size={14} className="mr-1" /> Agendar
                </Button>
              </div>
            ))}
          </div>

          {/* Calendar placeholder */}
          <h2 className="text-xl font-bold mb-4">Disponibilidade</h2>
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="mx-auto text-muted-foreground mb-3" size={48} />
            <p className="text-muted-foreground text-sm">Calendário de disponibilidade será exibido aqui após a integração com o banco de dados.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InfluencerProfile;
