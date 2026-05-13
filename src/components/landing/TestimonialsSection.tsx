'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

const testimonials = [
  {
    nome: "Ana Paula Silva",
    empresa: "Loja Bella Moda",
    texto: "Consegui 3x mais vendas na semana que a influenciadora postou. O processo foi simples e rápido!",
    avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=FF2D87&color=fff&size=80",
    estrelas: 5,
    size: "large",
  },
  {
    nome: "Carlos Mendes",
    empresa: "Empório Natural",
    texto: "Agendei, enviei o material e em 2 dias minha loja foi divulgada. Recomendo muito.",
    avatar: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=7C3AED&color=fff&size=80",
    estrelas: 5,
    size: "small",
  },
  {
    nome: "Mariana Costa",
    empresa: "Studio Fit",
    texto: "A organização do painel é excelente. Consigo ver tudo em tempo real. Já fiz 8 agendamentos!",
    avatar: "https://ui-avatars.com/api/?name=Mariana+Costa&background=00D4FF&color=fff&size=80",
    estrelas: 5,
    size: "small",
  },
]

const TestimonialsSection = () => {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      {/* Blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 450, height: 450,
          borderRadius: "50% 50% 30% 70% / 50% 30% 70% 50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
          top: "30%", right: -100,
          filter: "blur(80px)",
        }}
      />

      <div className="container relative z-10">
        {/* Título — canto, informalmente */}
        <div className="mb-16">
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">o que falam por aí</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Quem usou,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D87, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              aprovou.
            </span>
          </h2>
        </div>

        {/* Layout assimétrico — card grande + dois pequenos */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Card grande */}
          <div
            className="md:col-span-2 rounded-[28px] p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #1C1024, #13131A)",
              border: "1px solid rgba(255,45,135,0.12)",
              minHeight: 260,
            }}
          >
            <div>
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} fill="#FF2D87" color="#FF2D87" />
                ))}
              </div>
              <p className="text-white text-xl md:text-2xl font-medium leading-snug max-w-lg">
                &ldquo;{testimonials[0].texto}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/8">
              <Image
                src={testimonials[0].avatar}
                alt={testimonials[0].nome}
                width={44}
                height={44}
                className="rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-sm">{testimonials[0].nome}</p>
                <p className="text-white/40 text-xs">{testimonials[0].empresa}</p>
              </div>
            </div>
          </div>

          {/* Coluna com dois cards pequenos */}
          <div className="flex flex-col gap-4">
            {testimonials.slice(1).map((t, i) => (
              <div
                key={i}
                className="rounded-[24px] p-6 flex-1 flex flex-col justify-between"
                style={{
                  background: "#13131A",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-white/70 text-sm leading-relaxed">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
                  <Image
                    src={t.avatar}
                    alt={t.nome}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white text-xs font-semibold">{t.nome}</p>
                    <p className="text-white/30 text-[10px]">{t.empresa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
