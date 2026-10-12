import assert from "node:assert/strict";
import test from "node:test";
import { normalizeStatus } from "../debug/contract.ts";
import { handleDebugRequest } from "../debug/proxy.ts";

import { statusFixture, observedAt as at } from "./debug.fixture.ts";

for (const featureVersion of ["v2_rate_invariant", "v3_timestamp_resampled", "v4_native_cadence"]) {
  const fixture = () => {
    const value = statusFixture();
    value.sources.radar.status.snapshot.model.featureVersion = featureVersion;
    return value;
  };

  test(`status adapter retains ${featureVersion} across both normalization boundaries`, () => {
    const value = fixture();
    const result = normalizeStatus(value, Date.parse(at));
    assert.equal(result?.sources.radar.status.snapshot?.model.featureVersion, featureVersion);
    assert.equal(result?.sources.radar.status.snapshot?.model.name, "random_forest");
    assert.equal(result?.sources.radar.status.snapshot?.model.threshold, 0.24);
    assert.deepEqual(result?.sources.radar.status.readiness, value.sources.radar.status.snapshot.readiness);
    assert.deepEqual(result?.sources.vest.status.snapshot?.model, value.sources.vest.status.snapshot.model);
    assert.equal(result?.status, "ok");
    assert.deepEqual(normalizeStatus(result, Date.parse(at)), result);
  });

  test(`HTTP status proxy retains ${featureVersion} through viewer normalization`, async (context) => {
    context.mock.method(Date, "now", () => Date.parse(at));
    const value = fixture();
    const response = await handleDebugRequest(new Request("http://localhost/debug/api/status"), ["status"], { apiUrl: "http://localhost", allowedOrigin: "http://localhost", production: false }, async () => Response.json(value));
    assert.equal(response.status, 200);
    const body = await response.json();
    const result = normalizeStatus(body);
    assert.equal(result?.sources.radar.status.snapshot?.model.featureVersion, featureVersion);
    assert.equal(result?.sources.radar.status.readiness.ready, true);
    assert.deepEqual(result, body);
    assert.deepEqual(result, normalizeStatus(value));
  });

  test(`SSE status proxy retains ${featureVersion} through viewer normalization`, async (context) => {
    context.mock.method(Date, "now", () => Date.parse(at));
    const value = fixture();
    const response = await handleDebugRequest(new Request("http://localhost/debug/api/stream"), ["stream"], { apiUrl: "http://localhost", allowedOrigin: "http://localhost", production: false }, async () => new Response(`event: status\ndata: ${JSON.stringify(value)}\n\n`, { headers: { "Content-Type": "text/event-stream" } }));
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.match(body, /event: status/);
    const data = JSON.parse(body.split("\n").find((line) => line.startsWith("data: "))!.slice(6));
    const result = normalizeStatus(data);
    assert.equal(result?.sources.radar.status.snapshot?.model.featureVersion, featureVersion);
    assert.equal(result?.sources.radar.status.readiness.ready, true);
    assert.deepEqual(result, data);
    assert.deepEqual(result, normalizeStatus(value));
  });
}

test("status rejects unknown radar versions and invalid Vest hashes through normalization, HTTP and SSE", async () => {
  for (const [service, featureVersion] of [
    ["radar", "v3_unknown"],
    ["radar", "v4_timestamp_resampled"],
    ["radar", "v3_timestamp_resampled-extra"],
    ["radar", " v3_timestamp_resampled"],
    ["radar", "V3_timestamp_resampled"],
    ["radar", `sha256:${"b".repeat(64)}`],
    ["vest", "v2_rate_invariant"],
    ["vest", "v3_timestamp_resampled"],
    ["vest", `sha256:${"b".repeat(63)}`],
  ] as const) {
    const value = statusFixture();
    value.sources[service].status.snapshot.model.featureVersion = featureVersion;
    assert.equal(normalizeStatus(value, Date.parse(at)), null, `${service}: ${featureVersion}`);
    const response = await handleDebugRequest(new Request("http://localhost/debug/api/status"), ["status"], { apiUrl: "http://localhost", allowedOrigin: "http://localhost", production: false }, async () => Response.json(value));
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes(featureVersion), false);
    const stream = await handleDebugRequest(new Request("http://localhost/debug/api/stream"), ["stream"], { apiUrl: "http://localhost", allowedOrigin: "http://localhost", production: false }, async () => new Response(`event: status\ndata: ${JSON.stringify(value)}\n\n`, { headers: { "Content-Type": "text/event-stream" } }));
    await assert.rejects(stream.text(), /Diagnostics stream unavailable/);
  }
});

test("status adapter expires stale observations and does not infer readiness from events", () => {
  const result = normalizeStatus(statusFixture(), Date.parse(at) + 20000);
  assert.equal(result?.sources.radar.state, "connected");
  assert.equal(result?.sources.radar.status.readiness.model, "stale");
  assert.equal(result?.status, "degraded");
  const failed = statusFixture();
  failed.sources.radar.status.state = "unauthorized";
  assert.equal(normalizeStatus(failed, Date.parse(at))?.sources.radar.status.readiness.ready, "stale");
});

test("strict status proxy rejects nested unknown fields and token-shaped metadata", async () => {
  for (const mutate of [
    (v: ReturnType<typeof statusFixture>) => Object.assign(v, { token: "not-public" }),
    (v: ReturnType<typeof statusFixture>) => Object.assign(v.sources.radar.status.snapshot.model, { token: "not-public" }),
    (v: ReturnType<typeof statusFixture>) => { v.sources.radar.status.snapshot.model.modelVersion = "Bearer not-public"; },
    (v: ReturnType<typeof statusFixture>) => Object.assign(v.sources.radar.status.readiness, { token: true }),
    (v: ReturnType<typeof statusFixture>) => Object.assign(v.sources.radar.status.snapshot.buffer, { token: "not-public" }),
    (v: ReturnType<typeof statusFixture>) => Object.assign(v.sources.radar.status.snapshot.model.sensorRanges, { token: [0, 1] }),
  ]) {
    const value = structuredClone(statusFixture()); mutate(value);
    assert.equal(normalizeStatus(value), null);
    const result = await handleDebugRequest(new Request("http://localhost/debug/api/status"), ["status"], { apiUrl: "http://localhost", allowedOrigin: "http://localhost", production: false }, async () => Response.json(value));
    assert.equal(result.status, 502);
    assert.equal((await result.text()).includes("not-public"), false);
  }
});
