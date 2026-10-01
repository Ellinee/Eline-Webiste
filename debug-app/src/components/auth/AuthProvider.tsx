import { useCallback, useEffect, useState, type ReactNode } from "react";
import { logout as requestLogout, queryKeys, useQueryGetSession } from "@/api";
import { queryClient } from "@/config";
import { AuthContext } from "@/context";
import type { Session } from "@/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const query = useQueryGetSession(!isLocked);
  const session = isLocked ? null : query.data ?? null;
  const clear = useCallback(() => {
    setIsLocked(true);
    window.dispatchEvent(new Event("debug:stop"));
    void queryClient.cancelQueries();
    queryClient.clear();
  }, []);
  useEffect(() => {
    window.addEventListener("debug:unauthorized", clear);
    window.addEventListener("pagehide", clear);
    return () => { window.removeEventListener("debug:unauthorized", clear); window.removeEventListener("pagehide", clear); };
  }, [clear]);
  useEffect(() => {
    if (!session?.authenticated || !session.expiresAt) return;
    const timeout = setTimeout(clear, Math.max(0, Math.min(Date.parse(session.expiresAt) - Date.now(), 2_147_483_647)));
    return () => clearTimeout(timeout);
  }, [session, clear]);
  const handleLogin = (value: Session) => {
    if (isLoggingOut || logoutFailed) return;
    void queryClient.cancelQueries({ queryKey: queryKeys.session });
    queryClient.setQueryData(queryKeys.session, value);
    setIsLocked(false);
    setLogoutFailed(false);
  };
  const handleLogout = async () => {
    if (isLoggingOut) return;
    clear();
    setIsLoggingOut(true);
    try { await requestLogout(); setLogoutFailed(false); }
    catch { setLogoutFailed(true); }
    finally { setIsLoggingOut(false); }
  };
  return <AuthContext value={{ session, isLoading: !isLocked && query.isPending, isError: !isLocked && query.isError, isLoggingOut, logoutFailed, login: handleLogin, logout: handleLogout, retry: () => { void query.refetch(); } }}>{children}</AuthContext>;
}
