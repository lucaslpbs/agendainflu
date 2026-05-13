'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload, CheckCircle2, Zap, ArrowRight, ArrowLeft,
  User, Instagram, Camera
} from "lucide-react";
import Link from "next/link";

const nichos = [
  "Moda", "Beleza", "Fitness", "Gastronomia", "Viagem",
  "Tecnologia", "Lifestyle", "Maternidade", "Pets", "Educação"
];

type FormData = {
  nome: string;
  email: string;
  senha: string;
  whatsapp: string;
  instagram: string;
  seguidores: string;
  nicho: string;
  bio: string;
};

const STEPS = [
  { label: "Dados básicos", icon: User },
  { label: "Perfil Instagram", icon: Instagram },
  { label: "Foto & Confirmação", icon: Camera },
];

const CadastroInfluenciadora = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 'success'>(0);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    nome: "", email: "", senha: "", whatsapp: "",
    instagram: "", seguidores: "", nicho: "", bio: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [usernamePreview, setUsernamePreview] = useState("");

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.nome || !form.email || !form.senha || !form.whatsapp) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
      if (form.senha.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!form.instagram || !form.nicho) {
        toast.error("Preencha Instagram e nicho");
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          emailRedirectTo: (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) + '/auth/callback',
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar conta");

      let foto_url = null;
      if (foto) {
        const ext = foto.name.split(".").pop();
        const path = `${authData.user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, foto);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          foto_url = urlData.publicUrl;
        }
      }

      const res = await fetch('/api/auth/register/influencer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authData.user.id,
          nome: form.nome,
          whatsapp: form.whatsapp,
          bio: form.bio,
          nicho: form.nicho,
          seguidores: form.seguidores ? (parseInt(form.seguidores.replace(/\D/g, ''), 10) || null) : null,
          instagram: form.instagram,
          foto_url,
          email: form.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar perfil');
      }

      const { influencer_id } = await res.json();
      setInfluencerId(influencer_id);
      toast.success("Cadastro enviado! Verifique seu e-mail para confirmar a conta.");
      setStep('success');
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ─────────────────────────────────────── */
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#FF2D87]/15 border border-[#FF2D87]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-[#FF2D87]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cadastro realizado!</h1>
            <p className="text-white/50 text-sm">
              Confirme seu e-mail e aguarde a aprovação da nossa equipe.
            </p>
          </div>

          <div className="card-gradient-border p-6 text-center space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Conecte seu Instagram</h2>
              <p className="text-sm text-white/50">
                Exiba seu feed automaticamente para os clientes e mantenha seus seguidores atualizados.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {influencerId ? (
                <a href={`/api/auth/instagram/connect?influencer_id=${influencerId}`}>
                  <Button variant="hero" className="w-full btn-shimmer">
                    Conectar com Instagram
                  </Button>
                </a>
              ) : (
                <Button variant="hero" className="w-full" disabled>
                  Conectar com Instagram
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-white/15 text-white/60 hover:text-white hover:border-white/25 bg-transparent"
                onClick={() => router.push("/login")}
              >
                Pular por agora
              </Button>
            </div>
            <p className="text-xs text-white/30">
              Você também pode conectar depois no painel de perfil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = step as 0 | 1 | 2;

  /* ── Main form ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 mb-10">
        <Zap size={20} className="text-[#FF2D87]" />
        <span className="font-display text-2xl font-bold text-white">Agenda</span>
        <span className="font-display text-2xl font-bold text-gradient-neon">Influ</span>
      </Link>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Crie sua <span className="text-gradient-neon">página grátis</span>
          </h1>
          <p className="text-white/50 text-sm">
            Preencha seus dados para análise. Após aprovação, seu perfil ficará ativo.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStep
                      ? "bg-[#FF2D87] text-white"
                      : i === currentStep
                      ? "bg-[#FF2D87]/20 text-[#FF2D87] border border-[#FF2D87]/40"
                      : "bg-white/8 text-white/30"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    i === currentStep ? "text-white" : "text-white/30"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF2D87] to-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form card */}
        <div className="card-gradient-border p-8 space-y-5">
          {/* ── Step 0: Dados básicos ── */}
          {currentStep === 0 && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Nome completo *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => update("nome", e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">E-mail *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Senha *</label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => update("senha", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">WhatsApp *</label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 1: Instagram profile ── */}
          {currentStep === 1 && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Instagram *</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => {
                      update("instagram", e.target.value)
                      const handle = e.target.value.replace('@', '').toLowerCase().replace(/[^a-z0-9._]/g, '')
                      setUsernamePreview(handle)
                    }}
                    placeholder="@seuinstagram"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                  {usernamePreview && (
                    <p className="text-xs text-white/40 mt-1">
                      Seu perfil: <span className="text-[#FF2D87] font-medium">agendainflu.vercel.app/{usernamePreview}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Nº de seguidores</label>
                  <input
                    type="text"
                    value={form.seguidores}
                    onChange={(e) => update("seguidores", e.target.value)}
                    placeholder="Ex: 50.000"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Nicho *</label>
                <select
                  value={form.nicho}
                  onChange={(e) => update("nicho", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#13131A] text-white text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors"
                >
                  <option value="" className="bg-[#13131A]">Selecione seu nicho</option>
                  {nichos.map((n) => (
                    <option key={n} value={n} className="bg-[#13131A]">{n}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Conte sobre você e seu trabalho..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 focus:ring-1 focus:ring-[#FF2D87]/30 transition-colors resize-none"
                />
              </div>
            </>
          )}

          {/* ── Step 2: Foto + confirm ── */}
          {currentStep === 2 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Foto de perfil</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF2D87]/40 transition-colors group relative overflow-hidden">
                  {fotoPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fotoPreview}
                        alt="preview"
                        className="w-24 h-24 rounded-full object-cover ring-2 ring-[#FF2D87]/40"
                      />
                      <p className="text-xs text-white/50">{foto?.name}</p>
                      <p className="text-xs text-[#FF2D87]">Clique para trocar</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-white/30 mb-3 group-hover:text-[#FF2D87]/60 transition-colors" size={36} />
                      <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                        Clique para enviar sua foto
                      </p>
                      <p className="text-xs text-white/25 mt-1">PNG, JPG até 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </label>
              </div>

              {/* Resumo */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/8">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Resumo do cadastro</p>
                {[
                  { label: "Nome", value: form.nome },
                  { label: "E-mail", value: form.email },
                  { label: "WhatsApp", value: form.whatsapp },
                  { label: "Instagram", value: form.instagram },
                  { label: "Nicho", value: form.nicho },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between text-sm">
                    <span className="text-white/40">{f.label}</span>
                    <span className="text-white font-medium">{f.value || "—"}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/30 text-center">
                Após o envio, nossa equipe analisará seu perfil em até 48h.
              </p>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 border-white/15 text-white/60 hover:text-white hover:border-white/25 bg-transparent"
                onClick={prevStep}
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
            )}

            {currentStep < 2 ? (
              <Button
                type="button"
                variant="hero"
                size="lg"
                className="flex-1 btn-shimmer"
                onClick={nextStep}
              >
                Continuar
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                variant="hero"
                size="lg"
                className="flex-1 btn-shimmer"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <>
                    Enviar para análise
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#FF2D87] hover:text-white transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CadastroInfluenciadora;
