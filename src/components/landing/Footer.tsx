'use client'

import Link from "next/link";
import { Instagram, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            Agenda<span className="text-gradient-gold">Influ</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Como funciona</Link>
            <Link href="/cadastro-influenciadora" className="hover:text-primary transition-colors">Para influenciadoras</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Entrar</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          Feito com <Heart size={12} className="text-primary fill-primary" /> AgendaInflu © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
