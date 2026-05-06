'use client'

import Link from "next/link";
import { Instagram, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/40 border-t border-border">
      <div className="container py-12">
        {/* Trust stats bar */}
        <div className="grid grid-cols-3 gap-4 py-8 mb-8 border-b border-border/50">
          {[
            { value: "500+", label: "Marcas atendidas" },
            { value: "120+", label: "Influenciadoras ativas" },
            { value: "4.9★", label: "Avaliação média" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1: Logo + tagline */}
          <div className="space-y-3">
            <Link href="/" className="font-display text-xl font-bold text-primary block">
              Agenda<span className="text-gradient-gold">Influ</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A plataforma de agendamento para influenciadoras e marcas.
            </p>
          </div>

          {/* Col 2: Links */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Links</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</Link></li>
              <li><Link href="#influenciadoras" className="hover:text-primary transition-colors">Influenciadoras</Link></li>
              <li><Link href="/cadastro-influenciadora" className="hover:text-primary transition-colors">Para influenciadoras</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Entrar</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Fale conosco</p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram size={16} />
              @agendainflu
            </a>
            <p className="text-xs text-muted-foreground">Respondemos em até 24h via direct.</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-center text-xs text-muted-foreground gap-1">
          <Heart size={11} className="text-primary fill-primary" />
          AgendaInflu © 2026 — Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
};

export default Footer;
