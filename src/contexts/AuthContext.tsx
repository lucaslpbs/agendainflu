'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type UserRole = "admin" | "influencer" | "client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
  influencer: Tables<"influencers"> | null;
  isAdmin: boolean;
  isInfluencer: boolean;
  apiToken: string | null;
  signOut: () => Promise<void>;
  refreshInfluencer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  influencer: null,
  isAdmin: false,
  isInfluencer: false,
  apiToken: null,
  signOut: async () => {},
  refreshInfluencer: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper: trocar Supabase token por JWT proprio com role
async function exchangeForApiToken(supabaseToken: string): Promise<{ token: string; role: string } | null> {
  try {
    const res = await fetch('/api/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabase_token: supabaseToken }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [influencer, setInfluencer] = useState<Tables<"influencers"> | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);

  const fetchInfluencer = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("influencers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setInfluencer(data);
  }, []);

  const refreshInfluencer = useCallback(async () => {
    if (user) await fetchInfluencer(user.id);
  }, [user, fetchInfluencer]);

  // Ao ter uma sessao Supabase, trocar por token proprio
  const handleSession = useCallback(async (sess: Session | null) => {
    setSession(sess);
    setUser(sess?.user ?? null);

    if (!sess) {
      setRoles([]);
      setInfluencer(null);
      setApiToken(null);
      setLoading(false);
      return;
    }

    // Trocar token Supabase por JWT proprio com role
    const exchanged = await exchangeForApiToken(sess.access_token);

    if (exchanged) {
      const role = exchanged.role as UserRole;
      setRoles([role]);
      setApiToken(exchanged.token);
      // Guardar em localStorage para uso em fetch headers
      if (typeof window !== 'undefined') {
        localStorage.setItem('agenda-token', exchanged.token);
      }
      // Buscar dados da influencer se for influencer
      if (role === 'influencer' || role === 'admin') {
        await fetchInfluencer(sess.user.id);
      }
    } else {
      // Fallback: buscar roles diretamente do Supabase
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.user.id);
      const roleList = (roleData?.map(r => r.role) || []) as UserRole[];
      setRoles(roleList);
      if (roleList.includes("influencer") || roleList.includes("admin")) {
        await fetchInfluencer(sess.user.id);
      }
    }

    setLoading(false);
  }, [fetchInfluencer]);

  useEffect(() => {
    // Restaurar sessao existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Escutar mudancas de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signOut = async () => {
    // Limpar cookie via API
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agenda-token');
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setInfluencer(null);
    setApiToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        influencer,
        isAdmin: roles.includes("admin"),
        isInfluencer: roles.includes("influencer"),
        apiToken,
        signOut,
        refreshInfluencer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
