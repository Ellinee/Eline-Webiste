import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { SourceStatus } from "../src/pages/diagnostics/components/SourceStatus.tsx";
import { EventDetail, SensorValues } from "../src/pages/diagnostics/components/EventDetail.tsx";
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

test("radar inspection shows captured x, y and speed for each preview frame and target", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "radar", stage: "mqtt_received", deviceId: "eline-radar-000000000000", at: new Date().toISOString(), input: { totalCount: 30, frames: [{ t: 10, targets: [{ slot: 0, valid: true, x: 1.5, y: -2, speed: 0 }, { slot: 1, valid: false, x: null, y: null, speed: null }] }, { t: 20, targets: [{ slot: 0, valid: true, x: 3, y: -4, speed: 0.5 }] }] } })!;
  const html = renderToStaticMarkup(createElement(EventDetail, { event, onClose: () => {} }));
  for (const value of ["Sensor readings", "Radar frame preview", 'scope="col">x', 'scope="col">y', 'scope="col">speed', "1.5", "-2", "0.5", "Not available", "Invalid", "2 preview frames"]) assert.ok(html.includes(value), value);
  assert.ok(!html.includes("Last preview coordinates"));
});

test("timeline sensor cells display readings without opening event inspection", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "radar", stage: "mqtt_received", deviceId: "eline-radar-000000000000", at: new Date().toISOString(), input: { x: 0, y: -2, speed: 1.5 } })!;
  const html = renderToStaticMarkup(createElement(SensorValues, { event }));
  assert.ok(html.includes("x: 0 · y: -2 · speed: 1.5"));
  assert.ok(!html.includes("AI decision"));
});

test("an empty last radar frame does not hide or deny earlier captured readings", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "radar", stage: "mqtt_received", deviceId: "eline-radar-000000000000", at: new Date().toISOString(), input: { frames: [{ t: 1, targets: [{ valid: true, x: 1.5, y: -2, speed: 0 }] }, { t: 2, targets: [] }] } })!;
  const html = renderToStaticMarkup(createElement(EventDetail, { event, onClose: () => {} }));
  assert.ok(html.includes("No targets in last preview frame."));
  assert.ok(html.includes("2 preview frames"));
  assert.ok(html.includes("1.5"));
  assert.ok(!html.includes("Sensor values were not included in this event."));
});

test("vest inspection displays timed acceleration and gyroscope samples", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "vest", stage: "mqtt_received", deviceId: "eline-vest-000000000000", at: new Date().toISOString(), input: { samples: [{ t: 0, ax: 0, ay: -1, az: 9.81, gx: 0.1, gy: 0.2, gz: -0.3 }] } })!;
  const html = renderToStaticMarkup(createElement(EventDetail, { event, onClose: () => {} }));
  for (const value of ["Vest sample preview", 'scope="col">ax', 'scope="col">ay', 'scope="col">az', 'scope="col">gx', 'scope="col">gy', 'scope="col">gz', "9.81", "-0.3"]) assert.ok(html.includes(value), value);
});

test("sensor inspection explicitly reports missing captures rather than treating predictions as readings", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "radar", stage: "inference", deviceId: "eline-radar-000000000000", at: new Date().toISOString(), output: { status: "ok", probability: 0.6, decision: "possible_fall" } })!;
  const html = renderToStaticMarkup(createElement(EventDetail, { event, onClose: () => {} }));
  assert.ok(html.includes("Sensor values were not included in this event."));
  assert.ok(html.includes("AI response"));
});

test("inference inspection keeps null decisions, coverage and time windows without invented delivery", () => {
  const event = normalizeEvent({ id: "1", cursor: "1", source: "vest", stage: "buffered", deviceId: "eline-vest-000000000000", at: new Date().toISOString(), output: { status: "insufficient_data", probability: null, decision: null, sampleCount: 200, coverage: 0.6, windowStartT: 0, windowEndT: 3000 }, durationMs: 12 })!;
  const html = renderToStaticMarkup(createElement(EventDetail, { event, onClose: () => {} }));
  for (const value of ["AI response", "insufficient_data", "Not available", "coverage", "sample Count", "window Start T", "3000", "12 ms"]) assert.ok(html.includes(value), value);
  assert.ok(!html.includes("<h3>Delivery</h3>"));
});
