'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { LogOut, Save, User, Building2, MapPin, AtSign, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientLayout } from "./ClientLayout";
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const ClientProfile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    instagram: "",
    empresa: "",
    razao_social: "",
    cpf: "",
    cnpj: "",
    endereco_comercial: "",
    tipo_pessoa: "pf" as "pf" | "pj",
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const { data: cp } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        const { data: cl } = await supabase
          .from("clients")
          .select("nome, email, empresa, whatsapp, instagram")
          .eq("user_id", user.id)
          .single()

        if (cp) {
          setProfile({
            nome: cp.nome || cl?.nome || "",
            email: cp.email || user.email || "",
            whatsapp: cp.whatsapp || cl?.whatsapp || "",
            instagram: cl?.instagram || "",
            empresa: cl?.empresa || "",
            razao_social: cp.razao_social || "",
            cpf: cp.cpf || "",
            cnpj: cp.cnpj || "",
            endereco_comercial: cp.endereco_comercial || "",
            tipo_pessoa: cp.tipo_pessoa || "pf",
          })
        } else if (cl) {
          setProfile(p => ({
            ...p,
            nome: cl.nome || "",
            email: cl.email || user.email || "",
            whatsapp: cl.whatsapp || "",
            instagram: cl.instagram || "",
            empresa: cl.empresa || "",
          }))
        } else {
          setProfile(p => ({ ...p, email: user.email || "" }))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("client_profiles")
        .upsert({
          user_id: user.id,
          nome: profile.nome,
          email: profile.email,
          whatsapp: profile.whatsapp,
          razao_social: profile.razao_social || null,
          cpf: profile.cpf || null,
          cnpj: profile.cnpj || null,
          endereco_comercial: profile.endereco_comercial || null,
          tipo_pessoa: profile.tipo_pessoa,
        }, { onConflict: "user_id" })

      if (error) throw error

      if (profile.instagram) {
        await supabase
          .from("clients")
          .update({ instagram: profile.instagram, empresa: profile.empresa })
          .eq("user_id", user.id)
      }

      toast.success("Perfil atualizado com sucesso!")
    } catch (err: any) {
      toast.error("Erro ao salvar perfil: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <ClientLayout title="Meu Perfil">
      <div className="max-w-2xl space-y-6">

        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-3xl shadow-rosa flex-shrink-0">
              {profile.nome?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">
                {profile.nome || "Minha Conta"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Membro desde {user?.created_at ? format(parseISO(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-primary" />
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Tipo de Cadastro</h3>
          </div>
          <div className="flex gap-3">
            {[
              { value: "pf", label: "Pessoa Física" },
              { value: "pj", label: "Pessoa Jurídica" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setProfile(p => ({ ...p, tipo_pessoa: t.value as "pf" | "pj" }))}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  profile.tipo_pessoa === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-primary" />
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Dados Pessoais</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nome completo</label>
              <Input value={profile.nome} onChange={(e) => setProfile(p => ({ ...p, nome: e.target.value }))} placeholder="Seu nome" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <Input value={profile.email} disabled className="bg-secondary/50 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
              <Input value={profile.whatsapp} onChange={(e) => setProfile(p => ({ ...p, whatsapp: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Instagram</label>
              <div className="relative">
                <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={profile.instagram} onChange={(e) => setProfile(p => ({ ...p, instagram: e.target.value }))} placeholder="@seuinstagram" className="pl-9" />
              </div>
            </div>
            {profile.tipo_pessoa === "pf" ? (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">CPF</label>
                <Input value={profile.cpf} onChange={(e) => setProfile(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">CNPJ</label>
                  <Input value={profile.cnpj} onChange={(e) => setProfile(p => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Razão Social</label>
                  <Input value={profile.razao_social} onChange={(e) => setProfile(p => ({ ...p, razao_social: e.target.value }))} placeholder="Empresa LTDA" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-primary" />
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Dados Comerciais</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Nome da empresa / marca</label>
              <Input value={profile.empresa} onChange={(e) => setProfile(p => ({ ...p, empresa: e.target.value }))} placeholder="Nome da sua loja ou marca" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Endereço comercial</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={profile.endereco_comercial} onChange={(e) => setProfile(p => ({ ...p, endereco_comercial: e.target.value }))} placeholder="Rua, número, bairro, cidade - UF" className="pl-9" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Sessão</h3>
          <Button variant="outline" size="sm"
            className="text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            onClick={async () => { await signOut(); router.push("/"); }}>
            <LogOut size={14} className="mr-1.5" /> Sair da conta
          </Button>
        </div>

      </div>
    </ClientLayout>
  );
};
