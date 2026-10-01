import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/config";
import { endpoints } from "@/constants";
import { normalizeEvents, normalizeSession, normalizeStatus } from "@/lib";
import { queryKeys } from "../queryKeys";

export async function getSession(signal?: AbortSignal) {
  const { data } = await apiClient.get<unknown>(endpoints.session, { signal });
  const session = normalizeSession(data);
  if (!session) throw new Error("Invalid session response");
  return session;
}
export function useQueryGetSession(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.session, queryFn: ({ signal }) => getSession(signal), enabled, refetchInterval: enabled ? 30_000 : false });
}
export function useMutationLogin() {
  return useMutation({ mutationFn: async (password: string) => {
    const { data } = await apiClient.post<unknown>(endpoints.login, { password });
    const session = normalizeSession(data);
    if (!session?.authenticated) throw new Error("Login failed");
    return session;
  } });
}
export async function logout() { await apiClient.post(endpoints.logout, {}, { validateStatus: (status) => [200, 204, 401].includes(status) }); }
export function useQueryGetStatus() {
  return useQuery({ queryKey: queryKeys.status, queryFn: async ({ signal }) => {
    const { data } = await apiClient.get<unknown>(endpoints.status, { signal });
    const status = normalizeStatus(data);
    if (!status) throw new Error("Invalid status response");
    return status;
  }, refetchInterval: 10_000 });
}
export async function getEvents(signal: AbortSignal, cursor?: string) {
  const { data } = await apiClient.get<unknown>(endpoints.events, { signal, params: { limit: 100, ...(cursor ? { cursor } : {}) } });
  const page = normalizeEvents(data);
  if (!page) throw new Error("Invalid events response");
  return page;
}
