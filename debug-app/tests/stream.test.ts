import assert from "node:assert/strict";
import test from "node:test";
import { subscribeEvents } from "../src/api/diagnostics/stream.ts";
import { apiClient, queryClient } from "../src/config/index.ts";
import { queryKeys } from "../src/api/queryKeys.ts";
import { statusFixture } from "../../tests/debug.fixture.ts";

class FakeSource extends EventTarget {
  static instances: FakeSource[] = [];
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  constructor(public url: string) { super(); FakeSource.instances.push(this); }
  close() { this.closed = true; }
}

test("stream handles checkpoint, gap and abort without orphan subscriptions", () => {
  const originalSource = globalThis.EventSource;
  Object.assign(globalThis, { EventSource: FakeSource });
  try {
    const controller = new AbortController();
    let gaps = 0;
    let cursor = "";
    const stop = subscribeEvents({ signal: controller.signal, cursor: "a:1", onCursor: (value) => { cursor = value; }, onEvent: () => {}, onConnection: () => {}, onGap: () => { gaps++; } });
    const source = FakeSource.instances.at(-1)!;
    assert.equal(source.url, "/debug/api/stream?cursor=a%3A1");
    source.dispatchEvent(new MessageEvent("checkpoint", { data: '{"cursor":"a:2"}' }));
    assert.equal(cursor, "a:2");
    source.dispatchEvent(new MessageEvent("gap", { data: '{"gap":true}' }));
    assert.equal(gaps, 1);
    assert.equal(source.closed, true);
    stop();
    const second = new AbortController();
    subscribeEvents({ signal: second.signal, onCursor: () => {}, onEvent: () => {}, onConnection: () => {}, onGap: () => {} });
    second.abort();
    assert.equal(FakeSource.instances.at(-1)!.closed, true);
  } finally { Object.assign(globalThis, { EventSource: originalSource }); }
});

test("reconnect budget ends after five retries with no parallel sources", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const originalSource = globalThis.EventSource;
  const adapter = apiClient.defaults.adapter;
  Object.assign(globalThis, { EventSource: FakeSource });
  apiClient.defaults.adapter = async (config) => ({ config, data: { authenticated: true, expiresAt: "2030-01-01T00:00:00Z", devices: [] }, status: 200, statusText: "OK", headers: {} });
  const start = FakeSource.instances.length;
  let connection = "";
  const stop = subscribeEvents({ signal: new AbortController().signal, onCursor: () => {}, onEvent: () => {}, onConnection: (value) => { connection = value; }, onGap: () => {} });
  try {
    for (let i = 0; i < 6; i++) {
      FakeSource.instances.at(-1)!.onerror?.();
      await new Promise<void>((resolve) => setImmediate(resolve));
      context.mock.timers.tick(Math.min(1000 * 2 ** i, 16_000));
    }
    assert.equal(connection, "offline");
    assert.equal(FakeSource.instances.length - start, 6);
    assert.ok(FakeSource.instances.slice(start).every((source) => source.closed));
  } finally { stop(); apiClient.defaults.adapter = adapter; Object.assign(globalThis, { EventSource: originalSource }); }
});

test("repeated errors during session revalidation create only one reconnect", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const originalSource = globalThis.EventSource;
  const adapter = apiClient.defaults.adapter;
  Object.assign(globalThis, { EventSource: FakeSource });
  let calls = 0;
  const releases: (() => void)[] = [];
  apiClient.defaults.adapter = async (config) => {
    calls++;
    await new Promise<void>((resolve) => releases.push(resolve));
    return { config, data: { authenticated: true, expiresAt: "2030-01-01T00:00:00Z", devices: [] }, status: 200, statusText: "OK", headers: {} };
  };
  const start = FakeSource.instances.length;
  const stop = subscribeEvents({ signal: new AbortController().signal, onCursor: () => {}, onEvent: () => {}, onConnection: () => {}, onGap: () => {} });
  try {
    const source = FakeSource.instances.at(-1)!;
    source.onerror?.();
    source.onerror?.();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(calls, 1);
    releases.forEach((release) => release());
    await new Promise<void>((resolve) => setImmediate(resolve));
    context.mock.timers.tick(16_000);
    assert.equal(FakeSource.instances.length - start, 2);
  } finally { releases.forEach((release) => release()); stop(); apiClient.defaults.adapter = adapter; Object.assign(globalThis, { EventSource: originalSource }); }
});

test("status SSE accepts bounded full source settings and rejects injected metadata", () => {
  const originalSource = globalThis.EventSource;
  Object.assign(globalThis, { EventSource: FakeSource });
  const stop = subscribeEvents({ signal: new AbortController().signal, onCursor: () => {}, onEvent: () => {}, onConnection: () => {}, onGap: () => {} });
  try {
    const value = statusFixture();
    value.sources.radar.status.snapshot.allowedDeviceIds = Array.from({ length: 100 }, (_, i) => `eline-radar-${i.toString(16).padStart(12, "0")}`);
    const data = JSON.stringify(value);
    assert.ok(data.length > 4096);
    const source = FakeSource.instances.at(-1)!;
    source.dispatchEvent(new MessageEvent("status", { data }));
    assert.equal(source.closed, false);
    assert.ok(queryClient.getQueryData(queryKeys.status));
    value.sources.radar.status.snapshot.model.modelVersion = "Bearer not-public";
    source.dispatchEvent(new MessageEvent("status", { data: JSON.stringify(value) }));
    assert.equal(source.closed, true);
  } finally { stop(); queryClient.clear(); Object.assign(globalThis, { EventSource: originalSource }); }
});

test("oversized status frames close SSE before normalization", () => {
  const originalSource = globalThis.EventSource;
  Object.assign(globalThis, { EventSource: FakeSource });
  const stop = subscribeEvents({ signal: new AbortController().signal, onCursor: () => {}, onEvent: () => {}, onConnection: () => {}, onGap: () => {} });
  try {
    queryClient.clear();
    const source = FakeSource.instances.at(-1)!;
    source.dispatchEvent(new MessageEvent("status", { data: "x".repeat(65_537) }));
    assert.equal(source.closed, true);
    assert.equal(queryClient.getQueryData(queryKeys.status), undefined);
  } finally { stop(); queryClient.clear(); Object.assign(globalThis, { EventSource: originalSource }); }
});

test("malformed or oversized events fail closed", () => {
  const originalSource = globalThis.EventSource;
  Object.assign(globalThis, { EventSource: FakeSource });
  try {
    for (const data of ["{", "x".repeat(70_000)]) {
      let connection = "";
      subscribeEvents({ signal: new AbortController().signal, onCursor: () => {}, onEvent: () => { assert.fail("Invalid event exposed"); }, onConnection: (value) => { connection = value; }, onGap: () => {} });
      const source = FakeSource.instances.at(-1)!;
      source.dispatchEvent(new MessageEvent("diagnostic", { data }));
      assert.equal(connection, "offline");
      assert.equal(source.closed, true);
    }
  } finally { Object.assign(globalThis, { EventSource: originalSource }); }
});
