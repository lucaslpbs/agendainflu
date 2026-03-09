import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Upload } from "lucide-react";

const nichos = ["Moda", "Beleza", "Fitness", "Gastronomia", "Viagem", "Tecnologia", "Lifestyle", "Maternidade", "Pets", "Educação"];

const CadastroInfluenciadora = () => {
  const [nicho, setNicho] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Cadastre-se como <span className="text-gradient-gold">influenciadora</span>
            </h1>
            <p className="text-muted-foreground">
              Preencha seus dados para análise. Após aprovação, seu perfil ficará disponível na plataforma.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome completo</label>
                <input type="text" placeholder="Seu nome" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                <input type="email" placeholder="seu@email.com" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Senha</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">WhatsApp</label>
                <input type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Instagram</label>
                <input type="text" placeholder="@seuinstagram" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nº de seguidores</label>
                <input type="text" placeholder="Ex: 50.000" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Nicho</label>
              <select
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione seu nicho</option>
                {nichos.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <textarea
                rows={3}
                placeholder="Conte um pouco sobre você e seu trabalho..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Foto de perfil</label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-sm text-muted-foreground">Clique para enviar sua foto</p>
              </div>
            </div>

            <Button variant="hero" className="w-full" size="lg">
              Enviar para análise
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Após o envio, nossa equipe analisará seu perfil em até 48h.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CadastroInfluenciadora;
