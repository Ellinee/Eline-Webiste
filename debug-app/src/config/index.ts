export { routes } from "./routes";
import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export const apiClient = axios.create({ baseURL: "/debug/api", timeout: 10_000, withCredentials: true, headers: { Accept: "application/json" } });
export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false }, mutations: { retry: false, gcTime: 0 } } });
apiClient.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.url !== "/login") window.dispatchEvent(new Event("debug:unauthorized"));
  return Promise.reject(error);
});
