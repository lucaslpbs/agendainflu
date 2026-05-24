'use client'

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { Upload, Instagram, CheckCircle2, AlertCircle, Loader2, X, ImagePlus, CreditCard, Link2Off } from "lucide-react";

const PerfilPage = () => {
  const { influencer, refreshInfluencer } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [mpDisconnecting, setMpDisconnecting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [photosUploading, setPhotosUploading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    bio: "",
    nicho: "",
    instagram: "",
    whatsapp: "",
    seguidores: "",
  });

  // Handle OAuth redirect results
  useEffect(() => {
    const igParam = searchParams.get("instagram");
    if (igParam === "conectado") {
      toast.success("Instagram conectado com sucesso!");
      refreshInfluencer();
    } else if (igParam === "erro") {
      toast.error("Falha ao conectar Instagram. Tente novamente.");
    }

    const mpParam = searchParams.get("mp");
    if (mpParam === "conectado") {
      toast.success("Mercado Pago conectado! Agora os pagamentos são divididos automaticamente.");
      refreshInfluencer();
    } else if (mpParam === "erro") {
      toast.error("Falha ao conectar Mercado Pago. Tente novamente.");
    }
  }, [searchParams]);

  const handleDisconnectMP = async () => {
    if (!influencer) return;
    setMpDisconnecting(true);
    try {
      await apiFetch('/api/auth/mercadopago/disconnect', { method: 'POST' });
      toast.success("Mercado Pago desconectado.");
      refreshInfluencer();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMpDisconnecting(false);
    }
  };

  useEffect(() => {
    if (!influencer) return;
    setForm({
      nome: influencer.nome || "",
      bio: influencer.bio || "",
      nicho: influencer.nicho || "",
      instagram: influencer.instagram || "",
      whatsapp: influencer.whatsapp || "",
      seguidores: (influencer as any).instagram_connected
        ? String((influencer as any).instagram_followers_count ?? influencer.seguidores ?? "")
        : String(influencer.seguidores ?? ""),
    });
  }, [influencer]);

  const handleSave = async () => {
    if (!influencer) return;
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        nome: form.nome,
        bio: form.bio,
        nicho: form.nicho,
        instagram: form.instagram,
        whatsapp: form.whatsapp,
      };
      // Only update manual seguidores when Instagram is not connected
      if (!(influencer as any).instagram_connected) {
        payload.seguidores = form.seguidores;
      }
      await apiFetch('/api/influencers/' + influencer.username, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
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
    await apiFetch('/api/influencers/' + influencer.username, {
      method: 'PATCH',
      body: JSON.stringify({ foto_url: data.publicUrl }),
    });
    toast.success("Foto atualizada!");
    refreshInfluencer();
  };

  const handleCoverUpload = async (file: File) => {
    if (!influencer) return;
    setCoverUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${influencer.id}/cover/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("influencer-photos").upload(path, file, { upsert: true });
      if (uploadError) { toast.error(uploadError.message); return; }
      const { data } = supabase.storage.from("influencer-photos").getPublicUrl(path);
      await supabase.from("influencers").update({ cover_url: data.publicUrl }).eq("id", influencer.id);
      toast.success("Capa atualizada!");
      refreshInfluencer();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleAddPhoto = async (file: File) => {
    if (!influencer) return;
    const currentPhotos: string[] = (influencer as any).fotos || [];
    if (currentPhotos.length >= 6) { toast.error("Máximo de 6 fotos permitidas."); return; }
    setPhotosUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${influencer.id}/photos/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("influencer-photos").upload(path, file, { upsert: true });
      if (uploadError) { toast.error(uploadError.message); return; }
      const { data } = supabase.storage.from("influencer-photos").getPublicUrl(path);
      const updatedPhotos = [...currentPhotos, data.publicUrl];
      await supabase.from("influencers").update({ fotos: updatedPhotos }).eq("id", influencer.id);
      toast.success("Foto adicionada!");
      refreshInfluencer();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhotosUploading(false);
    }
  };

  const handleRemovePhoto = async (url: string) => {
    if (!influencer) return;
    const currentPhotos: string[] = (influencer as any).fotos || [];
    const updatedPhotos = currentPhotos.filter(p => p !== url);
    try {
      await supabase.from("influencers").update({ fotos: updatedPhotos }).eq("id", influencer.id);
      toast.success("Foto removida!");
      refreshInfluencer();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!influencer) return;
    setDisconnecting(true);
    try {
      await apiFetch('/api/influencers/' + influencer.username, {
        method: 'PATCH',
        body: JSON.stringify({ instagram_connected: false }),
      });
      toast.success("Instagram desconectado.");
      refreshInfluencer();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDisconnecting(false);
    }
  };

  const statusLabel: Record<string, string> = {
    em_analise: "⏳ Em análise",
    ativa: "✅ Ativa",
    suspensa: "⚠️ Suspensa",
    rejeitada: "❌ Rejeitada",
  };

  const igConnected = (influencer as any)?.instagram_connected;
  const igUsername = (influencer as any)?.instagram_username;
  const igFollowers = (influencer as any)?.instagram_followers_count;
  const igUpdatedAt = (influencer as any)?.instagram_followers_updated_at;

  const mpConnected = (influencer as any)?.mp_connected;
  const mpUserId = (influencer as any)?.mp_user_id;
  const mpConnectedAt = (influencer as any)?.mp_connected_at;

  return (
    <PanelLayout>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-xl font-bold">Meu Perfil</h2>

        {/* Profile card */}
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                />
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
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                  Seguidores
                  {igConnected && (
                    <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Atualizado automaticamente
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.seguidores}
                  onChange={(e) => setForm({ ...form, seguidores: e.target.value })}
                  readOnly={!!igConnected}
                  className={`w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm ${igConnected ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {igConnected && igUpdatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Atualizado em {new Date(igUpdatedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
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

        {/* Cover photo card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Foto de Capa</h3>
          {(influencer as any).cover_url ? (
            <div className="relative w-full h-36 rounded-lg overflow-hidden mb-4 border border-border">
              <img src={(influencer as any).cover_url} alt="Capa" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-36 rounded-lg bg-secondary flex items-center justify-center mb-4 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Nenhuma capa cadastrada</p>
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                {coverUploading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Upload size={14} className="mr-1" />}
                {(influencer as any).cover_url ? "Trocar capa" : "Enviar capa"}
              </span>
            </Button>
            <input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
          </label>
        </div>

        {/* Profile photos card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Fotos do Perfil <span className="text-xs text-muted-foreground font-normal">(máx. 6)</span></h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {((influencer as any).fotos as string[] || []).map((url: string) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                <img src={url} alt="Foto" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemovePhoto(url)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {((influencer as any).fotos?.length ?? 0) < 6 && (
              <label className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                {photosUploading ? <Loader2 size={20} className="animate-spin text-muted-foreground" /> : <ImagePlus size={20} className="text-muted-foreground" />}
                <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
                <input type="file" accept="image/*" className="hidden" disabled={photosUploading} onChange={(e) => e.target.files?.[0] && handleAddPhoto(e.target.files[0])} />
              </label>
            )}
          </div>
        </div>

        {/* Instagram connection card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Instagram size={20} className="text-primary" />
            <h3 className="font-semibold">Instagram</h3>
          </div>

          {igConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="font-medium">
                  @{igUsername}
                  {igFollowers != null && (
                    <span className="text-muted-foreground font-normal ml-1">· {igFollowers.toLocaleString('pt-BR')} seguidores</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Feed conectado e atualizado automaticamente para os clientes.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectInstagram}
                disabled={disconnecting}
              >
                {disconnecting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Conecte seu Instagram para exibir seu feed automaticamente para os clientes e manter seus seguidores atualizados.</p>
              </div>
              <a href="/api/auth/instagram/connect">
                <Button variant="hero" size="sm" className="flex items-center gap-2">
                  <Instagram size={15} />
                  Conectar Instagram ao perfil
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Mercado Pago connection */}
        <div className={`bg-card rounded-xl border p-6 ${mpConnected ? "border-green-500/40" : "border-yellow-500/40"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${mpConnected ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                <CreditCard size={20} className={mpConnected ? "text-green-500" : "text-yellow-600"} />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Mercado Pago
                  {mpConnected && (
                    <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Conectado
                    </span>
                  )}
                </h3>
                {mpConnected ? (
                  <p className="text-sm text-muted-foreground">
                    ID: <span className="font-mono text-xs">{mpUserId}</span>
                    {mpConnectedAt && (
                      <> · Desde {new Date(mpConnectedAt).toLocaleDateString("pt-BR")}</>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Conecte sua conta para receber os pagamentos automaticamente via split.
                  </p>
                )}
              </div>
            </div>

            {mpConnected ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                disabled={mpDisconnecting}
                onClick={handleDisconnectMP}
              >
                {mpDisconnecting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Link2Off size={14} className="mr-1" />}
                Desconectar
              </Button>
            ) : (
              <a href="/api/auth/mercadopago/connect">
                <Button variant="hero" size="sm" className="shrink-0">
                  <CreditCard size={14} className="mr-1.5" />
                  Conectar MP
                </Button>
              </a>
            )}
          </div>

          {!mpConnected && (
            <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-xs text-muted-foreground">
              <strong className="text-yellow-600">Importante:</strong> Sem a conexão, os pagamentos vão para a conta da plataforma e são repassados manualmente. Com a conexão, o split é automático — você recebe direto na sua conta MP.
            </div>
          )}
        </div>

        {/* Public link */}
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
