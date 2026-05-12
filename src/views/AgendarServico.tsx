'use client'

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Calendar, CheckCircle2, Clock, MessageCircle, ArrowLeft, Upload, X, Image } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

const serviceLabels: Record<string, string> = {
  stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
};

const AgendarServico = () => {
  const params = useParams();
  const username = params?.username as string;
  const searchParams = useSearchParams();
  const selectedServiceId = searchParams.get("service");
  const { user } = useAuth();
  const router = useRouter();

  const [influencer, setInfluencer] = useState<Tables<"influencers"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [existingClient, setExistingClient] = useState<Tables<"clients"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const [selectedService, setSelectedService] = useState(selectedServiceId || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [descricaoProduto, setDescricaoProduto] = useState("");
  const [linkNegocio, setLinkNegocio] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [kitMidiaFiles, setKitMidiaFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [availability, setAvailability] = useState<Record<string, { disponivel: boolean; bloqueado: boolean; slots_disponiveis: number; slots_ocupados: number }>>({});
  const [loadingDates, setLoadingDates] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    const fetchAll = async () => {
      // Influencer
      const { data: inf } = await supabase.from("influencers").select("*")
        .eq("username", username!).eq("status", "ativa").maybeSingle();
      setInfluencer(inf);

      if (!inf) { setLoading(false); return; }

      // Services
      const { data: svc } = await supabase.from("services").select("*")
        .eq("influencer_id", inf.id).eq("ativo", true);
      setServices(svc || []);

      // Client profile
      const { data: cp } = await supabase.from("client_profiles" as any).select("*")
        .eq("user_id", user!.id).maybeSingle();
      setClientProfile(cp);

      // Existing client relationship
      const { data: ec } = await supabase.from("clients").select("*")
        .eq("influencer_id", inf.id).eq("user_id", user!.id).maybeSingle();
      setExistingClient(ec);

      if (selectedServiceId) setSelectedService(selectedServiceId);
      setLoading(false);
    };
    fetchAll();
  }, [username, user]);

  useEffect(() => {
    if (!influencer) return;
    const fetchAvailability = async () => {
      setLoadingDates(true);
      try {
        const res = await fetch(`/api/influencers/${influencer.username}/availability?days=30`);
        const json = await res.json();
        const map: Record<string, any> = {};
        for (const d of (json.data || [])) {
          map[d.data] = d;
        }
        setAvailability(map);
      } catch {
        // fallback: todas as datas disponíveis
      } finally {
        setLoadingDates(false);
      }
    };
    fetchAvailability();
  }, [influencer]);

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    return format(addDays(new Date(), i + 2), "yyyy-MM-dd");
  }).filter(date => {
    const av = availability[date];
    if (!av) return true;
    return av.disponivel && !av.bloqueado;
  }).slice(0, 14);

  const chosenService = services.find(s => s.id === selectedService);
  const isOnlineService = chosenService && chosenService.formato === "online";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif'];

    const invalidFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isMimeOk = ALLOWED_TYPES.includes(file.type);
      const isExtOk = ALLOWED_EXTENSIONS.includes(ext);
      return !isMimeOk && !isExtOk;
    });

    if (invalidFiles.length > 0) {
      toast.error(`Formato inválido: ${invalidFiles.map(f => f.name).join(', ')}. Use apenas JPG, PNG ou HEIC.`);
      return;
    }

    if (kitMidiaFiles.length + files.length > 5) {
      toast.error("Máximo de 5 arquivos");
      return;
    }
    setKitMidiaFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setKitMidiaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !influencer || !selectedService || !selectedDate) return;

    // Validate kit mídia for online services
    if (isOnlineService && kitMidiaFiles.length === 0 && !descricaoProduto.trim()) {
      toast.error("Para serviços online, envie o kit mídia (fotos) ou descreva o produto.");
      return;
    }

    setSubmitting(true);

    try {
      // Upload kit mídia files (mantido no cliente)
      let materialUrls: string[] = [];
      if (kitMidiaFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of kitMidiaFiles) {
          const fileExt = file.name.split(".").pop();
          const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage.from("materials").upload(filePath, file);
          if (uploadErr) throw uploadErr;
          const { data: urlData } = supabase.storage.from("materials").getPublicUrl(filePath);
          materialUrls.push(urlData.publicUrl);
        }
        setUploadingFiles(false);
      }

      // Criar booking via API Route [FIX P1 código real, FIX P5 array]
      const token = typeof window !== 'undefined' ? localStorage.getItem('agenda-token') : null;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          influencer_id: influencer.id,
          service_id: selectedService,
          data_agendada: selectedDate,
          descricao_produto: descricaoProduto || null,
          link_negocio: linkNegocio || null,
          material_url: materialUrls, // array [FIX P5]
          observacoes: observacoes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao agendar');
      }
      const { booking } = await res.json();

      setBookingCode(booking.codigo_confirmacao);
      setSuccess(true);

      if (existingClient?.status === 'ativo') {
        toast.success("Agendamento confirmado! Envie o comprovante pelo WhatsApp.");
      } else {
        toast.success("Agendamento enviado! Aguarde a aprovação da influenciadora.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao agendar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Influenciadora não encontrada</h1>
            <Button variant="hero" asChild><Link href="/">Voltar</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clientProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="container max-w-md text-center">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-3">Complete seu cadastro</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Para agendar um serviço, você precisa completar o cadastro da sua empresa primeiro.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link href="/cadastro-cliente">Completar cadastro</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // chosenService already defined above

  if (success) {
    const whatsappMsg = encodeURIComponent(
      `Olá ${influencer.nome}! 🎉\n\nAcabei de agendar um serviço na AgendaInflu.\n\n📋 Código: ${bookingCode}\n📅 Data: ${selectedDate ? format(parseISO(selectedDate), "dd/MM/yyyy") : ""}\n🎬 Serviço: ${chosenService ? serviceLabels[chosenService.tipo] : ""}\n💰 Valor: R$ ${chosenService ? Number(chosenService.preco).toFixed(2) : ""}\n\n${existingClient?.status === "ativo" ? "Segue meu comprovante de pagamento:" : "Aguardo aprovação para prosseguir com o pagamento!"}`
    );

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="container max-w-md text-center">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
              <CheckCircle2 size={48} className="mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {existingClient?.status === "ativo" ? "Agendamento Confirmado!" : "Agendamento Enviado!"}
              </h2>
              <p className="text-muted-foreground text-sm mb-2">
                Código: <span className="font-mono font-bold text-foreground">{bookingCode}</span>
              </p>

              {existingClient?.status === "ativo" ? (
                <p className="text-sm text-muted-foreground mb-6">
                  Envie o comprovante de pagamento pelo WhatsApp para confirmar.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  Aguarde a aprovação da influenciadora. Você será notificado quando for aprovado.
                </p>
              )}

              <div className="flex flex-col gap-3">
                {influencer.whatsapp && (
                  <a href={`https://wa.me/${influencer.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="gold" size="lg" className="w-full flex items-center gap-2">
                      <MessageCircle size={18} /> Enviar pelo WhatsApp
                    </Button>
                  </a>
                )}
                <Button variant="outline" asChild>
                  <Link href="/cliente">Ver meus agendamentos</Link>
                </Button>
              </div>
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
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href={`/${username}`}><ArrowLeft size={16} className="mr-1" /> Voltar ao perfil</Link>
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Agendar com <span className="text-primary">{influencer.nome}</span>
            </h1>
            {!existingClient && (
              <p className="text-sm text-accent bg-accent/10 inline-flex items-center gap-1 px-3 py-1 rounded-full">
                <Clock size={14} /> Primeiro agendamento — sujeito a aprovação
              </p>
            )}
            {existingClient?.status === "ativo" && (
              <p className="text-sm text-primary bg-primary/10 inline-flex items-center gap-1 px-3 py-1 rounded-full">
                <CheckCircle2 size={14} /> Cliente aprovado — confirmação imediata
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
            {/* Service selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Escolha o serviço *</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map((s) => (
                  <button type="button" key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedService === s.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{serviceLabels[s.tipo] || s.tipo}</span>
                      <span className="font-bold text-primary">R$ {Number(s.preco).toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.formato}</span>
                    {s.descricao && <p className="text-xs text-muted-foreground mt-1">{s.descricao}</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Date selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Escolha a data *</label>
              {loadingDates ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-secondary animate-pulse" />
                  ))}
                </div>
              ) : availableDates.length === 0 ? (
                <div className="bg-secondary/50 rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma data disponível nos próximos 30 dias.
                    Entre em contato pelo WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableDates.map((d) => (
                    <button type="button" key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`p-3 rounded-lg border text-center transition-all text-sm ${
                        selectedDate === d
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-bold"
                          : "border-border hover:border-primary/30"
                      }`}>
                      {format(parseISO(d), "dd/MM", { locale: ptBR })}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(d), "EEE", { locale: ptBR })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Descrição do produto/serviço {isOnlineService && <span className="text-destructive">*</span>}
              </label>
              <textarea rows={2} value={descricaoProduto} onChange={(e) => setDescricaoProduto(e.target.value)}
                placeholder="Descreva o produto ou serviço que deseja divulgar..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            {/* Kit Mídia - only for online services */}
            {isOnlineService && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Kit Mídia — Fotos do produto <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Envie fotos e materiais sobre o produto para a influenciadora criar o conteúdo. (máx. 5 arquivos)
                </p>
                <div className="space-y-3">
                  {kitMidiaFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {kitMidiaFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm">
                          <Image size={14} className="text-primary shrink-0" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {kitMidiaFiles.length < 5 && (
                    <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors bg-secondary/30">
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Clique para adicionar fotos</span>
                      <input type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif" multiple className="hidden" onChange={handleFileSelect} />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">Link do seu negócio</label>
              <input type="url" value={linkNegocio} onChange={(e) => setLinkNegocio(e.target.value)}
                placeholder="https://suaempresa.com.br"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Observações</label>
              <textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Alguma informação adicional..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            {/* Summary */}
            {chosenService && selectedDate && (
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold">Resumo do agendamento</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">{serviceLabels[chosenService.tipo]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary text-lg">R$ {Number(chosenService.preco).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button variant="hero" size="lg" className="w-full" disabled={submitting || uploadingFiles || !selectedService || !selectedDate}>
              {uploadingFiles ? "Enviando arquivos..." : submitting ? "Agendando..." : existingClient?.status === "ativo" ? "Confirmar e Pagar" : "Enviar para aprovação"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default function AgendarServicoWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <AgendarServico />
    </Suspense>
  );
}
