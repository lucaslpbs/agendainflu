'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";

const HeroSection = () => {
  const [slugInput, setSlugInput] = useState("");
  const [showSlugInput, setShowSlugInput] = useState(false);

  const handleSlugGo = () => {
    if (slugInput.trim()) {
      window.location.href = `/${slugInput.trim().replace(/^@/, "").toLowerCase()}`;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#0A0A0F" }}>
      {/* Blobs orgânicos — sem grid, sem simetria */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700, height: 700,
          borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
          background: "radial-gradient(circle, rgba(255,45,135,0.12) 0%, transparent 70%)",
          top: -200, right: -150,
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          borderRadius: "40% 60% 30% 70% / 60% 40% 70% 30%",
          background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          bottom: -100, left: -100,
          filter: "blur(60px)",
        }}
      />

      <div className="container relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">

          {/* Lado esquerdo — texto */}
          <div className="space-y-8">
            {/* Pill de destaque — mais simples, sem ícone */}
            <p className="text-[#FF2D87] text-sm font-semibold tracking-wider uppercase animate-fade-in">
              ✦ para criadores de conteúdo
            </p>

            {/* Headline — bem grande, assimétrica */}
            <h1
              className="text-5xl md:text-[72px] font-bold leading-[0.95] tracking-tight text-white animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Sua agenda.
              <br />
              <span
                className="text-[80px] md:text-[96px]"
                style={{
                  background: "linear-gradient(135deg, #FF2D87, #7C3AED)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Sua marca.
              </span>
              <br />
              Seu negócio.
            </h1>

            <p
              className="text-lg text-white/50 max-w-md leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Página própria, agendamentos e clientes — tudo em um link só.
              Compartilhe <span className="text-white/80">agendainflu.com/seunome</span> e pronto.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                variant="hero"
                size="lg"
                className="btn-shimmer rounded-full px-8 h-13"
                asChild
              >
                <Link href="/cadastro-influenciadora">
                  Criar minha página grátis
                  <ArrowRight size={17} />
                </Link>
              </Button>

              {!showSlugInput ? (
                <button
                  onClick={() => setShowSlugInput(true)}
                  className="h-13 px-6 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all flex items-center gap-2"
                >
                  Tenho link de uma influenciadora
                  <ExternalLink size={14} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSlugGo()}
                    placeholder="@username"
                    autoFocus
                    className="h-12 px-5 rounded-full border border-white/20 bg-white/8 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#FF2D87]/60 w-48"
                  />
                  <Button variant="hero" className="h-12 rounded-full px-6 btn-shimmer" onClick={handleSlugGo}>
                    Ir
                  </Button>
                </div>
              )}
            </div>

            {/* Stats — inline, sem caixa */}
            <div
              className="flex flex-wrap gap-6 pt-2 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { value: "120+", label: "influenciadoras" },
                { value: "500+", label: "marcas atendidas" },
                { value: "4.9★", label: "avaliação média" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="text-xl font-bold text-[#FF2D87]">{s.value}</span>
                  <span className="text-white/40 text-sm ml-1.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lado direito — mockup visual de perfil */}
          <div
            className="hidden lg:block relative animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            {/* Card flutuante principal */}
            <div
              className="relative rounded-[32px] overflow-hidden animate-float"
              style={{
                background: "linear-gradient(145deg, #1C1C2E, #13131A)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "28px",
              }}
            >
              {/* Header do perfil */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-14 h-14 rounded-full flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #FF2D87, #7C3AED)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "#fff",
                  }}
                >
                  J
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Juliana Santos</p>
                  <p className="text-white/40 text-xs">@juliana.santos</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span className="text-[10px] text-[#10B981]">Verificada</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[#FF2D87] font-bold text-sm">250K</p>
                  <p className="text-white/30 text-[10px]">seguidores</p>
                </div>
              </div>

              {/* Serviços */}
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Serviços</p>
              {[
                { tipo: "Stories", preco: "R$ 350", emoji: "📱" },
                { tipo: "Reels", preco: "R$ 700", emoji: "🎬" },
                { tipo: "Feed + Stories", preco: "R$ 900", emoji: "✨" },
              ].map((s) => (
                <div
                  key={s.tipo}
                  className="flex items-center justify-between mb-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <span className="text-white/70 text-xs">{s.emoji} {s.tipo}</span>
                  <span className="text-[#FF2D87] font-bold text-xs">{s.preco}</span>
                </div>
              ))}

              {/* Botão */}
              <div
                className="mt-5 w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #FF2D87, #7C3AED)" }}
              >
                Agendar serviço
              </div>
            </div>

            {/* Badge flutuante — notificação */}
            <div
              className="absolute -top-4 -left-6 px-4 py-2.5 rounded-2xl text-sm font-medium text-white"
              style={{
                background: "#1C1C2E",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              🎉 Novo agendamento
            </div>

            {/* Badge flutuante — avaliação */}
            <div
              className="absolute -bottom-4 -right-4 px-4 py-2.5 rounded-2xl text-sm font-medium text-white"
              style={{
                background: "#1C1C2E",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              ⭐ 4.9 · 48 avaliações
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
