const steps = [
  {
    num: "01",
    title: "Crie seu perfil",
    description: "Cadastre-se, adicione seus serviços e preços. Em minutos você tem uma página profissional.",
    color: "#FF2D87",
    tag: "5 minutos",
  },
  {
    num: "02",
    title: "Compartilhe seu link",
    description: "Você recebe um link único — agendainflu.com/seunome — só compartilhar com marcas e clientes.",
    color: "#7C3AED",
    tag: "1 link",
  },
  {
    num: "03",
    title: "Receba agendamentos",
    description: "Marcas agendam diretamente. Você aprova, gerencia e acompanha tudo no painel.",
    color: "#00D4FF",
    tag: "no controle",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-28 relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      {/* Blob decorativo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400, height: 400,
          borderRadius: "70% 30% 60% 40% / 40% 70% 30% 60%",
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          top: "20%", right: -100,
          filter: "blur(60px)",
        }}
      />

      <div className="container relative z-10">
        {/* Título — alinhado à esquerda, assimétrico */}
        <div className="max-w-2xl mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Funciona assim,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D87, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              simples assim.
            </span>
          </h2>
        </div>

        {/* Steps — staggered vertical, não grid */}
        <div className="space-y-0 max-w-3xl">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group relative flex gap-8 md:gap-16 items-start animate-fade-in"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {/* Linha vertical + número */}
              <div className="flex flex-col items-center flex-shrink-0 w-16">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
                  style={{
                    background: `${step.color}20`,
                    border: `1px solid ${step.color}40`,
                    color: step.color,
                  }}
                >
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-px flex-1 mt-3"
                    style={{
                      minHeight: 64,
                      background: `linear-gradient(to bottom, ${step.color}40, transparent)`,
                    }}
                  />
                )}
              </div>

              {/* Conteúdo — alternando posição em desktop */}
              <div
                className={`pb-14 flex-1 ${i % 2 === 1 ? "md:pr-32" : ""}`}
              >
                {/* Tag pill */}
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
                  style={{
                    background: `${step.color}15`,
                    color: step.color,
                  }}
                >
                  {step.tag}
                </span>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#FF2D87] transition-colors">
                  {step.title}
                </h3>
                <p className="text-white/50 leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
