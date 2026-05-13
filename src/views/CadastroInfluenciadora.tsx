'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Upload, CheckCircle2 } from "lucide-react";

const nichos = ["Moda", "Beleza", "Fitness", "Gastronomia", "Viagem", "Tecnologia", "Lifestyle", "Maternidade", "Pets", "Educação"];

const CadastroInfluenciadora = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'instagram'>('form');
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", whatsapp: "", instagram: "", seguidores: "", nicho: "", bio: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [usernamePreview, setUsernamePreview] = useState("");

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: { emailRedirectTo: (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) + '/auth/callback' },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar conta");

      // 2. Upload foto if exists
      let foto_url = null;
      if (foto) {
        const ext = foto.name.split(".").pop();
        const path = `${authData.user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, foto);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          foto_url = urlData.publicUrl;
        }
      }

      // 3. Create influencer profile via API
      const res = await fetch('/api/auth/register/influencer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authData.user.id,
          nome: form.nome,
          whatsapp: form.whatsapp,
          bio: form.bio,
          nicho: form.nicho,
          seguidores: form.seguidores,
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

      toast.success("Cadastro enviado para análise! Verifique seu e-mail para confirmar a conta.");
      setInfluencerId(influencer_id);
      setStep('instagram');
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'instagram') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="container max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Cadastro realizado!</h1>
              <p className="text-muted-foreground text-sm">
                Confirme seu e-mail e aguarde a aprovação da nossa equipe.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm text-center space-y-5">
              <div>
                <h2 className="text-lg font-semibold mb-1">Conecte seu Instagram</h2>
                <p className="text-sm text-muted-foreground">
                  Isso permite exibir seu feed automaticamente para os clientes e manter seus seguidores atualizados.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {influencerId ? (
                  <a href={`/api/auth/instagram/connect?influencer_id=${influencerId}`}>
                    <Button variant="hero" className="w-full">
                      Conectar com Instagram
                    </Button>
                  </a>
                ) : (
                  <Button variant="hero" className="w-full" disabled>
                    Conectar com Instagram
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                  Pular por agora
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Você também pode conectar depois no seu painel de perfil.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Cadastre-se como <span className="text-gradient-gold">influenciadora</span>
            </h1>
            <p className="text-muted-foreground">
              Preencha seus dados para análise. Após aprovação, seu perfil ficará disponível na plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome completo *</label>
                <input type="text" value={form.nome} onChange={(e) => update("nome", e.target.value)} required placeholder="Seu nome" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail *</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="seu@email.com" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Senha *</label>
                <input type="password" value={form.senha} onChange={(e) => update("senha", e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">WhatsApp *</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Instagram *</label>
                <input type="text" value={form.instagram} onChange={(e) => {
                  update("instagram", e.target.value)
                  const handle = e.target.value.replace('@', '').toLowerCase().replace(/[^a-z0-9._]/g, '')
                  setUsernamePreview(handle)
                }} required placeholder="@seuinstagram" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {usernamePreview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Seu perfil será: <span className="text-primary font-medium">agendainflu.vercel.app/{usernamePreview}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nº de seguidores</label>
                <input type="text" value={form.seguidores} onChange={(e) => update("seguidores", e.target.value)} placeholder="Ex: 50.000" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Nicho *</label>
              <select value={form.nicho} onChange={(e) => update("nicho", e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione seu nicho</option>
                {nichos.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Conte sobre você e seu trabalho..." className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Foto de perfil</label>
              <label className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors block">
                <Upload className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-sm text-muted-foreground">{foto ? foto.name : "Clique para enviar sua foto"}</p>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
              </label>
            </div>

            <Button variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Enviando..." : "Enviar para análise"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Após o envio, nossa equipe analisará seu perfil em até 48h.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CadastroInfluenciadora;
