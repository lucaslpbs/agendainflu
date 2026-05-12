'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, isInfluencer, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isInfluencer) return "/painel";
    return "/cliente";
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin";
    if (isInfluencer) return "Meu Painel";
    return "Minha Conta";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border transition-all duration-300 ${scrolled ? "bg-background/95 shadow-sm" : "bg-background/80"}`}>
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          Agenda<span className="text-gradient-gold">Influ</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#como-funciona" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Como funciona
          </Link>
          <Link href="#influenciadoras" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Influenciadoras
          </Link>

          {!loading && !user && (
            <>
              <Link href="/cadastro-influenciadora" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Sou influenciadora
              </Link>
              <Button variant="hero" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <>
              <Button variant="hero" size="sm" asChild>
                <Link href={getDashboardLink()} prefetch={false}>{getDashboardLabel()}</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
                <LogOut size={16} />
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-3 animate-fade-in">
          <Link href="#como-funciona" className="block text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>
            Como funciona
          </Link>
          <Link href="#influenciadoras" className="block text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>
            Influenciadoras
          </Link>

          {!loading && !user && (
            <>
              <Link href="/cadastro-influenciadora" className="block text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>
                Sou influenciadora
              </Link>
              <Button variant="hero" size="sm" className="w-full" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>Entrar</Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <>
              <Button variant="hero" size="sm" className="w-full" asChild>
                <Link href={getDashboardLink()} prefetch={false} onClick={() => setIsOpen(false)}>{getDashboardLabel()}</Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={async () => { await signOut(); setIsOpen(false); }}>
                <LogOut size={16} /> Sair
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
