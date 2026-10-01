import assert from "node:assert/strict";
import test from "node:test";
import { normalizeStatus } from "../debug/contract.ts";
import { handleDebugRequest } from "../debug/proxy.ts";

import { statusFixture, observedAt as at } from "./debug.fixture.ts";

test("status adapter retains validated source contracts across both normalization boundaries", () => {
  const result = normalizeStatus(statusFixture(), Date.parse(at));
  assert.equal(result?.sources.radar.status.snapshot?.model.threshold, 0.24);
  assert.equal(result?.sources.vest.status.snapshot?.model.modelVersion, "20260919085908");
  assert.equal(result?.status, "ok");
  assert.deepEqual(normalizeStatus(result, Date.parse(at)), result);
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
