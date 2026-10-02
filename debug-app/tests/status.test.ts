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
const capture = { id: "1", cursor: "1", source: "radar", stage: "validated", deviceId: "eline-radar-000000000000", at: "2026-09-30T10:00:00.123Z" };
const mainContent = (html: string) => html.replace(/<details\b[^>]*>[\s\S]*<\/details>/g, "");
const inspect = (value: unknown) => renderToStaticMarkup(createElement(EventDetail, { event: normalizeEvent(value)!, onClose: () => {} }));

test("source readiness remains visible while technical settings are collapsed", () => {
  const status = currentStatus();
  const html = renderToStaticMarkup(createElement(SourceStatus, { value: status }));
  for (const label of ["Source readiness", "Radar", "Vest", "Ready", "Event feed"]) assert.ok(mainContent(html).includes(label), label);
  for (const label of ["Model version", "Decision threshold", "Capture devices", "HTTP inference capture", "Source memory retention", "MQTT", "Kafka", "Leader", "Worker", "Acceleration (m/s²)", "Gyroscope (rad/s)", "0.24", "20260919085908"]) assert.ok(html.includes(label), label);
  assert.doesNotMatch(mainContent(html), /Kafka|Decision threshold|Model version|BE memory/);
  assert.match(html, /<details><summary>Source details/);
  assert.doesNotMatch(html, /<details[^>]*\bopen/);
  assert.ok(html.includes(status.sources.radar.status.snapshot!.model.modelVersion));
  assert.ok(html.includes(status.sources.radar.status.lastSuccessAt!));
});

test("failed frontend status refresh marks cached true readiness stale", () => {
  const html = renderToStaticMarkup(createElement(SourceStatus, { value: currentStatus(), failed: true }));
  assert.match(mainContent(html), /Stale/);
  assert.ok(html.includes("last known; stale"));
  assert.ok(html.includes("<dt>Model</dt><dd>Stale</dd>"));
  assert.ok(!html.includes("<dt>Ready</dt><dd>True</dd>"));
});

test("radar inspection shows each timed frame and target, units and first-of-total truncation", () => {
  const frames = Array.from({ length: 30 }, (_, index) => ({ t: index * 100, targets: [{ slot: 0, valid: true, x: 1.5123456789, y: -2, speed: 0 }, { slot: 1, valid: false, x: null, y: null, speed: null }] }));
  const html = inspect({ ...capture, input: { totalCount: 30, frames } });
  for (const value of ["Sensor readings", "Radar frames", "t (ms)", "Target slot", "X (mm)", "Y (mm)", "Speed (cm/s)", "1.5123456789", "-2", "Not reported", "Invalid", "Captured first 16 of 30 frames", "Truncated", "not the latest frame of the full window", "Received time (UTC)", capture.at, "device monotonic milliseconds"]) assert.ok(mainContent(html).includes(value), value);
  assert.doesNotMatch(mainContent(html), /Z \(|resolution|AI response|Input metadata|Latency/);
  assert.match(html, /<details><summary>Sensor JSON/);
  assert.match(html, /Copy sensor JSON/);
  assert.doesNotMatch(html, /<details[^>]*\bopen/);
});

test("timeline readings use the first captured frame and do not imply a latest window frame", () => {
  const event = normalizeEvent({ ...capture, input: { totalCount: 30, frames: [{ t: 10, targets: [{ slot: 0, valid: true, x: 0, y: -2, speed: 1.5 }] }, { t: 20, targets: [{ x: 99 }] }] } })!;
  const html = renderToStaticMarkup(createElement(SensorValues, { event }));
  assert.ok(html.includes("X: 0 mm · Y: -2 mm · Speed: 1.5 cm/s"));
  assert.ok(html.includes("First captured frame · t: 10 ms"));
  assert.ok(html.includes("Captured first 2 of 30 frames"));
  assert.doesNotMatch(html, /Last frame|Latest frame|AI decision|99/);
});

test("empty radar frames and invalid targets are distinct and earlier readings remain visible", () => {
  const html = inspect({ ...capture, input: { frames: [{ t: 1, targets: [{ valid: true, x: 1.5, y: -2, speed: 0 }] }, { t: 2, targets: [] }, { t: 3, targets: [{ slot: 0, valid: false, x: 0, y: 0, speed: 0 }] }] } });
  for (const value of ["No targets reported", "Invalid", "1.5", "total count not reported"]) assert.ok(mainContent(html).includes(value), value);
  assert.doesNotMatch(html, /No person|Sensor values were not included/);
});

test("vest inspection displays timed acceleration and gyroscope samples with correct units", () => {
  const samples = Array.from({ length: 12 }, (_, t) => ({ t, ax: 0, ay: -1, az: 9.81234567, gx: 0.1, gy: 0.2, gz: -0.3 }));
  const html = inspect({ ...capture, source: "vest", deviceId: "eline-vest-000000000000", input: { totalCount: 12, samples } });
  for (const value of ["Vest samples", "t (ms)", "ax (m/s²)", "ay (m/s²)", "az (m/s²)", "gx (rad/s)", "gy (rad/s)", "gz (rad/s)", "Acceleration", "Gyroscope", "9.81234567", "-0.3", "Captured first 10 of 12 samples", "Truncated"]) assert.ok(mainContent(html).includes(value), value);
  assert.doesNotMatch(mainContent(html), /Position|Speed|Z \(mm\)/);
});

test("direct raw Vest readings through Radar are labeled passthrough without fabricated time or samples", () => {
  const html = inspect({ ...capture, deviceId: "eline-vest-000000000000", input: { values: { ax: 0, ay: -1, az: 9.81, gx: 0.1, gy: 0.2, gz: -0.3 } } });
  for (const value of ["Vest passthrough via Radar", "Vest samples", "Not reported", "9.81", "Gyroscope"]) assert.ok(mainContent(html).includes(value), value);
  assert.doesNotMatch(mainContent(html), /Radar frames|Captured first|No person|AI decision/);
});

test("Vest passthrough with a reported device timestamp keeps it separate from received time", () => {
  const html = inspect({ ...capture, deviceId: "eline-vest-000000000000", input: { t: 0, values: { ax: 0, ay: -1, az: 9.81, gx: 0.1, gy: 0.2, gz: -0.3 } } });
  assert.match(mainContent(html), /<tbody><tr><td>0<\/td><td>0<\/td>/);
  assert.ok(mainContent(html).includes(capture.at));
});

test("direct captures retain device time and unknown validity without generating unsupported axes", () => {
  const html = inspect({ ...capture, input: { t: 12345, x: 0, y: -2.5, speed: -0.125 } });
  for (const value of ["12345", "Not reported", "-0.125", "X (mm)"]) assert.ok(mainContent(html).includes(value), value);
  assert.doesNotMatch(mainContent(html), /Z \(mm\)|Captured first/);
});

test("missing captures stay empty rather than treating predictions as readings", () => {
  const html = inspect({ ...capture, output: { status: "ok", probability: 0.6, decision: "possible_fall" } });
  assert.ok(html.includes("Sensor values were not included in this event."));
  assert.doesNotMatch(mainContent(html), /possible_fall|AI response|<tbody>/);
  assert.match(html, /<details><summary>Technical details/);
  assert.ok(html.includes("AI response"));
});

test("optional technical details preserve authenticated responses without presenting them as sensor data", () => {
  const html = inspect({ ...capture, source: "vest", deviceId: "eline-vest-000000000000", output: { status: "insufficient_data", probability: null, decision: null, sampleCount: 200, coverage: 0.6, windowStartT: 0, windowEndT: 3000 }, durationMs: 12 });
  for (const value of ["AI response", "insufficient_data", "Not available", "coverage", "sample Count", "window Start T", "3000", "12 ms", "Copy sanitized JSON"]) assert.ok(html.includes(value), value);
  assert.doesNotMatch(mainContent(html), /AI response|insufficient_data|coverage|12 ms/);
  assert.doesNotMatch(html, /<details[^>]*\bopen/);
});
