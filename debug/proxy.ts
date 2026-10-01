import { privateHeaders } from "./assets.ts";
import { normalizeEvents, normalizeSession, normalizeStatus, record, safeCursor } from "./contract.ts";
import { sanitizeSse } from "./stream.ts";

interface DebugConfig { apiUrl?: string; allowedOrigin?: string; production: boolean }
const routes: Record<string, string> = { login: "POST", session: "GET", logout: "POST", status: "GET", events: "GET", stream: "GET" };
const cookieName = "eline_debug_session";
const errorResponse = (status: number) => Response.json({ error: status === 401 ? "Authentication required" : "Diagnostics request failed" }, { status, headers: privateHeaders });

async function readBounded(body: ReadableStream<Uint8Array> | null, max: number, signal: AbortSignal = AbortSignal.timeout(10_000)): Promise<string> {
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  const onAbort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", onAbort, { once: true });
  let size = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const chunk = await reader.read();
      signal.throwIfAborted();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > max) throw new Error("Too large");
      chunks.push(chunk.value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally { signal.removeEventListener("abort", onAbort); void reader.cancel().catch(() => {}); }
}

function sessionCookie(value: string | null): string | undefined {
  if (!value || value.length > 8192) return undefined;
  const matches = value.split(";").map((v) => v.trim()).filter((v) => v.startsWith(`${cookieName}=`));
  return matches.length === 1 && /^eline_debug_session=[A-Za-z0-9_.~-]{1,2048}$/.test(matches[0]) ? matches[0] : undefined;
}

function validSetCookie(value: string, production: boolean): boolean {
  if (value.length > 4096 || /[\r\n]/.test(value)) return false;
  const [pair, ...parts] = value.split(";").map((v) => v.trim());
  if (!/^eline_debug_session=[A-Za-z0-9_.~-]{0,2048}$/.test(pair)) return false;
  const attributes = new Map<string, string>();
  for (const part of parts) {
    const index = part.indexOf("=");
    const key = (index < 0 ? part : part.slice(0, index)).toLowerCase();
    if (attributes.has(key) || !["path", "httponly", "secure", "samesite", "max-age", "expires"].includes(key)) return false;
    attributes.set(key, index < 0 ? "" : part.slice(index + 1));
  }
  return attributes.get("path") === "/debug" && attributes.get("httponly") === "" && (!attributes.has("secure") || attributes.get("secure") === "") && (!production || attributes.has("secure")) && attributes.get("samesite")?.toLowerCase() === "strict" && (!attributes.has("max-age") || /^\d{1,8}$/.test(attributes.get("max-age")!)) && (!attributes.has("expires") || Number.isFinite(Date.parse(attributes.get("expires")!)));
}

export async function handleDebugRequest(request: Request, parts: string[], config: DebugConfig, fetcher: typeof fetch = fetch): Promise<Response> {
  const route = parts.length === 1 ? parts[0] : "";
  if (!Object.hasOwn(routes, route)) return errorResponse(404);
  if (request.method !== routes[route]) return errorResponse(405);
  let upstream: URL;
  let current: URL;
  try {
    upstream = new URL(config.apiUrl ?? "");
    current = new URL(request.url);
    const allowed = new URL(config.allowedOrigin ?? "");
    if (allowed.origin !== config.allowedOrigin || current.origin !== allowed.origin || upstream.username || upstream.password || upstream.search || upstream.hash || !["", "/", "/debug", "/debug/"].includes(upstream.pathname) || !["http:", "https:"].includes(upstream.protocol) || (config.production && (upstream.protocol !== "https:" || allowed.protocol !== "https:"))) return errorResponse(503);
  } catch { return errorResponse(503); }
  const origin = request.headers.get("origin");
  if ((origin !== null && origin !== current.origin) || (request.method === "POST" && origin !== current.origin)) return errorResponse(403);
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) return errorResponse(403);
  const headers = new Headers();
  const cookie = sessionCookie(request.headers.get("cookie"));
  if (cookie) headers.set("Cookie", cookie);
  if (origin) headers.set("Origin", origin);
  const target = new URL(`/debug/${route}`, upstream.origin);
  if (current.search.length > 1024) return errorResponse(400);
  const seen = new Set<string>();
  for (const [key, value] of current.searchParams) {
    if (!["events", "stream"].includes(route) || seen.has(key)) return errorResponse(400);
    seen.add(key);
    if (key === "cursor" && safeCursor(value)) target.searchParams.set("after", value);
    else if (key === "limit" && route === "events" && /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 100) target.searchParams.set(key, value);
    else return errorResponse(400);
  }
  const lastEventId = request.headers.get("last-event-id");
  if (lastEventId && (route !== "stream" || !safeCursor(lastEventId))) return errorResponse(400);
  if (lastEventId) headers.set("Last-Event-ID", lastEventId);
  let body: string | undefined;
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type");
    if (route === "login" && !/^application\/json(?:;\s*charset=utf-8)?$/i.test(contentType ?? "")) return errorResponse(415);
    try {
      const raw = await readBounded(request.body, 4096, AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]));
      if (route === "login") {
        const input = record(JSON.parse(raw));
        if (!input || Object.keys(input).length !== 1 || typeof input.password !== "string" || input.password.length < 1 || input.password.length > 512) return errorResponse(400);
        body = JSON.stringify({ password: input.password });
        headers.set("Content-Type", "application/json");
      } else {
        if (raw && raw !== "{}") return errorResponse(400);
        body = "{}";
        headers.set("Content-Type", "application/json");
      }
    } catch { return errorResponse(413); }
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  request.signal.addEventListener("abort", onAbort, { once: true });
  if (request.signal.aborted) controller.abort();
  const timer = setTimeout(onAbort, 10_000);
  let isStreaming = false;
  const cleanup = () => { clearTimeout(timer); request.signal.removeEventListener("abort", onAbort); };
  const clearCookie = `${cookieName}=; Path=/debug; HttpOnly; SameSite=Strict; Max-Age=0${config.production ? "; Secure" : ""}`;
  let response: Response;
  try {
    const result = await fetcher(target, { method: request.method, headers, body, signal: controller.signal, redirect: "manual", cache: "no-store" });
    if (!result.ok) {
      void result.body?.cancel().catch(() => {});
      response = errorResponse([400, 401, 403, 404, 405, 409, 413, 415, 429, 503].includes(result.status) ? result.status : 502);
      const retryAfter = result.headers.get("retry-after");
      if (result.status === 429 && retryAfter && /^\d{1,4}$/.test(retryAfter)) response.headers.set("Retry-After", retryAfter);
      if (route === "logout" && result.status === 401) response.headers.set("Set-Cookie", clearCookie);
    } else if (route === "logout") {
      void result.body?.cancel().catch(() => {});
      if (![200, 204].includes(result.status)) throw new Error("Unconfirmed logout");
      response = Response.json({ authenticated: false, expiresAt: null, devices: [] }, { headers: privateHeaders });
      response.headers.set("Set-Cookie", clearCookie);
    } else if (route === "stream") {
      if (!result.headers.get("content-type")?.startsWith("text/event-stream") || !result.body) throw new Error("Invalid stream");
      clearTimeout(timer);
      isStreaming = true;
      return new Response(sanitizeSse(result.body, controller, cleanup), { headers: { ...privateHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no", Connection: "keep-alive" } });
    } else {
      let value: unknown = {};
      if (result.status !== 204) {
        if (!result.headers.get("content-type")?.startsWith("application/json")) throw new Error("Invalid content type");
        value = JSON.parse(await readBounded(result.body, 2_000_000, controller.signal));
      }
      const parsed = route === "session" || route === "login" ? normalizeSession(value) : route === "events" ? normalizeEvents(value) : normalizeStatus(value);
      if (!parsed) throw new Error("Invalid response");
      response = Response.json(parsed, { headers: privateHeaders });
      const cookies = result.headers.getSetCookie();
      if (cookies.length) {
        if (!["login", "session"].includes(route) || cookies.length !== 1 || !validSetCookie(cookies[0], config.production)) throw new Error("Invalid cookie");
        response.headers.set("Set-Cookie", cookies[0]);
      }
      if (route === "login" && (!cookies.length || !(parsed as { authenticated?: boolean }).authenticated)) throw new Error("Missing session");
    }
  } catch { controller.abort(); response = errorResponse(502); }
  finally { if (!isStreaming) cleanup(); }
  return response;
}
