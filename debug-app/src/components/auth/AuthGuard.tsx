import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context";

export function AuthGuard() {
  const auth = useAuth();
  if (auth.isLoading) return <main className="login-shell"><p role="status">Checking session…</p></main>;
  if (auth.isError) return <main className="login-shell"><h1>Device diagnostics</h1><p role="alert">Unable to check your session.</p><button onClick={auth.retry}>Retry</button><button onClick={() => void auth.logout()}>Logout</button></main>;
  return auth.session?.authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
export function GuestGuard() {
  const auth = useAuth();
  if (auth.isLoading) return <main className="login-shell"><p role="status">Checking session…</p></main>;
  return auth.session?.authenticated ? <Navigate to="/" replace /> : <Outlet />;
}
