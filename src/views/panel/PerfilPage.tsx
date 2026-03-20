'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const PerfilPage = () => {
  const { influencer, refreshInfluencer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    bio: "",
    nicho: "",
    instagram: "",
    whatsapp: "",
    seguidores: "",
  });

  useEffect(() => {
    if (!influencer) return;
    setForm({
      nome: influencer.nome || "",
      bio: influencer.bio || "",
      nicho: influencer.nicho || "",
      instagram: influencer.instagram || "",
      whatsapp: influencer.whatsapp || "",
      seguidores: influencer.seguidores || "",
    });
  }, [influencer]);

  const handleSave = async () => {
    if (!influencer) return;
    setLoading(true);
    try {
      await apiFetch('/api/influencers/' + influencer.username, { method: 'PATCH', body: JSON.stringify(form) });
      toast.success("Perfil atualizado!");
      refreshInfluencer();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!influencer) return;
    const ext = file.name.split(".").pop();
    const path = `${influencer.user_id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) return toast.error(uploadError.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await apiFetch('/api/influencers/' + influencer.username, { method: 'PATCH', body: JSON.stringify({ foto_url: data.publicUrl }) });
    toast.success("Foto atualizada!");
    refreshInfluencer();
  };

  const statusLabel: Record<string, string> = {
    em_analise: "⏳ Em análise",
    ativa: "✅ Ativa",
    suspensa: "⚠️ Suspensa",
    rejeitada: "❌ Rejeitada",
  };

  return (
    <PanelLayout>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-xl font-bold">Meu Perfil</h2>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {influencer.foto_url ? (
                <img src={influencer.foto_url} alt="Foto" className="w-20 h-20 rounded-2xl object-cover border-2 border-rosa-light" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-rosa-light flex items-center justify-center text-primary text-2xl font-bold">
                  {influencer.nome?.charAt(0)}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:opacity-90">
                <Upload size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
              </label>
            </div>
            <div>
              <p className="font-semibold">{influencer.nome}</p>
              <p className="text-sm text-muted-foreground">@{influencer.username}</p>
              <p className="text-sm mt-1">{statusLabel[influencer.status]}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nicho</label>
                <input type="text" value={form.nicho} onChange={(e) => setForm({ ...form, nicho: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Seguidores</label>
                <input type="text" value={form.seguidores} onChange={(e) => setForm({ ...form, seguidores: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Instagram</label>
                <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              </div>
            </div>
            <Button variant="hero" onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-2">Link público do perfil</h3>
          <p className="text-sm text-muted-foreground bg-secondary rounded-lg px-4 py-2 font-mono">
            {process.env.NEXT_PUBLIC_APP_URL}/{influencer.username}
          </p>
        </div>
      </div>
    </PanelLayout>
  );
};

export default PerfilPage;
