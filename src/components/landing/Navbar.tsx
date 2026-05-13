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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/6" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo — sem ícone tech, só tipografia */}
        <Link href="/" className="font-display text-xl font-bold">
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

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#como-funciona"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Como funciona
          </Link>
          <Link
            href="#features"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Recursos
          </Link>

          {!loading && !user && (
            <>
              <Link
                href="/cadastro-influenciadora"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Sou influenciadora
              </Link>
              <Button
                variant="hero"
                size="sm"
                className="btn-shimmer rounded-full px-6"
                asChild
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <>
              <Button variant="hero" size="sm" className="btn-shimmer rounded-full px-6" asChild>
                <Link href={getDashboardLink()} prefetch={false}>
                  {getDashboardLabel()}
                </Link>
              </Button>
              <button
                onClick={signOut}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0F] border-b border-white/6 px-6 pb-6 space-y-4 animate-fade-in">
          <Link
            href="#como-funciona"
            className="block text-sm text-white/60 hover:text-white pt-4"
            onClick={() => setIsOpen(false)}
          >
            Como funciona
          </Link>
          <Link
            href="#features"
            className="block text-sm text-white/60 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Recursos
          </Link>

          {!loading && !user && (
            <>
              <Link
                href="/cadastro-influenciadora"
                className="block text-sm text-white/60 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Sou influenciadora
              </Link>
              <Button variant="hero" size="sm" className="w-full btn-shimmer rounded-full" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>Entrar</Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <>
              <Button variant="hero" size="sm" className="w-full btn-shimmer rounded-full" asChild>
                <Link href={getDashboardLink()} prefetch={false} onClick={() => setIsOpen(false)}>
                  {getDashboardLabel()}
                </Link>
              </Button>
              <button
                className="w-full flex items-center gap-2 text-sm text-white/40 py-2"
                onClick={async () => { await signOut(); setIsOpen(false); }}
              >
                <LogOut size={15} /> Sair
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
