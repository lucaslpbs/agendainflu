import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"
import Link from "next/link"

const faqs = [
  {
    q: "Como funciona o agendamento?",
    a: "Basta acessar o perfil da influenciadora, escolher o tipo de divulgação, selecionar a data disponível e preencher os detalhes. Simples assim!",
  },
  {
    q: "Preciso pagar pela plataforma?",
    a: "A plataforma AgendaInflu é gratuita para uso. O pagamento da divulgação é combinado diretamente entre você e a influenciadora.",
  },
  {
    q: "Como me cadastro como influenciadora?",
    a: "Clique em 'Sou influenciadora', preencha o formulário com seus dados e aguarde a análise da nossa equipe. Você será notificada assim que seu perfil for aprovado.",
  },
  {
    q: "Posso cancelar um agendamento?",
    a: "Sim! Cancelamentos podem ser feitos com até 48h de antecedência, conforme a política de cada influenciadora.",
  },
  {
    q: "Quais tipos de divulgação estão disponíveis?",
    a: "Stories, Reels, Feed, combos de Reels + Stories e até divulgações presenciais. Cada influenciadora define seus serviços e preços.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container max-w-2xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas <span className="text-gradient-gold">frequentes</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-rosa transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-rose-500 to-primary p-px">
          <div className="rounded-3xl bg-gradient-to-br from-primary/95 to-rose-600/95 px-8 py-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-sm font-medium">
                🚀 Comece hoje mesmo
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Pronto para divulgar<br />sua marca?
              </h2>
              <p className="text-white/80 max-w-md mx-auto">
                Conecte-se com as melhores influenciadoras e aumente seu alcance agora mesmo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8" asChild>
                  <Link href="/lista-espera">Quero divulgar minha marca</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8" asChild>
                  <Link href="/cadastro-influenciadora">Sou influenciadora</Link>
                </Button>
              </div>
              <p className="text-white/50 text-xs">
                Gratuito para usar • Sem compromisso • Aprovação em 48h
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
