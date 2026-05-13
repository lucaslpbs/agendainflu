import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const faqs = [
  {
    q: "Como funciona para a influenciadora?",
    a: "Você se cadastra, preenche seu perfil e recebe um link único. Compartilhe com marcas e clientes — eles agendam direto com você.",
  },
  {
    q: "Preciso pagar pela plataforma?",
    a: "O AgendaInflu é gratuito para uso. O pagamento da divulgação é combinado diretamente entre você e o cliente.",
  },
  {
    q: "Como aprovo ou recuso um agendamento?",
    a: "Cada solicitação aparece no seu painel. Você decide o que aceitar — nada passa sem sua aprovação.",
  },
  {
    q: "Posso definir minha disponibilidade?",
    a: "Sim! No painel você configura quais datas estão disponíveis. Clientes só conseguem agendar nas janelas que você libera.",
  },
  {
    q: "Quais tipos de serviço posso oferecer?",
    a: "Stories, Reels, Feed, combos e até presenciais. Você define os formatos e os preços livremente.",
  },
]

const FAQ = () => {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0C0C14" }}>
      {/* Divisor orgânico no topo */}
      <div className="w-full overflow-hidden" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", height: 60, display: "block" }}>
          <path d="M0 0 C360 60 1080 0 1440 60 L1440 0 L0 0 Z" fill="#0A0A0F" />
        </svg>
      </div>

      <div className="container py-20 pb-28">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-16 items-start">

          {/* Esquerda — título solto */}
          <div className="md:sticky md:top-24">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Perguntas
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #FF2D87, #7C3AED)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                frequentes.
              </span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Ainda tem dúvida? Manda um direct no Instagram.
            </p>
            <a
              href="https://instagram.com/agendainflu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF2D87] text-sm font-medium hover:text-white transition-colors"
            >
              @agendainflu →
            </a>
          </div>

          {/* Direita — accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-2xl border border-white/8 px-5 overflow-hidden data-[state=open]:border-white/15 transition-colors"
                  style={{ background: "#13131A" }}
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline text-white hover:text-[#FF2D87] transition-colors py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/50 leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* CTA final — blob colorido, não retângulo perfeito */}
        <div className="mt-24 relative overflow-hidden rounded-[40px]">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #FF2D87 0%, #7C3AED 55%, #00D4FF 100%)" }}
          />
          {/* Formas orgânicas sobre o gradiente */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 400, height: 400,
              borderRadius: "60% 40% 50% 50% / 40% 60% 40% 60%",
              background: "rgba(255,255,255,0.08)",
              top: -100, right: -80,
              filter: "blur(2px)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 250, height: 250,
              borderRadius: "40% 60% 70% 30% / 60% 40% 60% 40%",
              background: "rgba(255,255,255,0.06)",
              bottom: -80, left: "20%",
            }}
          />

          <div className="relative z-10 px-10 py-16 text-center">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">🚀 comece hoje</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Pronta para transformar
              <br />seu conteúdo em negócio?
            </h2>
            <p className="text-white/70 max-w-md mx-auto text-sm mb-8">
              Crie sua página grátis, compartilhe seu link e comece a receber agendamentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#FF2D87] hover:bg-white/90 font-bold px-10 rounded-full shadow-lg h-13"
                asChild
              >
                <Link href="/cadastro-influenciadora">
                  Criar minha página grátis
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button
                size="lg"
                className="border border-white/40 text-white bg-transparent hover:bg-white/10 px-8 rounded-full h-13"
                asChild
              >
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
            <p className="text-white/40 text-xs mt-6">
              Gratuito · Sem compromisso · Aprovação em 48h
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
