'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

const testimonials = [
  {
    nome: "Ana Paula Silva",
    empresa: "Loja Bella Moda",
    texto: "Consegui 3x mais vendas na semana que a influenciadora postou. O processo foi simples e rápido!",
    avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=e8375e&color=fff&size=80",
    estrelas: 5,
  },
  {
    nome: "Carlos Mendes",
    empresa: "Empório Natural",
    texto: "Plataforma incrível! Agendei, enviei o material e em 2 dias minha loja foi divulgada. Recomendo muito.",
    avatar: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=b8860b&color=fff&size=80",
    estrelas: 5,
  },
  {
    nome: "Mariana Costa",
    empresa: "Studio Fit",
    texto: "A organização do painel é excelente. Consigo ver tudo em tempo real. Já fiz 8 agendamentos!",
    avatar: "https://ui-avatars.com/api/?name=Mariana+Costa&background=e8375e&color=fff&size=80",
    estrelas: 5,
  },
]

const TestimonialsSection = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que dizem nossos <span className="text-gradient-gold">clientes</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Marcas que já impulsionaram seus negócios com o AgendaInflu.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-4 hover:shadow-rosa transition-shadow duration-300">
              <div className="flex gap-1">
                {Array.from({ length: t.estrelas }).map((_, j) => (
                  <Star key={j} size={16} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.texto}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Image src={t.avatar} alt={t.nome} width={40} height={40} className="rounded-full" />
                <div>
                  <p className="text-sm font-semibold">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.empresa}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
