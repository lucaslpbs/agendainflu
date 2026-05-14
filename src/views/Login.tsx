'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

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
      if (error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_credentials')) {
        toast.error('E-mail ou senha incorretos. Verifique e tente novamente.')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('E-mail não confirmado. Verifique sua caixa de entrada e confirme seu cadastro.')
      } else if (error.message.includes('Too many requests')) {
        toast.error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      } else {
        toast.error(error.message)
      }
      return;
    }

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
      if (error.message.includes('rate limit') ||
          error.message.includes('Too many requests')) {
        toast.error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      } else {
        toast.error('Erro ao enviar o link. Verifique o e-mail e tente novamente.')
      }
    } else {
      toast.success("Link de acesso enviado para seu e-mail!");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#0A0A0F" }}
    >
      {/* Background orbs */}
      <div className="absolute w-96 h-96 rounded-full bg-[#FF2D87]/8 blur-[120px] -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-[#7C3AED]/8 blur-[120px] -bottom-20 -left-20 pointer-events-none" />

      {/* Logo topo */}
      <Link href="/" className="flex items-center gap-1.5 mb-10 group">
        <Zap size={22} className="text-[#FF2D87] group-hover:animate-glow-pulse" />
        <span className="font-display text-2xl font-bold text-white">Agenda</span>
        <span className="font-display text-2xl font-bold text-gradient-neon">Influ</span>
      </Link>

      <div className="w-full max-w-md mx-auto px-4">
        {/* Card */}
        <div className="card-gradient-border p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Bem-vinda de volta
            </h1>
            <p className="text-sm text-white/40">
              Entre na sua conta AgendaInflu
            </p>
          </div>

          <form
            onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
            className="space-y-4"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            {mode === "password" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <Button
              variant="hero"
              className="w-full btn-shimmer h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Aguarde...
                </span>
              ) : (
                <>
                  {mode === "password" ? "Entrar" : "Enviar Magic Link"}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30">ou</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Magic link toggle */}
          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:border-white/20 hover:bg-white/8 transition-all"
          >
            <Sparkles size={15} />
            {mode === "password" ? "Entrar com Magic Link" : "Entrar com senha"}
          </button>

          {/* Sign up links */}
          <div className="text-center text-sm text-white/40 space-y-2">
            <p>Não tem conta?</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/cadastro-cliente"
                className="text-[#00D4FF] font-medium hover:text-white transition-colors"
              >
                Sou empresa/cliente
              </Link>
              <span className="hidden sm:inline text-white/20">|</span>
              <Link
                href="/cadastro-influenciadora"
                className="text-[#FF2D87] font-medium hover:text-white transition-colors"
              >
                Sou influenciadora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
