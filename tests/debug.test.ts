import assert from "node:assert/strict";
import test from "node:test";
import { normalizeEvent, normalizeEvents, normalizeSession, normalizeStatus } from "../debug/contract.ts";
import { handleDebugRequest } from "../debug/proxy.ts";
import { safeAssetName } from "../debug/assets.ts";
import { statusFixture } from "./debug.fixture.ts";

const origin = "https://diagnostics.test";
const config = { apiUrl: "https://backend.test/debug", allowedOrigin: origin, production: true };
const session = { authenticated: true, expiresAt: "2030-01-01T00:00:00Z", devices: ["eline-radar-0123456789ab"] };
const request = (path: string, init?: RequestInit) => new Request(`${origin}/debug/api/${path}`, init);
const invoke = (req: Request, path: string[], fetcher: typeof fetch = async () => Response.json(session)) => handleDebugRequest(req, path, config, fetcher);

const event = { id: "event-1", cursor: "1", at: "2026-09-30T10:00:00Z", source: "radar", stage: "inference", publicDeviceId: session.devices[0], output: { status: "ok", decision: "normal", probability: 0.1, threshold: 0.24, modelVersion: "a".repeat(64), secret: "discard" }, input: { frameCount: 20, preview: [1, 2, 3], raw: "discard" }, password: "discard" };

test("contract only exposes bounded allowlisted summaries", () => {
  const value = normalizeEvent(event);
  assert.equal(value?.deviceId, session.devices[0]);
  assert.equal(value?.output?.probability, 0.1);
  assert.ok(!JSON.stringify(value).includes("discard"));
  assert.equal(normalizeEvent({ ...event, source: "unknown" }), null);
  assert.equal(normalizeEvent({ ...event, stage: "delivered_to_mobile" }), null);
  assert.equal(normalizeEvent({ ...event, at: "yesterday" }), null);
  assert.equal(normalizeEvent({ ...event, input: { preview: Array(50).fill(1) } })?.input?.preview?.length, 12);
  assert.equal(normalizeEvent({ ...event, input: { preview: Array(50).fill(1) } })?.truncated, true);
  assert.equal(normalizeEvent({ ...event, output: { probability: Infinity } })?.output?.probability, undefined);
});

test("inference and reason fields cannot carry arbitrary tokens", () => {
  for (const output of [{ modelVersion: "Bearer not-public" }, { featureVersion: "not-public" }, { decision: "not-public" }, { status: "not-public" }, { published: true }]) {
    assert.equal(normalizeEvent({ ...event, output }), null);
  }
  assert.equal(normalizeEvent({ ...event, reason: "not-public" }), null);
});

test("session and status reject unknown structures", () => {
  assert.deepEqual(normalizeSession(session), session);
  assert.equal(normalizeSession({ authenticated: true, devices: [] }), null);
  assert.deepEqual(normalizeSession({ authenticated: false, devices: ["secret"] }), { authenticated: false, expiresAt: null, devices: [] });
  assert.equal(normalizeStatus({ secret: "discard" }), null);
});

test("actual backend session, merged event pages, and source status normalize", async () => {
  const instanceId = "12345678-1234-4234-8234-123456789abc";
  assert.deepEqual(normalizeSession({ authenticated: true, expiresAt: session.expiresAt, deviceIds: session.devices }), session);
  const page = { schemaVersion: 1, instanceId, cursor: `${instanceId}:2`, reset: false, hasMore: true, events: [{ id: 2, service: "radar", deviceId: session.devices[0], at: event.at, stage: "buffered", reason: "collecting", durationMs: 12, input: { totalCount: 30, truncated: true, frames: [{ t: 12, targets: [{ slot: 0, valid: true, x: 1, y: 2, speed: 3 }] }] } }] };
  const result = normalizeEvents(page);
  assert.equal(result?.events[0].cursor, `${instanceId}:2`);
  assert.equal(result?.events[0].input?.totalCount, 30);
  assert.equal(result?.events[0].coordinates?.x, 1);
  assert.equal(result?.events[0].latencyMs, 12);
  assert.equal(result?.hasMore, true);
  const statusInput = statusFixture();
  statusInput.retention.events = 30;
  const status = normalizeStatus(statusInput);
  assert.equal(status?.sources.radar.state, "connected");
  assert.equal(status?.retention.events, 30);
  const response = await invoke(request(`events?cursor=${instanceId}:1&limit=100`), ["events"], async (url) => {
    assert.equal(new URL(String(url)).searchParams.get("after"), `${instanceId}:1`);
    assert.equal(new URL(String(url)).searchParams.has("cursor"), false);
    return Response.json(page);
  });
  assert.equal(response.status, 200);
  const stream = await invoke(request("stream"), ["stream"], async () => new Response(`event: events\ndata: ${JSON.stringify(page)}\n\n`, { headers: { "Content-Type": "text/event-stream" } }));
  assert.match(await stream.text(), /event: diagnostic/);
});

test("asset names cannot escape the build directory", () => {
  assert.equal(safeAssetName("index-Ab12_cd9.js"), true);
  for (const name of ["../index.html", "%2e%2e.js", "a/b.js", "a\\b.js", "index.js.map", "index.html", ".env", "C:evil.js"]) assert.equal(safeAssetName(name), false);
});

test("proxy rejects unknown routes, methods, query keys and origins before fetch", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return Response.json(session); };
  for (const [path, parts] of [["anything", ["anything"]], ["session/extra", ["session", "extra"]], ["events?url=https://evil.test", ["events"]]] as const) {
    assert.ok((await invoke(request(path), [...parts], fetcher)).status >= 400);
  }
  assert.equal((await invoke(request("login", { method: "GET" }), ["login"], fetcher)).status, 405);
  for (const supplied of [undefined, "https://evil.test", "null"]) {
    assert.equal((await invoke(request("login", { method: "POST", headers: { ...(supplied ? { Origin: supplied } : {}), "Content-Type": "application/json" }, body: '{"password":"test"}' }), ["login"], fetcher)).status, 403);
  }
  assert.equal(calls, 0);
});

test("proxy accepts the configured public host behind an internal Next origin", async () => {
  for (const internal of ["http://localhost:8080", "https://0.0.0.0:8080"]) {
    for (const route of ["session", "login", "logout"]) {
      let calls = 0;
      const post = route !== "session";
      const response = await invoke(new Request(`${internal}/debug/api/${route}`, {
        method: post ? "POST" : "GET",
        headers: { Host: new URL(origin).host, "Sec-Fetch-Site": "same-origin", ...(post ? { Origin: origin, "Content-Type": "application/json" } : {}) },
        ...(post ? { body: route === "login" ? '{"password":"test"}' : "{}" } : {}),
      }), [route], async (url, init) => {
        calls++;
        assert.equal(String(url), `https://backend.test/debug/${route}`);
        assert.equal(new Headers(init?.headers).get("origin"), post ? origin : null);
        return Response.json(route === "session" ? { authenticated: false } : session, { headers: route === "login" ? { "Set-Cookie": "eline_debug_session=abc123; Path=/debug; HttpOnly; Secure; SameSite=Strict" } : {} });
      });
      assert.equal(response.status, 200);
      assert.equal(calls, 1);
    }
  }
});

test("proxy never trusts forwarded headers to authorize an unknown host", async () => {
  const fetcher: typeof fetch = async () => { assert.fail("Unexpected fetch"); };
  for (const host of [undefined, "evil.test", "localhost:8080", "diagnostics.test.evil.test", "diagnostics.test, evil.test", "diagnostics.test:8080", "diagnostics.test@evil.test"]) {
    const headers = { ...(host ? { Host: host } : {}), Origin: origin, "X-Forwarded-Host": new URL(origin).host, "X-Forwarded-Proto": "https", Forwarded: `host=${new URL(origin).host};proto=https` };
    const response = await invoke(new Request("http://localhost:8080/debug/api/session", { headers }), ["session"], fetcher);
    assert.equal(response.status, 403);
  }
  assert.equal((await invoke(request("session", { headers: { Host: "evil.test" } }), ["session"], fetcher)).status, 403);
});

test("proxy checks the canonical browser Origin before processing proxied login", async () => {
  const fetcher: typeof fetch = async () => { assert.fail("Unexpected fetch"); };
  for (const supplied of [undefined, "null", "http://localhost:8080", "http://diagnostics.test", "https://evil.test"]) {
    const response = await invoke(new Request("http://localhost:8080/debug/api/login", {
      method: "POST", headers: { Host: new URL(origin).host, ...(supplied ? { Origin: supplied } : {}), "Content-Type": "application/json", "X-Forwarded-Host": "evil.test" }, body: "{}",
    }), ["login"], fetcher);
    assert.equal(response.status, 403);
  }
});

test("proxy ignores spoofed forwarding headers on a canonical request", async () => {
  const response = await invoke(new Request("http://localhost:8080/debug/api/session", { headers: { Host: new URL(origin).host, "X-Forwarded-Host": "evil.test", "X-Forwarded-Proto": "http" } }), ["session"], async (_url, init) => {
    const headers = new Headers(init?.headers);
    for (const name of ["host", "origin", "x-forwarded-host", "x-forwarded-proto"]) assert.equal(headers.get(name), null);
    return Response.json({ authenticated: false });
  });
  assert.equal(response.status, 200);
});

test("proxy forwards only the session cookie and actual browser origin", async () => {
  const response = await invoke(request("session", { headers: { Cookie: "analytics=private; eline_debug_session=abc123; auth=secret", Origin: origin, Authorization: "Bearer secret", "X-Forwarded-Host": "evil.test", "X-Forwarded-For": "192.0.2.1", "X-Real-IP": "192.0.2.2", Forwarded: "for=192.0.2.3" } }), ["session"], async (url, init) => {
    assert.equal(String(url), "https://backend.test/debug/session");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("cookie"), "eline_debug_session=abc123");
    assert.equal(headers.get("origin"), origin);
    assert.equal(headers.get("authorization"), null);
    assert.equal(headers.get("x-forwarded-host"), null);
    assert.equal(headers.get("x-forwarded-for"), null);
    assert.equal(headers.get("x-real-ip"), null);
    assert.equal(headers.get("forwarded"), null);
    assert.equal(init?.redirect, "manual");
    return Response.json(session);
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("proxy never synthesizes an Origin on same-origin GET", async () => {
  await invoke(request("session"), ["session"], async (_url, init) => {
    assert.equal(new Headers(init?.headers).get("origin"), null);
    return Response.json(session);
  });
});

test("upstream errors and redirects cannot leak bodies or cookies", async () => {
  for (const status of [302, 401, 500]) {
    const response = await invoke(request("status"), ["status"], async () => new Response("sensitive upstream stack", { status, headers: { "Set-Cookie": "auth=secret", Location: "https://evil.test" } }));
    assert.ok(!((await response.text()).includes("sensitive")));
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(response.headers.get("location"), null);
  }
});

test("login validates cookie name, path, HttpOnly and Secure", async () => {
  for (const cookie of ["auth=bad; Path=/debug; HttpOnly; Secure; SameSite=Strict", "eline_debug_session=bad; Path=/; HttpOnly; Secure; SameSite=Strict", "eline_debug_session=bad; Path=/debug; SameSite=Strict", "eline_debug_session=bad; Path=/debug; HttpOnly; SameSite=Strict", "eline_debug_session=bad; Path=/debug; HttpOnly; Secure; SameSite=Strict; Domain=diagnostics.test"]) {
    const response = await invoke(request("login", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: '{"password":"test"}' }), ["login"], async () => Response.json(session, { headers: { "Set-Cookie": cookie } }));
    assert.equal(response.status, 502);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  const cookie = "eline_debug_session=abc123; Path=/debug; HttpOnly; Secure; SameSite=Strict";
  const response = await invoke(request("login", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: '{"password":"test"}' }), ["login"], async () => Response.json(session, { headers: { "Set-Cookie": cookie } }));
  assert.equal(response.headers.get("set-cookie"), cookie);
});

for (const production of [true, false]) {
  for (const route of ["login", "session"]) {
    test(`${route} accepts only Strict session cookies (production=${production})`, async () => {
      for (const sameSite of ["Lax", "None", "", "Strict", "strict", "sTrIcT"]) {
        const cookie = `eline_debug_session=abc123; Path=/debug; HttpOnly${production ? "; Secure" : ""}${sameSite ? `; SameSite=${sameSite}` : ""}`;
        const init = route === "login" ? { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: '{"password":"test"}' } : undefined;
        const response = await handleDebugRequest(request(route, init), [route], { ...config, production }, async () => Response.json(session, { headers: { "Set-Cookie": cookie } }));
        const valid = sameSite.toLowerCase() === "strict";
        assert.equal(response.status, valid ? 200 : 502, sameSite);
        assert.equal(response.headers.get("set-cookie"), valid ? cookie : null, sameSite);
      }
    });
  }
}

for (const failure of ["network", "abort", 201, 202, 302, 400, 403, 404, 429, 500, 503] as const) {
  test(`logout preserves the HttpOnly cookie on ${failure} and retries the same session`, async () => {
    const cookie = "eline_debug_session=abc123";
    let browserCookie: string | null = cookie;
    const received: (string | null)[] = [];
    let revoked = false;
    const fetcher: typeof fetch = async (_url, init) => {
      received.push(new Headers(init?.headers).get("cookie"));
      if (received.length === 1) {
        if (failure === "network") throw new Error("offline");
        if (failure === "abort") throw new DOMException("Timed out", "AbortError");
        return Response.json({ error: "not revoked" }, { status: failure, headers: { "Set-Cookie": "eline_debug_session=; Path=/debug; HttpOnly; Secure; SameSite=Strict; Max-Age=0" } });
      }
      revoked = received.at(-1) === cookie;
      return new Response(null, { status: revoked ? 204 : 401 });
    };
    const logout = async () => {
      const response = await invoke(request("logout", { method: "POST", headers: { Origin: origin, ...(browserCookie ? { Cookie: browserCookie } : {}) } }), ["logout"], fetcher);
      if (response.headers.get("set-cookie")?.includes("Max-Age=0")) browserCookie = null;
      return response;
    };
    const failed = await logout();
    assert.equal(browserCookie, cookie);
    assert.equal(failed.headers.get("set-cookie"), null);
    assert.ok(failed.status >= 400);
    assert.equal(revoked, false);
    const retried = await logout();
    assert.equal(retried.status, 200);
    assert.deepEqual(await retried.json(), { authenticated: false, expiresAt: null, devices: [] });
    assert.deepEqual(received, [cookie, cookie]);
    assert.equal(revoked, true);
    assert.equal(browserCookie, null);
    assert.match(retried.headers.get("set-cookie") ?? "", /eline_debug_session=; Path=\/debug; HttpOnly; SameSite=Strict; Max-Age=0; Secure/);
  });
}

for (const status of [200, 204, 401]) {
  test(`logout clears the cookie after backend ${status}, including an expired session`, async () => {
    const response = await invoke(request("logout", { method: "POST", headers: { Origin: origin, Cookie: "eline_debug_session=expired" } }), ["logout"], async (_url, init) => {
      assert.equal(new Headers(init?.headers).get("cookie"), "eline_debug_session=expired");
      return status === 204 ? new Response(null, { status }) : Response.json(status === 401 ? { error: "unauthorized" } : { authenticated: false, expiresAt: null, deviceIds: [] }, { status });
    });
    assert.equal(response.status, status === 401 ? 401 : 200);
    assert.match(response.headers.get("set-cookie") ?? "", /eline_debug_session=;.*Max-Age=0/);
  });
}

test("logout timeout keeps the cookie for a retry after BE revocation or expiry", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const cookie = "eline_debug_session=abc123";
  let signal: AbortSignal | null | undefined;
  const logoutRequest = () => request("logout", { method: "POST", headers: { Origin: origin, Cookie: cookie } });
  const pending = invoke(logoutRequest(), ["logout"], async (_url, init) => {
    signal = init?.signal;
    assert.equal(new Headers(init?.headers).get("cookie"), cookie);
    return new Promise<Response>((_resolve, reject) => signal?.addEventListener("abort", () => reject(new Error("timeout"))));
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  context.mock.timers.tick(10_001);
  const response = await pending;
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(signal?.aborted, true);
  const retried = await invoke(logoutRequest(), ["logout"], async (_url, init) => {
    assert.equal(new Headers(init?.headers).get("cookie"), cookie);
    return new Response(null, { status: 401 });
  });
  assert.equal(retried.status, 401);
  assert.match(retried.headers.get("set-cookie") ?? "", /Max-Age=0/);
});

test("rate-limited login preserves only a bounded Retry-After cooldown", async () => {
  for (const retryAfter of ["900", "0", "10000", "tomorrow"]) {
    const response = await invoke(request("login", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: '{"password":"test"}' }), ["login"], async () => Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": retryAfter } }));
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), ["900", "0"].includes(retryAfter) ? retryAfter : null);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("logout rejected before reaching BE leaves the cookie intact", async () => {
  const response = await invoke(request("logout", { method: "POST", headers: { Origin: "https://evil.test", Cookie: "eline_debug_session=abc123" } }), ["logout"], async () => { assert.fail("Unexpected fetch"); });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("oversized login and upstream JSON fail closed", async () => {
  let calls = 0;
  const response = await invoke(request("login", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ password: "a".repeat(5000) }) }), ["login"], async () => { calls++; return Response.json(session); });
  assert.equal(response.status, 413);
  assert.equal(calls, 0);
  const huge = await invoke(request("events"), ["events"], async () => new Response("a".repeat(2_100_000), { headers: { "Content-Type": "application/json" } }));
  assert.equal(huge.status, 502);
});

test("JSON timeout aborts the upstream request after ten seconds", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  let signal: AbortSignal | null | undefined;
  const pending = invoke(request("session"), ["session"], async (_url, init) => {
    signal = init?.signal;
    return new Promise<Response>((_resolve, reject) => signal?.addEventListener("abort", () => reject(new Error("timeout"))));
  });
  context.mock.timers.tick(10_001);
  assert.equal((await pending).status, 502);
  assert.equal(signal?.aborted, true);
});

test("idle SSE closes after the heartbeat deadline", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  let cancelled = false;
  const response = await invoke(request("stream"), ["stream"], async () => new Response(new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } }), { headers: { "Content-Type": "text/event-stream" } }));
  const pending = response.text();
  context.mock.timers.tick(45_001);
  await assert.rejects(pending);
  assert.equal(cancelled, true);
});

test("invalid configuration and query manipulation never reach an upstream", async () => {
  const fetcher: typeof fetch = async () => { assert.fail("Unexpected fetch"); };
  for (const apiUrl of ["https://backend.test/other", "https://user:password@backend.test", "https://backend.test?url=evil", "file:///private", "http://backend.test"]) {
    assert.equal((await handleDebugRequest(request("session"), ["session"], { ...config, apiUrl }, fetcher)).status, 503);
  }
  for (const query of ["limit=101", "limit=1&limit=2", "cursor=abc%0Aevil", "after=abc", "url=https://evil.test"]) assert.equal((await invoke(request(`events?${query}`), ["events"], fetcher)).status, 400);
  assert.equal((await invoke(request("session", { headers: { Origin: "https://evil.test" } }), ["session"], fetcher)).status, 403);
  assert.equal((await invoke(request("session", { headers: { "Sec-Fetch-Site": "cross-site" } }), ["session"], fetcher)).status, 403);
});

test("SSE oversized, invalid and reset frames are bounded", async () => {
  for (const raw of ["x".repeat(524_289), 'event: diagnostic\ndata: {}\n\n', 'id: wrong\nevent: diagnostic\ndata: ' + JSON.stringify(event) + '\n\n']) {
    const response = await invoke(request("stream"), ["stream"], async () => new Response(raw, { headers: { "Content-Type": "text/event-stream" } }));
    await assert.rejects(response.text());
  }
  const response = await invoke(request("stream"), ["stream"], async () => new Response('event: reset\ndata: {"secret":"discard"}\n\n', { headers: { "Content-Type": "text/event-stream" } }));
  assert.equal(await response.text(), 'event: gap\ndata: {"gap":true}\n\n');
});

test("request cancellation terminates upstream SSE and releases resources", async () => {
  let cancelled = false;
  const controller = new AbortController();
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  const response = await invoke(request("stream", { signal: controller.signal }), ["stream"], async () => new Response(body, { headers: { "Content-Type": "text/event-stream" } }));
  const pending = response.text();
  controller.abort();
  await assert.rejects(pending, /unavailable/);
  assert.equal(cancelled, true);
});

test("SSE validates frames, preserves cursor, and redacts raw data", async () => {
  const body = `id: 1\nevent: diagnostic\ndata: ${JSON.stringify(event)}\n\nevent: unknown\ndata: {"secret":"discard"}\n\n: heartbeat\n\n`;
  const response = await invoke(request("stream"), ["stream"], async () => new Response(body, { headers: { "Content-Type": "text/event-stream" } }));
  const output = await response.text();
  assert.match(output, /event: diagnostic/);
  assert.match(output, /id: 1/);
  assert.match(output, /event: heartbeat/);
  assert.ok(!output.includes("discard"));
  assert.equal(response.headers.get("x-accel-buffering"), "no");
});
