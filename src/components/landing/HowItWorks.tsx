import { Search, CalendarCheck, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Escolha a influenciadora",
    description: "Navegue pelos perfis verificados e encontre a influenciadora ideal para o seu nicho.",
  },
  {
    icon: CalendarCheck,
    title: "Agende sua divulgação",
    description: "Selecione o tipo de serviço, escolha a data disponível e envie os materiais.",
  },
  {
    icon: Sparkles,
    title: "Acompanhe o resultado",
    description: "Receba a confirmação e acompanhe o status da sua divulgação em tempo real.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como <span className="text-gradient-gold">funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Em apenas 3 passos simples, sua marca estará sendo divulgada.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 z-0" />
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative bg-card rounded-2xl p-8 text-center shadow-sm border border-border hover:shadow-rosa hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-14 h-14 rounded-2xl gradient-rosa flex items-center justify-center mx-auto mb-5">
                <step.icon className="text-primary-foreground" size={24} />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
