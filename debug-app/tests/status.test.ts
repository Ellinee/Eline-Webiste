import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { SourceStatus } from "../src/pages/diagnostics/components/SourceStatus.tsx";
import { EventDetail } from "../src/pages/diagnostics/components/EventDetail.tsx";
import { normalizeEvent, normalizeStatus } from "../../debug/contract.ts";
import { statusFixture } from "../../tests/debug.fixture.ts";

const currentStatus = () => {
  const value = statusFixture();
  for (const source of Object.values(value.sources)) {
    source.lastSuccessAt = source.lastAttemptAt = source.status.lastSuccessAt = source.status.lastAttemptAt = new Date().toISOString();
  }
  return normalizeStatus(value)!;
};

test("readiness displays source observations, model versions, real ranges and capture memory rules", () => {
  const status = currentStatus();
  const html = renderToStaticMarkup(createElement(SourceStatus, { value: status }));
  for (const label of ["Event feed", "Last status success", "Model version", "Decision threshold", "Capture devices", "HTTP inference capture", "Source memory retention", "MQTT", "Kafka", "Leader", "Worker", "Acceleration (m/s²)", "Gyroscope (rad/s)", "0.24", "20260919085908"]) assert.ok(html.includes(label), label);
  assert.ok(html.includes(status.sources.radar.status.snapshot!.model.modelVersion));
  assert.ok(html.includes(status.sources.radar.status.lastSuccessAt!));
  assert.ok(!html.includes("FCM"));
});

test("failed frontend status refresh marks cached true readiness stale", () => {
  const html = renderToStaticMarkup(createElement(SourceStatus, { value: currentStatus(), failed: true }));
  assert.ok(html.includes("last known; stale"));
  assert.ok(html.includes("<dt>Model</dt><dd>Stale</dd>"));
  assert.ok(!html.includes("<dt>Ready</dt><dd>True</dd>"));
});

test("inference inspection keeps null decisions, coverage and time windows without invented delivery", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "vest", stage: "buffered", deviceId: "eline-vest-000000000000", at: new Date().toISOString(), output: { status: "insufficient_data", probability: null, decision: null, sampleCount: 200, coverage: 0.6, windowStartT: 0, windowEndT: 3000 }, durationMs: 12 })!;
  const html = renderToStaticMarkup(createElement(EventDetail, { event, onClose: () => {} }));
  for (const value of ["AI response", "insufficient_data", "Not available", "coverage", "sample Count", "window Start T", "3000", "12 ms"]) assert.ok(html.includes(value), value);
  assert.ok(!html.includes("<h3>Delivery</h3>"));
});
