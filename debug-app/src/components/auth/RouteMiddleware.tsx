import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { routes } from "@/config";
import { AuthGuard, GuestGuard } from "./AuthGuard";

export function RouteMiddleware() {
  return <Suspense fallback={<main className="login-shell"><p role="status">Loading diagnostics…</p></main>}><Routes>
    {routes.map(({ path, access, component: Page }) => <Route key={path} element={access === "guest" ? <GuestGuard /> : <AuthGuard />}><Route path={path} element={<Page />} /></Route>)}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>;
}
