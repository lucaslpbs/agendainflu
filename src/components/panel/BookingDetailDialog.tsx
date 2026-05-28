import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Check, X, MessageCircle, Instagram, ExternalLink, Image, FileText, Send, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type BookingWithRelations = Tables<"bookings"> & {
  clients: Tables<"clients"> | null;
  services: Tables<"services"> | null;
  pagamento_confirmado?: boolean | null;
};

const serviceLabels: Record<string, string> = {
  stories: "Stories", reels: "Reels", reels_stories: "Reels + Stories", feed: "Feed", presencial: "Presencial",
};


interface Props {
  booking: BookingWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: (id: string, status: "confirmado" | "cancelado" | "concluido") => void;
  onComplete?: (id: string) => void;
}

const NOTIFY_ENDPOINT = "/api/bookings/notify-whatsapp";

const BookingDetailDialog = ({ booking, open, onOpenChange, onUpdateStatus, onComplete }: Props) => {
  const { influencer } = useAuth();
  const [sending, setSending] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false)

  if (!booking) return null;

  const b = booking;

  const handleSendWhatsApp = async () => {
    setSending(true);
    try {
      const payload = {
        booking_id: b.id,
        codigo_confirmacao: b.codigo_confirmacao,
        status: b.status,
        data_agendada: b.data_agendada,
        descricao_produto: b.descricao_produto ?? null,
        link_negocio: b.link_negocio ?? null,
        materiais: b.material_url ?? [],
        observacoes: b.observacoes ?? null,
        pagamento_confirmado: b.pagamento_confirmado ?? false,
        cliente: {
          nome: b.clients?.nome ?? null,
          empresa: b.clients?.empresa ?? null,
          whatsapp: b.clients?.whatsapp ?? null,
          email: b.clients?.email ?? null,
          instagram: b.clients?.instagram ?? null,
        },
        servico: {
          tipo: b.services?.tipo ?? null,
          formato: b.services?.formato ?? null,
          preco: Number(b.services?.preco ?? 0),
          descricao: b.services?.descricao ?? null,
        },
        influencer: {
          nome: influencer?.nome ?? null,
          username: influencer?.username ?? null,
          whatsapp: influencer?.whatsapp ?? null,
        },
      };

      const res = await fetch(NOTIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);
      toast.success("Informações enviadas para o WhatsApp!");
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Agendamento</span>
            <span className="font-mono text-xs text-muted-foreground">{b.codigo_confirmacao}</span>
          </DialogTitle>
          <DialogDescription>Detalhes completos do agendamento</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusBadge status={b.status} />
            {b.pagamento_confirmado && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-300">
                💰 Pago
              </span>
            )}
          </div>

          {/* Client info */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">👤 Cliente</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Nome</span>
                <p className="font-medium">{b.clients?.nome || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Empresa</span>
                <p className="font-medium">{b.clients?.empresa || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">WhatsApp</span>
                <p className="font-medium">{b.clients?.whatsapp || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Email</span>
                <p className="font-medium truncate">{b.clients?.email || "—"}</p>
              </div>
            </div>
            {b.clients?.instagram && (
              <a
                href={`https://instagram.com/${b.clients.instagram.replace("@", "")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
              >
                <Instagram size={14} /> @{b.clients.instagram.replace("@", "")}
              </a>
            )}
          </div>

          {/* Service info */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">🎬 Serviço</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Tipo</span>
                <p className="font-medium">{b.services ? serviceLabels[b.services.tipo] || b.services.tipo : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Formato</span>
                <p className="font-medium capitalize">{b.services?.formato || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Data</span>
                <p className="font-medium">{format(parseISO(b.data_agendada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Valor</span>
                <p className="font-bold text-primary">
                  R$ {Number(b.services?.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Product / Kit Mídia */}
          {(b.descricao_produto || b.link_negocio || b.material_url) && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText size={14} /> Kit Mídia / Produto
              </h4>
              {b.descricao_produto && (
                <div>
                  <span className="text-muted-foreground text-xs">Descrição do produto</span>
                  <p className="text-sm">{b.descricao_produto}</p>
                </div>
              )}
              {b.link_negocio && (
                <a
                  href={b.link_negocio}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink size={14} /> Link do negócio
                </a>
              )}
              {b.material_url && (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-xs">Material enviado</span>
                  <div className="flex flex-wrap gap-2">
                    {b.material_url.map((url, i) => (
                      <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        <Image size={12} /> Arquivo {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observations */}
          {b.observacoes && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-1">📝 Observações</h4>
              <p className="text-sm text-muted-foreground">{b.observacoes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {b.status === "pendente" && onUpdateStatus && (
              <>
                <Button size="sm" className="gap-1.5"
                  onClick={() => { onUpdateStatus(b.id, "confirmado"); onOpenChange(false); }}>
                  <Check size={14} /> Confirmar
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5"
                  onClick={() => setCancelConfirm(true)}>
                  <X size={14} /> Recusar
                </Button>
              </>
            )}
            {b.status === "confirmado" && (onUpdateStatus || onComplete) && (
              <>
                <Button size="sm" className="gap-1.5"
                  onClick={() => { onComplete ? onComplete(b.id) : onUpdateStatus?.(b.id, "concluido"); onOpenChange(false); }}>
                  <Check size={14} /> Concluir
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5"
                  onClick={() => setCancelConfirm(true)}>
                  <X size={14} /> Cancelar/Estornar
                </Button>
              </>
            )}
            {b.clients?.whatsapp && (
              <a href={`https://wa.me/${b.clients.whatsapp.replace(/\D/g, "")}`}
                 target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-green-600">
                  <MessageCircle size={14} /> WhatsApp
                </Button>
              </a>
            )}
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={handleSendWhatsApp} disabled={sending}>
              {sending
                ? <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                : <><Send size={14} /> Enviar via WhatsApp</>
              }
            </Button>
          </div>

          {/* Modal de confirmação de cancelamento */}
          {cancelConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mx-4 space-y-4 shadow-xl">
                <h3 className="font-bold text-lg">Cancelar agendamento?</h3>
                <p className="text-sm text-muted-foreground">
                  Tem certeza que deseja cancelar este agendamento?
                  Lembre-se de realizar a <strong>devolução do valor</strong> ao cliente
                  caso o pagamento já tenha sido efetuado.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      onUpdateStatus?.(b.id, "cancelado")
                      setCancelConfirm(false)
                      onOpenChange(false)
                    }}
                  >
                    Sim, cancelar e estornar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCancelConfirm(false)}
                  >
                    Não, voltar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;
