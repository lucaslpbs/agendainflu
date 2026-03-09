import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageCircle, CheckCircle, XCircle, Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const WaitlistPage = () => {
  const { influencer } = useAuth();
  const [items, setItems] = useState<Tables<"waitlist">[]>([]);

  const fetchItems = async () => {
    if (!influencer) return;
    const { data } = await supabase.from("waitlist").select("*").eq("influencer_id", influencer.id).order("criado_em", { ascending: false });
    setItems(data || []);
  };

  useEffect(() => { fetchItems(); }, [influencer]);

  const approve = async (item: Tables<"waitlist">) => {
    if (!influencer) return;
    // Move to clients
    const { error: clientErr } = await supabase.from("clients").insert({
      influencer_id: influencer.id,
      nome: item.nome,
      whatsapp: item.whatsapp,
      email: item.email,
      empresa: item.empresa,
      origem: "site" as const,
    });
    if (clientErr) return toast.error(clientErr.message);

    // Update waitlist status
    await supabase.from("waitlist").update({ status: "aprovado" as const }).eq("id", item.id);
    toast.success(`${item.nome} aprovado(a) e adicionado(a) à base de clientes!`);
    fetchItems();
  };

  const reject = async (id: string) => {
    await supabase.from("waitlist").update({ status: "rejeitado" as const }).eq("id", id);
    toast.success("Registro rejeitado.");
    fetchItems();
  };

  const markContacted = async (id: string) => {
    await supabase.from("waitlist").update({ status: "contatado" as const }).eq("id", id);
    toast.success("Marcado como contatado.");
    fetchItems();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aguardando: "bg-yellow-100 text-yellow-700",
      contatado: "bg-blue-100 text-blue-700",
      aprovado: "bg-green-100 text-green-700",
      rejeitado: "bg-red-100 text-red-700",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || ""}`}>{status}</span>;
  };

  const aguardando = items.filter((i) => i.status === "aguardando").length;

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Lista de Espera</h2>
          {aguardando > 0 && (
            <span className="gradient-rosa text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">{aguardando}</span>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div>{item.nome}</div>
                      {item.mensagem && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{item.mensagem}</div>}
                    </td>
                    <td className="px-4 py-3">{item.empresa || "—"}</td>
                    <td className="px-4 py-3">{item.whatsapp}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(item.criado_em).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {item.status === "aguardando" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => approve(item)} title="Aprovar">
                              <CheckCircle size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => reject(item.id)} title="Rejeitar">
                              <XCircle size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markContacted(item.id)} title="Marcar contatado">
                              <Phone size={14} />
                            </Button>
                          </>
                        )}
                        <a href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${item.nome}! Entramos em contato sobre sua solicitação no AgendaInflu. 💖`)}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MessageCircle size={14} /></Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum registro na lista de espera.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default WaitlistPage;
