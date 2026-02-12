import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRole: string | null;
  userDivision: string | null;
  userName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    localStorage.removeItem("login_time");
    await supabase.auth.signOut();
  }, []);

  const fetchUserMeta = useCallback(async (userId: string) => {
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("display_name, division").eq("user_id", userId).single(),
    ]);
    setUserRole(roles?.[0]?.role ?? "user");
    setUserDivision(profile?.division ?? null);
    setUserName(profile?.display_name ?? null);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          if (_event === "SIGNED_IN") {
            localStorage.setItem("login_time", Date.now().toString());
          }
          fetchUserMeta(session.user.id);
        } else {
          setUserRole(null);
          setUserDivision(null);
          setUserName(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserMeta(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserMeta]);

  // Auto logout after 1 hour
  useEffect(() => {
    if (!user) return;

    const checkExpiry = () => {
      const loginTime = localStorage.getItem("login_time");
      if (loginTime && Date.now() - parseInt(loginTime) > SESSION_DURATION) {
        signOut();
      }
    };

    const interval = setInterval(checkExpiry, 30000); // check every 30s
    checkExpiry();

    return () => clearInterval(interval);
  }, [user, signOut]);

  return (
    <AuthContext.Provider value={{ session, user, loading, userRole, userDivision, userName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
