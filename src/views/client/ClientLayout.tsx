'use client'

import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ClipboardList, UserCircle, LogOut, Menu, X, Users, Zap
} from "lucide-react";

const ClientLayoutInner = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Minhas Influenciadoras", icon: Users, path: "/cliente/explorar" },
    { label: "Meus Agendamentos", icon: ClipboardList, path: "/cliente" },
    { label: "Meu Perfil", icon: UserCircle, path: "/cliente/perfil" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0A0A0F]">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#13131A] border-r border-white/8 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/8 flex items-center justify-between">
            <Link href="/cliente" className="font-display text-xl font-bold flex items-center gap-1.5">
              <Zap size={18} className="text-[#FF2D87]" />
              <span className="text-white">Agenda</span>
              <span className="text-gradient-neon">Influ</span>
            </Link>
            <button
              className="lg:hidden text-white/50 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#FF2D87]/15 text-[#FF2D87] shadow-[0_0_20px_rgba(255,45,135,0.1)]"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF2D87]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="p-4 border-t border-white/8">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-[#FF2D87]/15 flex items-center justify-center text-[#FF2D87] font-bold text-sm border border-[#FF2D87]/20">
                {user?.email?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || "Cliente"}
                </p>
                <p className="text-xs text-white/40">Cliente</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-white/40 hover:text-white hover:bg-white/5"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
            >
              <LogOut size={16} /> Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/8 flex items-center px-6 lg:px-8 bg-[#13131A]">
          <button
            className="lg:hidden mr-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
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
