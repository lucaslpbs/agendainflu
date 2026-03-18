'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Building2, User, FileText } from "lucide-react";

type TipoPessoa = "pj" | "pf";

const CadastroCliente = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("pj");
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", whatsapp: "",
    cpf: "", cnpj: "", razao_social: "", endereco: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const formatCPF = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    return nums.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCNPJ = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 14);
    return nums.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: { emailRedirectTo: process.env.NEXT_PUBLIC_APP_URL },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar conta");

      // 2. Criar client_profile + role via API Route [FIX P2, P3]
      const res = await fetch('/api/auth/register/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authData.user.id,
          tipo_pessoa: tipoPessoa,
          nome: form.nome,
          email: form.email,
          whatsapp: form.whatsapp,
          cpf: tipoPessoa === "pf" ? form.cpf : null,
          cnpj: tipoPessoa === "pj" ? form.cnpj : null,
          razao_social: tipoPessoa === "pj" ? form.razao_social : null,
          endereco: form.endereco,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar perfil');
      }

      toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Cadastre sua <span className="text-gradient-gold">empresa</span>
            </h1>
            <p className="text-muted-foreground">
              Crie sua conta para contratar influenciadoras e gerenciar suas campanhas.
            </p>
          </div>

          {/* Tipo de pessoa selector */}
          <div className="flex gap-3 mb-6 justify-center">
            <button
              type="button"
              onClick={() => setTipoPessoa("pj")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                tipoPessoa === "pj"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Building2 size={18} /> Pessoa Jurídica
            </button>
            <button
              type="button"
              onClick={() => setTipoPessoa("pf")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                tipoPessoa === "pf"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <User size={18} /> Pessoa Física
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
            {/* Nome & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {tipoPessoa === "pj" ? "Nome do responsável" : "Nome completo"} *
                </label>
                <input type="text" value={form.nome} onChange={(e) => update("nome", e.target.value)} required placeholder="Seu nome"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail *</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="seu@empresa.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* Senha & WhatsApp */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Senha *</label>
                <input type="password" value={form.senha} onChange={(e) => update("senha", e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">WhatsApp *</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* PJ fields */}
            {tipoPessoa === "pj" && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">CNPJ *</label>
                    <input type="text" value={form.cnpj} onChange={(e) => update("cnpj", formatCNPJ(e.target.value))} required placeholder="00.000.000/0000-00"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Razão Social *</label>
                    <input type="text" value={form.razao_social} onChange={(e) => update("razao_social", e.target.value)} required placeholder="Nome da empresa"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </>
            )}

            {/* PF field */}
            {tipoPessoa === "pf" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">CPF *</label>
                <input type="text" value={form.cpf} onChange={(e) => update("cpf", formatCPF(e.target.value))} required placeholder="000.000.000-00"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}

            {/* Endereço */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Endereço comercial *</label>
              <input type="text" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} required placeholder="Rua, número, cidade - estado"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <Button variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Ao se cadastrar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CadastroCliente;
