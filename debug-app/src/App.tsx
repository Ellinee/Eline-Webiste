import { QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router";
import { AuthProvider, RouteMiddleware } from "@/components";
import { queryClient } from "@/config";

export default function App() {
  return <QueryClientProvider client={queryClient}><HashRouter><AuthProvider><RouteMiddleware /></AuthProvider></HashRouter></QueryClientProvider>;
}
