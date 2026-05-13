const FeaturesSection = () => {
  return (
    <section id="features" className="py-28 relative overflow-hidden" style={{ background: "#0C0C14" }}>
      {/* Blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          borderRadius: "40% 60% 50% 50% / 60% 40% 60% 40%",
          background: "radial-gradient(circle, rgba(255,45,135,0.07) 0%, transparent 70%)",
          bottom: -100, left: "10%",
          filter: "blur(80px)",
        }}
      />

      <div className="container relative z-10">
        {/* Cabeçalho — partido, lado a lado */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Tudo que você
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #7C3AED, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              precisa, já incluso.
            </span>
          </h2>
          <p className="text-white/40 max-w-xs md:text-right text-sm leading-relaxed md:pb-2">
            Ferramentas para você gerenciar seu negócio de criação de conteúdo — sem planilha, sem WhatsApp bagunçado.
          </p>
        </div>

        {/* Layout mosaico — formas variadas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4">

          {/* Card grande — ocupa 2 colunas e 2 linhas */}
          <div
            className="col-span-2 row-span-2 rounded-[28px] p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #1C1024, #13131A)",
              border: "1px solid rgba(255,45,135,0.15)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,45,135,0.15) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
            <div>
              <div className="text-4xl mb-6">🔗</div>
              <h3 className="text-2xl font-bold text-white mb-3">Sua página personalizada</h3>
              <p className="text-white/50 leading-relaxed">
                Um link único com seu @. Compartilha no Instagram, no WhatsApp, na bio — e quem quiser, agenda.
              </p>
            </div>
            <div
              className="mt-8 inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "rgba(255,45,135,0.15)", color: "#FF2D87" }}
            >
              agendainflu.com/seunome
            </div>
          </div>

          {/* Card médio */}
          <div
            className="col-span-1 rounded-[24px] p-6 flex flex-col gap-3"
            style={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-3xl">📅</div>
            <h3 className="text-base font-bold text-white">Calendário próprio</h3>
            <p className="text-white/40 text-sm">Defina seus dias. Marcas só agendam quando você libera.</p>
          </div>

          {/* Card médio */}
          <div
            className="col-span-1 rounded-[24px] p-6 flex flex-col gap-3"
            style={{
              background: "linear-gradient(135deg, #1a0f2e, #13131A)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <div className="text-3xl">✅</div>
            <h3 className="text-base font-bold text-white">Você aprova tudo</h3>
            <p className="text-white/40 text-sm">Cada campanha passa pela sua mão antes de confirmar.</p>
          </div>

          {/* Card largo — ocupa 2 colunas */}
          <div
            className="col-span-2 rounded-[24px] p-6 flex gap-5 items-start"
            style={{
              background: "linear-gradient(135deg, #0f1a24, #13131A)",
              border: "1px solid rgba(0,212,255,0.15)",
            }}
          >
            <div className="text-4xl flex-shrink-0">📦</div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">Kit de mídia organizado</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Arquivos, briefings e materiais chegam direto no painel. Sem misturar no WhatsApp.
              </p>
            </div>
          </div>

          {/* Card pequeno */}
          <div
            className="col-span-1 rounded-[24px] p-6 flex flex-col gap-3"
            style={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-3xl">⭐</div>
            <h3 className="text-base font-bold text-white">Avaliações reais</h3>
            <p className="text-white/40 text-sm">Reputação que você pode mostrar.</p>
          </div>

          {/* Card pequeno */}
          <div
            className="col-span-1 rounded-[24px] p-6 flex flex-col gap-3"
            style={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-3xl">💰</div>
            <h3 className="text-base font-bold text-white">Preços seus</h3>
            <p className="text-white/40 text-sm">Você define Stories, Reels, Feed. Cada um com preço.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
