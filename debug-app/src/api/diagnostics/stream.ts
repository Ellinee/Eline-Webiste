import { endpoints } from "@/constants";
import { normalizeEvent, normalizeStatus, safeCursor } from "@/lib";
import { queryClient } from "@/config";
import { queryKeys } from "../queryKeys";
import type { Connection, DiagnosticEvent } from "@/types";
import { getSession } from "./queries";

interface StreamOptions {
  cursor?: string;
  signal: AbortSignal;
  onEvent: (event: DiagnosticEvent) => void;
  onConnection: (connection: Connection) => void;
  onGap: () => void;
  onCursor: (cursor: string) => void;
}
export function subscribeEvents(options: StreamOptions): () => void {
  let cursor = options.cursor;
  let source: EventSource | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let attempts = 0;
  let isClosed = false;
  let isReconnecting = false;
  const closeSource = () => { source?.close(); source = undefined; clearTimeout(watchdog); };
  const stop = () => { isClosed = true; closeSource(); clearTimeout(timer); options.signal.removeEventListener("abort", stop); };
  const heartbeat = () => { clearTimeout(watchdog); watchdog = setTimeout(() => { void reconnect(); }, 40_000); };
  const reconnect = async () => {
    if (isClosed || options.signal.aborted || isReconnecting) return;
    isReconnecting = true;
    clearTimeout(timer);
    closeSource();
    if (++attempts > 5) { options.onConnection("offline"); stop(); return; }
    options.onConnection("reconnecting");
    try {
      const session = await getSession(options.signal);
      if (!session.authenticated) { window.dispatchEvent(new Event("debug:unauthorized")); stop(); return; }
    } catch { if (isClosed || options.signal.aborted) return; }
    if (!isClosed) timer = setTimeout(connect, Math.min(1000 * 2 ** (attempts - 1), 16_000));
  };
  const connect = () => {
    if (isClosed || options.signal.aborted) return;
    isReconnecting = false;
    source = new EventSource(`${endpoints.stream}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, { withCredentials: true });
    heartbeat();
    source.onopen = () => { if (!isClosed) { options.onConnection("live"); heartbeat(); } };
    source.onerror = () => { void reconnect(); };
    source.addEventListener("heartbeat", heartbeat);
    source.addEventListener("checkpoint", (message: MessageEvent<string>) => {
      try {
        if (isClosed || options.signal.aborted) return;
        if (message.data.length > 256) throw new Error("Invalid checkpoint");
        const value = safeCursor(JSON.parse(message.data).cursor);
        if (value) { cursor = value; options.onCursor(value); }
        heartbeat();
      } catch { options.onConnection("offline"); stop(); }
    });
    source.addEventListener("status", (message: MessageEvent<string>) => {
      try {
        if (isClosed || options.signal.aborted) return;
        if (message.data.length > 65_536) throw new Error("Invalid status");
        const status = normalizeStatus(JSON.parse(message.data));
        if (!status) throw new Error("Invalid status");
        queryClient.setQueryData(queryKeys.status, status);
        heartbeat();
      } catch { options.onConnection("offline"); stop(); }
    });
    source.addEventListener("gap", () => { options.onGap(); stop(); });
    source.addEventListener("diagnostic", (message: MessageEvent<string>) => {
      try {
        if (isClosed || options.signal.aborted) return;
        if (message.data.length > 65_536) throw new Error("Frame too large");
        const event = normalizeEvent(JSON.parse(message.data));
        if (!event) throw new Error("Invalid event");
        cursor = event.cursor;
        options.onEvent(event);
        heartbeat();
      } catch { options.onConnection("offline"); stop(); }
    });
  };
  options.signal.addEventListener("abort", stop, { once: true });
  connect();
  return stop;
}
