'use client'

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Calendar, ClipboardList, Briefcase, Users, Clock, UserCircle, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/hooks/usePanelData";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/painel" },
  { label: "Calendário", icon: Calendar, path: "/painel/calendario" },
  { label: "Agendamentos", icon: ClipboardList, path: "/painel/agendamentos" },
  { label: "Serviços", icon: Briefcase, path: "/painel/servicos" },
  { label: "Clientes", icon: Users, path: "/painel/clientes" },
  { label: "Lista de Espera", icon: Clock, path: "/painel/lista-espera" },
  { label: "Perfil", icon: UserCircle, path: "/painel/perfil" },
];

const PanelLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, influencer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: bookings = [] } = useBookings();
  const pendingCount = bookings.filter(b => b.status === "pendente").length;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link href="/" className="font-display text-xl font-bold text-primary">
              Agenda<span className="text-gradient-gold">Influ</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {item.path === "/painel/agendamentos" && pendingCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              {influencer?.foto_url ? (
                <Image
                  src={influencer.foto_url}
                  alt={influencer.nome || ""}
                  width={36}
                  height={36}
                  className="rounded-full object-cover w-9 h-9"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {influencer?.nome?.charAt(0) || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{influencer?.nome || "Influenciadora"}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-muted-foreground">@{influencer?.username || "..."}</p>
                  {influencer?.status === "ativa" && (
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
              <LogOut size={16} /> Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 lg:px-8 bg-card">
          <div className="flex items-center">
            <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="font-display text-lg font-semibold">
              {menuItems.find((i) => i.path === pathname)?.label || "Painel"}
            </h2>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            {influencer?.foto_url ? (
              <Image
                src={influencer.foto_url}
                alt={influencer.nome || ""}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {influencer?.nome?.charAt(0) || "?"}
              </div>
            )}
            <span className="text-sm font-medium">{influencer?.nome || "Influenciadora"}</span>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PanelLayout;
