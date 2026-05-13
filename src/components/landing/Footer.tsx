'use client'

import Link from "next/link";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: "#0A0A0F", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="container py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          {/* Logo + tagline */}
          <div>
            <Link href="/" className="font-display text-3xl font-bold block mb-3">
              <span className="text-white">agenda</span>
              <span
                style={{
                  background: "linear-gradient(135deg, #FF2D87, #7C3AED)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                influ
              </span>
            </Link>
            <p className="text-white/30 text-sm max-w-xs leading-relaxed">
              A plataforma para influenciadoras gerenciarem seus agendamentos com profissionalismo.
            </p>
          </div>

          {/* Links + social */}
          <div className="flex flex-col sm:flex-row gap-12">
            <div className="space-y-3">
              <p className="text-white/20 text-xs uppercase tracking-widest">Plataforma</p>
              <ul className="space-y-2">
                {[
                  { label: "Como funciona", href: "#como-funciona" },
                  { label: "Para influenciadoras", href: "/cadastro-influenciadora" },
                  { label: "Entrar", href: "/login" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-white/20 text-xs uppercase tracking-widest">Contato</p>
              <a
                href="https://instagram.com/agendainflu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/40 hover:text-[#FF2D87] transition-colors"
              >
                <Instagram size={15} />
                @agendainflu
              </a>
              <p className="text-xs text-white/20">Direct em até 24h</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/6 flex items-center justify-between text-xs text-white/20">
          <span>© 2026 AgendaInflu</span>
          <span>Todos os direitos reservados</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
