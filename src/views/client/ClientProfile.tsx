'use client'

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientLayout } from "./ClientLayout";


export const ClientProfile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <ClientLayout title="Meu Perfil">
      <div className="max-w-2xl space-y-4">
        {/* Header card */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-3xl shadow-rosa">
              {user?.email?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Minha Conta</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Informações da conta
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">E-mail</span>
              <span className="text-sm font-medium">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Membro desde</span>
              <span className="text-sm font-medium">
                {user?.created_at ? format(parseISO(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Session card */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Sessão
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            onClick={async () => { await signOut(); router.push("/"); }}
          >
            <LogOut size={14} className="mr-1.5" /> Sair da conta
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};
