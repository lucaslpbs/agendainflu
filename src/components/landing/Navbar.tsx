import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-display text-2xl font-bold text-primary">
          Agenda<span className="text-gradient-gold">Influ</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Como funciona
          </Link>
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Influenciadoras
          </Link>
          <Link to="/cadastro-influenciadora" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Sou influenciadora
          </Link>
          <Button variant="hero" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-3 animate-fade-in">
          <Link to="/" className="block text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>
            Como funciona
          </Link>
          <Link to="/" className="block text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>
            Influenciadoras
          </Link>
          <Link to="/cadastro-influenciadora" className="block text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>
            Sou influenciadora
          </Link>
          <Button variant="hero" size="sm" className="w-full" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
