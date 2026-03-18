'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-rosa-light text-primary text-sm font-medium animate-fade-in">
            ✨ A plataforma das influenciadoras
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Agende divulgações com{" "}
            <span className="text-gradient-gold">influenciadoras</span>{" "}
            de forma simples
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Conecte sua marca às melhores influenciadoras. Escolha o serviço, agende a data e acompanhe tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" asChild>
              <Link href="/lista-espera">Quero divulgar</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link href="/cadastro-influenciadora">Sou influenciadora</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
