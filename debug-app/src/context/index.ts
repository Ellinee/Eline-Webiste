import { createContext, useContext } from "react";
import type { Session } from "@/types";

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isError: boolean;
  isLoggingOut: boolean;
  logoutFailed: boolean;
  login: (session: Session) => void;
  logout: () => Promise<void>;
  retry: () => void;
}
export const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Missing authentication provider");
  return value;
}
