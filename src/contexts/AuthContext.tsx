import { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { Profile, UserRole } from "../types/domain";

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PROFILE_SELECT = "id,full_name,role,organization_id,created_at";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string, fallbackName?: string | null) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    if (data) {
      setProfile(data as Profile);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fallbackName ?? null,
        role: "user"
      })
      .select(PROFILE_SELECT)
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    setProfile(inserted as Profile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !session?.user.id) {
      setProfile(null);
      return;
    }

    await loadProfile(session.user.id, session.user.user_metadata.full_name as string | null);
  }, [loadProfile, session?.user.id, session?.user.user_metadata.full_name]);

  useEffect(() => {
    let active = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function initAuth() {
      const {
        data: { session: initialSession },
        error
      } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setLoading(false);
        return;
      }

      setSession(initialSession);

      if (initialSession?.user.id) {
        try {
          await loadProfile(
            initialSession.user.id,
            initialSession.user.user_metadata.full_name as string | null
          );
        } catch (profileError) {
          setProfile(null);
        }
      }

      setLoading(false);
    }

    void initAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user.id) {
        setProfile(null);
        return;
      }

      try {
        await loadProfile(
          nextSession.user.id,
          nextSession.user.user_metadata.full_name as string | null
        );
      } catch (_error) {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return "Supabase n'est pas configuré. Ajoute les variables d'environnement.";
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return "Supabase n'est pas configuré. Ajoute les variables d'environnement.";
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    return error?.message ?? null;
  }, []);

  const signOutUser = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { error } = await supabase.auth.signOut();
    if (!error) {
      setProfile(null);
    }

    return error?.message ?? null;
  }, []);

  const role: UserRole = session ? profile?.role ?? "user" : "visitor";

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      role,
      loading,
      isAuthenticated: Boolean(session),
      signIn,
      signUp,
      signOut: signOutUser,
      refreshProfile
    }),
    [loading, profile, refreshProfile, role, session, signIn, signOutUser, signUp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }

  return context;
}
