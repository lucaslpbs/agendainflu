'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  const redirectByRole = (role: string) => {
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "influencer") {
      router.push("/painel");
    } else {
      router.push("/cliente/explorar");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Exchange Supabase token for the app JWT (sets auth-token cookie)
    const accessToken = data.session?.access_token;
    if (accessToken) {
      const res = await fetch('/api/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase_token: accessToken }),
      });
      const exchanged = res.ok ? await res.json() : null;
      setLoading(false);
      toast.success("Login realizado com sucesso!");
      redirectByRole(exchanged?.role ?? 'client');
    } else {
      setLoading(false);
      toast.error("Erro ao obter sessão. Tente novamente.");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
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

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Não tem conta?</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/cadastro-cliente" className="text-primary font-medium hover:underline">
                  Sou empresa/cliente
                </Link>
                <span className="hidden sm:inline text-border">|</span>
                <Link href="/cadastro-influenciadora" className="text-accent font-medium hover:underline">
                  Sou influenciadora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
