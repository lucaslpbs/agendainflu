import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  // booking statuses
  pendente:   { label: "Pendente",   className: "bg-accent/20 text-accent border-accent/30" },
  confirmado: { label: "Confirmado", className: "bg-primary/20 text-primary border-primary/30" },
  concluido:  { label: "Concluído",  className: "bg-green-100 text-green-700 border-green-300" },
  cancelado:  { label: "Cancelado",  className: "bg-destructive/20 text-destructive border-destructive/30" },
  // influencer statuses
  ativo:      { label: "Ativo",      className: "bg-primary/20 text-primary border-primary/30" },
  ativa:      { label: "Ativa",      className: "bg-primary/20 text-primary border-primary/30" },
  rejeitado:  { label: "Rejeitado",  className: "bg-destructive/20 text-destructive border-destructive/30" },
  rejeitada:  { label: "Rejeitada",  className: "bg-destructive/20 text-destructive border-destructive/30" },
  em_analise: { label: "Em análise", className: "bg-accent/20 text-accent border-accent/30" },
  suspensa:   { label: "Suspensa",   className: "bg-accent/20 text-accent border-accent/30" },
  // client statuses
  bloqueado:  { label: "Bloqueado",  className: "bg-destructive/20 text-destructive border-destructive/30" },
  // waitlist statuses
  aguardando: { label: "Aguardando", className: "bg-accent/20 text-accent border-accent/30" },
  contatado:  { label: "Contatado",  className: "bg-primary/20 text-primary border-primary/30" },
  aprovado:   { label: "Aprovado",   className: "bg-primary/20 text-primary border-primary/30" },
  espera:     { label: "Espera",     className: "bg-accent/20 text-accent border-accent/30" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status?.toLowerCase()];
  const label = config?.label ?? status?.replace(/_/g, " ") ?? "—";
  const className = config?.className ?? "bg-secondary text-foreground border-transparent";
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
