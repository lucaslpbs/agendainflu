'use client'

import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ClipboardList, UserCircle, LogOut, Menu, X, Compass
} from "lucide-react";

const ClientLayoutInner = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Explorar", icon: Compass, path: "/cliente/explorar" },
    { label: "Meus Agendamentos", icon: ClipboardList, path: "/cliente" },
    { label: "Meu Perfil", icon: UserCircle, path: "/cliente/perfil" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link href="/cliente" className="font-display text-xl font-bold">
              <span className="text-primary">Agenda</span><span className="text-gradient-gold">Influ</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}>
                <item.icon size={18} />{item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || "Cliente"}</p>
                <p className="text-xs text-muted-foreground">Cliente</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={async () => { await signOut(); router.push("/"); }}>
              <LogOut size={16} /> Sair
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center px-6 lg:px-8 bg-card">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export const ClientLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  return (
    <Suspense fallback={null}>
      <ClientLayoutInner title={title}>{children}</ClientLayoutInner>
    </Suspense>
  );
};
