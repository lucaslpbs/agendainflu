import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  signOut: async () => {},
  refreshInfluencer: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [influencer, setInfluencer] = useState<Tables<"influencers"> | null>(null);

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles(data?.map((r) => r.role) || []);
  };

  const fetchInfluencer = async (userId: string) => {
    const { data } = await supabase
      .from("influencers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setInfluencer(data);
  };

  const refreshInfluencer = async () => {
    if (user) await fetchInfluencer(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRoles(session.user.id);
          await fetchInfluencer(session.user.id);
        } else {
          setRoles([]);
          setInfluencer(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
        fetchInfluencer(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setInfluencer(null);
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
        signOut,
        refreshInfluencer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
