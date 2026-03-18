'use client'

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const ListaEspera = () => {
  const params = useParams();
  const username = params?.username as string | undefined;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", empresa: "", mensagem: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find influencer_id by username if provided
      let influencer_id = null;
      if (username) {
        const res = await fetch('/api/influencers/' + username);
        if (res.ok) {
          const { influencer } = await res.json();
          influencer_id = influencer?.id || null;
        }
      }

      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencer_id,
          nome: form.nome,
          whatsapp: form.whatsapp,
          email: form.email || null,
          empresa: form.empresa || null,
          mensagem: form.mensagem || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao enviar');
      }
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center max-w-md mx-auto p-8 animate-fade-in">
            <div className="text-5xl mb-4">💖</div>
            <h1 className="text-2xl font-bold mb-3">Recebemos sua solicitação!</h1>
            <p className="text-muted-foreground mb-6">
              Em breve você será contatado(a) via WhatsApp. Fique de olho nas mensagens!
            </p>
            <Button variant="hero" onClick={() => router.push("/")}>Voltar ao início</Button>
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
        <div className="container max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Lista de espera</h1>
            <p className="text-muted-foreground">
              {username
                ? `Preencha seus dados para solicitar divulgação com @${username}.`
                : "Preencha seus dados para entrar na lista de espera."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome completo *</label>
              <input type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">WhatsApp *</label>
              <input type="tel" required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome da empresa/negócio</label>
              <input type="text" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Sua empresa" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
              <textarea rows={3} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} placeholder="Por que quer divulgar com essa influenciadora?" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <Button variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Enviando..." : "Entrar na lista de espera"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListaEspera;
