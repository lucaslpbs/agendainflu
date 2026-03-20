'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
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

async function exchangeForApiToken(supabaseToken: string): Promise<{ token: string; role: string; influencer_id?: string } | null> {
  try {
    const res = await fetch('/api/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabase_token: supabaseToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // role e influencer_id estão no top-level da resposta
    return { token: data.token, role: data.role, influencer_id: data.influencer_id };
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

  // Evita processar a mesma sessão duas vezes (ex: INITIAL_SESSION + TOKEN_REFRESHED simultâneos)
  const processedSessionRef = useRef<string | null>(null);

  // Busca via API (service role) para não depender de RLS policies do Supabase
  const fetchInfluencer = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('agenda-token') : null;
      const res = await fetch('/api/auth/me', {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      });
      if (!res.ok) return;
      const { profile } = await res.json();
      setInfluencer(profile ?? null);
    } catch {
      // ignora erros silenciosos
    }
  }, []);

  const refreshInfluencer = useCallback(async () => {
    await fetchInfluencer();
  }, [fetchInfluencer]);

  const handleSession = useCallback(async (sess: Session | null) => {
    // Evita processar a mesma sessão duas vezes (getSession + onAuthStateChange)
    const sessionKey = sess?.access_token ?? 'null';
    if (processedSessionRef.current === sessionKey) return;
    processedSessionRef.current = sessionKey;

    setSession(sess);
    setUser(sess?.user ?? null);

    if (!sess) {
      setRoles([]);
      setInfluencer(null);
      setApiToken(null);
      setLoading(false);
      return;
    }

    // Trocar token Supabase por JWT próprio com role
    const exchanged = await exchangeForApiToken(sess.access_token);

    if (exchanged) {
      const role = exchanged.role as UserRole;
      setRoles([role]);
      setApiToken(exchanged.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agenda-token', exchanged.token);
      }
      if (role === 'influencer' || role === 'admin') {
        await fetchInfluencer();
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
        await fetchInfluencer();
      }
    }

    setLoading(false);
  }, [fetchInfluencer]);

  useEffect(() => {
    // onAuthStateChange dispara imediatamente com INITIAL_SESSION, cobrindo o caso de getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agenda-token');
    }
    processedSessionRef.current = null;
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
