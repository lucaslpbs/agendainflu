import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/painel");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/painel" },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Link de acesso enviado para seu e-mail!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="w-full max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Bem-vinda de volta</h1>
            <p className="text-muted-foreground">Entre na sua conta AgendaInflu</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
            <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {mode === "password" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              <Button variant="hero" className="w-full" size="lg" disabled={loading}>
                {loading ? "Aguarde..." : mode === "password" ? "Entrar" : "Enviar Magic Link"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => setMode(mode === "password" ? "magic" : "password")}
            >
              {mode === "password" ? "Entrar com Magic Link" : "Entrar com senha"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link to="/cadastro-influenciadora" className="text-primary font-medium hover:underline">
                Cadastre-se como influenciadora
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
