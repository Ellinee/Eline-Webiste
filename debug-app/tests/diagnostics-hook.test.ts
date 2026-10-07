import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getEventListeners } from "node:events";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as eventStore from "../src/lib/events.ts";
import type { DiagnosticEvent, EventPage } from "../src/types/index.ts";

const settle = () => new Promise<void>((resolve) => setImmediate(resolve));
const event = (id: number, deviceId = "eline-radar-000000000000"): DiagnosticEvent => ({ id: String(id), cursor: `instance:${id}`, source: "radar", stage: "validated", at: "2026-10-06T12:00:00Z", deviceId, truncated: false });
const page = (id: number, gap = false): EventPage => ({ events: [event(id)], cursor: `instance:${id}`, gap, truncated: false, hasMore: false });
type Subscription = { signal: AbortSignal; cursor?: string; onEvent: (event: DiagnosticEvent) => void; onGap: () => void; onCursor: (value: string) => void; onConnection: (value: string) => void; closed: boolean };
function mount(getEvents: (signal: AbortSignal, cursor?: string) => Promise<EventPage>) {
  const slots: unknown[] = [];
  const effects = new Map<number, { deps: unknown[]; cleanup?: () => void }>();
  let index = 0;
  let scheduled = false;
  let disposed = false;
  let devices = [event(0).deviceId];
  let pending: (() => void)[] = [];
  let current: ReturnType<typeof import("../src/hooks/useDiagnostics.ts").useDiagnostics>;
  let appends = 0;
  const subscriptions: Subscription[] = [];
  const window = new EventTarget();
  const timers = new Map<object, { fn: () => void; delay: number; repeat: boolean }>();
  const timer = (fn: () => void, delay: number, repeat = false) => { const id = {}; timers.set(id, { fn, delay, repeat }); return id; };
  const schedule = () => { if (!scheduled && !disposed) { scheduled = true; queueMicrotask(() => { scheduled = false; if (!disposed) render(); }); } };
  const react = {
    useRef: (value: unknown) => { const slot = index++; slots[slot] ??= { current: value }; return slots[slot]; },
    useState: (value: unknown) => {
      const slot = index++;
      if (!(slot in slots)) slots[slot] = typeof value === "function" ? value() : value;
      return [slots[slot], (next: unknown) => {
        const result = typeof next === "function" ? next(slots[slot]) : next;
        if (!Object.is(result, slots[slot])) { slots[slot] = result; schedule(); }
      }];
    },
    useEffect: (fn: () => (() => void) | undefined, deps: unknown[]) => {
      const slot = index++;
      const previous = effects.get(slot);
      if (!previous || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
        pending.push(() => { previous?.cleanup?.(); effects.set(slot, { deps, cleanup: fn() }); });
      }
    },
  };
  const api = { getEvents, subscribeEvents: (options: Subscription) => {
    const subscription = { ...options, closed: false };
    subscriptions.push(subscription);
    return () => { subscription.closed = true; };
  } };
  class CountedStore extends eventStore.DiagnosticEventStore {
    snapshot() { appends++; return super.snapshot(); }
  }
  const lib = { ...eventStore, DiagnosticEventStore: CountedStore, appendEvents: (...args: Parameters<typeof eventStore.appendEvents>) => { appends++; return eventStore.appendEvents(...args); } };
  const exports: Record<string, (devices: string[]) => typeof current> = {};
  const source = readFileSync(new URL("../src/hooks/useDiagnostics.ts", import.meta.url), "utf8");
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInNewContext(result.outputText, {
    exports, window, AbortController, Map, Set,
    setTimeout: (fn: () => void, delay: number) => timer(fn, delay), clearTimeout: (id: object) => timers.delete(id),
    setInterval: (fn: () => void, delay: number) => timer(fn, delay, true), clearInterval: (id: object) => timers.delete(id),
    require: (name: string) => {
      if (name === "react") return react;
      if (name === "@/api") return api;
      if (name === "@/lib" || name === "@/lib/events") return lib;
      if (name === "@/constants") return { maxEvents: 2000 };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  function render() { index = 0; current = exports.useDiagnostics(devices); const jobs = pending; pending = []; jobs.forEach((fn) => fn()); }
  render();
  return {
    get value() { return current; }, subscriptions, timers, window,
    get appends() { return appends; },
    tick(delay: number) { for (const [id, task] of [...timers]) if (task.delay <= delay && timers.has(id)) { if (!task.repeat) timers.delete(id); task.fn(); } },
    devices(value: string[]) { devices = value; render(); },
    stop() { disposed = true; effects.forEach((effect) => effect.cleanup?.()); },
  };
}

test("real diagnostics hook recovers an SSE gap with a fresh snapshot cursor and keeps explicit gap status", async () => {
  const calls: (string | undefined)[] = [];
  const h = mount(async (_signal, cursor) => { calls.push(cursor); return page(calls.length === 1 ? 1 : 100); });
  try {
    await settle();
    const old = h.subscriptions[0];
    old.onGap();
    await settle();
    h.tick(1000);
    await settle();
    assert.equal(h.subscriptions.length, 2, "gap must not become permanently offline");
    assert.deepEqual(calls, [undefined, undefined]);
    assert.equal(old.closed, true);
    assert.equal(old.signal.aborted, true);
    const resumed = h.subscriptions[1];
    assert.equal(resumed.cursor, "instance:100");
    resumed.onConnection("live");
    resumed.onEvent(event(101));
    old.onEvent(event(2));
    h.tick(1000);
    await settle();
    assert.equal(h.value.connection, "live");
    assert.equal(h.value.hasGap, true);
    assert.equal(h.value.hasError, false);
    assert.deepEqual(Array.from(h.value.events, (item) => item.cursor), ["instance:100", "instance:101"]);
  } finally { h.stop(); }
  assert.equal(h.timers.size, 0);
  assert.ok(h.subscriptions.every((item) => item.closed && item.signal.aborted));
  assert.equal(getEventListeners(h.window, 'debug:stop').length, 0);
});

test("snapshot gaps and failures share a bounded recovery budget with backoff", async () => {
  let requests = 0;
  const h = mount(async () => { requests++; if (requests > 1) throw new Error("offline"); return page(1, true); });
  try {
    await settle();
    for (const delay of [1000, 2000, 4000, 8000, 16000]) {
      assert.equal(h.timers.size, 1);
      assert.equal([...h.timers.values()][0].delay, delay);
      h.tick(delay);
      await settle();
    }
    h.tick(16000);
    await settle();
    assert.equal(requests, 6, "initial snapshot plus five bounded retries");
    assert.equal(h.value.connection, "offline");
    assert.equal(h.value.hasError, true);
    assert.equal(h.value.hasGap, true);
    assert.equal(h.subscriptions.length, 0);
    assert.equal(h.timers.size, 0);
    h.value.retry();
    await settle();
    assert.equal(requests, 7);
  } finally { h.stop(); }
  assert.equal(h.timers.size, 0);
});

test("high-rate input is stored boundedly without rebuilding 2000 retained rows per message", async () => {
  const h = mount(async () => page(0));
  try {
    await settle();
    const stream = h.subscriptions[0];
    for (let id = 1; id <= 6000; id++) stream.onEvent(event(id));
    stream.onEvent(event(6001, "unauthorized"));
    stream.onEvent({ ...event(6002), stage: "inference" });
    assert.ok(h.appends <= 2, `only snapshot/flush may rebuild arrays, got ${h.appends}`);
    assert.equal(h.value.events.length, 1);
    h.tick(1000);
    await settle();
    assert.equal(h.value.events.length, 2000);
    assert.equal(h.value.events[0].cursor, "instance:4001");
    assert.equal(h.value.events.at(-1)?.cursor, "instance:6000");
    assert.equal(h.timers.size, 1);
  } finally { h.stop(); }
  assert.equal(h.timers.size, 0);
});

test("terminal SSE offline flushes final data and leaves no polling timer", async () => {
  const h = mount(async () => page(0));
  try {
    await settle();
    const stream = h.subscriptions[0];
    stream.onEvent(event(1));
    stream.onConnection("offline");
    await settle();
    assert.equal(h.value.connection, "offline");
    assert.equal(h.value.events.at(-1)?.cursor, "instance:1");
    assert.equal(stream.closed, true);
    assert.equal(stream.signal.aborted, true);
    assert.equal(h.timers.size, 0);
  } finally { h.stop(); }
});

test("repeated successful snapshots followed by gaps cannot reset the recovery budget", async () => {
  let requests = 0;
  const h = mount(async () => page(++requests * 100));
  try {
    await settle();
    for (let i = 0; i < 6; i++) {
      h.subscriptions.at(-1)!.onGap();
      await settle();
      h.tick(16000);
      await settle();
    }
    assert.equal(requests, 6);
    assert.equal(h.value.hasGap, true);
    assert.equal(h.value.hasError, true);
    assert.equal(h.value.connection, "offline");
    assert.equal(h.timers.size, 0);
    assert.ok(h.subscriptions.every((item) => item.closed));
  } finally { h.stop(); }
});

for (const action of ["stop", "unmount", "pause"] as const) {
  test(`gap recovery timer cannot reconnect after ${action}`, async () => {
    let requests = 0;
    const h = mount(async () => page(++requests));
    try {
      await settle();
      h.subscriptions[0].onGap();
      await settle();
      assert.equal(h.timers.size, 1);
      if (action === "stop") h.window.dispatchEvent(new Event("debug:stop"));
      if (action === "unmount") h.stop();
      if (action === "pause") h.value.togglePause();
      await settle();
      h.tick(16000);
      await settle();
      assert.equal(requests, 1);
      assert.equal(h.timers.size, 0);
    } finally { h.stop(); }
    assert.equal(getEventListeners(h.window, "debug:stop").length, 0);
  });
}

for (const action of ["stop", "unmount", "devices", "pause"] as const) {
  test(`late snapshot cannot revive hook after ${action}`, async () => {
    const requests: { signal: AbortSignal; resolve: (value: EventPage) => void }[] = [];
    const h = mount((signal) => new Promise((resolve) => requests.push({ signal, resolve })));
    try {
      if (action === "stop") h.window.dispatchEvent(new Event("debug:stop"));
      if (action === "unmount") h.stop();
      if (action === "devices") h.devices(["eline-vest-000000000000"]);
      if (action === "pause") h.value.togglePause();
      await settle();
      assert.equal(requests[0].signal.aborted, true);
      requests[0].resolve(page(5));
      await settle();
      assert.equal(h.subscriptions.length, 0);
    } finally { h.stop(); requests.forEach((request) => request.resolve(page(10))); await settle(); }
    assert.equal(h.timers.size, 0);
  });
}
