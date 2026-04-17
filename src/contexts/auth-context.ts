import { Session } from "@supabase/supabase-js";
import { createContext } from "react";
import { Profile, UserRole } from "../types/domain";

export type AuthContextValue = {
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

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
