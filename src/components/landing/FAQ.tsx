import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      </div>
    </section>
  );
};

export default FAQ;
