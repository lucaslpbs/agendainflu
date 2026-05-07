'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50/80 to-amber-50/60" />
      {/* Decorative blobs */}
      <div className="absolute w-96 h-96 rounded-full bg-primary/8 blur-3xl -top-20 -right-20" />
      <div className="absolute w-80 h-80 rounded-full bg-accent/8 blur-3xl -bottom-10 -left-10" />
      <div className="absolute w-64 h-64 rounded-full bg-rose-200/20 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

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
            Conecte sua marca às melhores influenciadoras e acompanhe tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" asChild>
              <Link href="/lista-espera">Quero divulgar</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link href="/cadastro-influenciadora">Sou influenciadora</Link>
            </Button>
          </div>

          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 inline-flex flex-wrap justify-center gap-x-6 gap-y-3 border border-border/20">
              {[
                { value: "500+", label: "Marcas" },
                { value: "120+", label: "Influenciadoras" },
                { value: "R$ 2M+", label: "em Negócios" },
              ].map((stat, i, arr) => (
                <div key={stat.value} className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary leading-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-8 w-px bg-border/40 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-primary/40">
        <ChevronDown size={28} />
      </div>
    </section>
  );
};

export default HeroSection;
