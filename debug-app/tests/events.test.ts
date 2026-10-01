import assert from "node:assert/strict";
import test from "node:test";
import { appendEvents, eventDescription, sensorReadings } from "../src/lib/events.ts";
import { normalizeEvent } from "../../debug/contract.ts";

const event = normalizeEvent({ id: "e1", cursor: "1", source: "radar", stage: "buffered", at: "2026-09-30T10:00:00Z", deviceId: "eline-radar-000000000000" })!;

test("event memory is bounded and duplicate cursors replace entries", () => {
  const events = Array.from({ length: 2100 }, (_, i) => ({ ...event, id: `e${i}`, cursor: String(i) }));
  const values = appendEvents([], events);
  assert.equal(values.length, 2000);
  assert.equal(values[0].cursor, "100");
  assert.equal(appendEvents(values, [{ ...values[0], summary: "new" }]).length, 2000);
  assert.equal(appendEvents(values, [{ ...values[0], summary: "new" }])[0].summary, "new");
});

test("sensor log lines show real radar values including zero, negative speed and multiple targets", () => {
  const capture = normalizeEvent({ ...event, stage: "mqtt_received", input: { frames: [{ t: 1, targets: [{ slot: 0, valid: true, x: 0, y: -2, speed: 1.5 }, { slot: 1, valid: false, x: 4, speed: -0.25 }] }] } })!;
  assert.deepEqual(sensorReadings(capture), ["Slot 0 · x: 0 · y: -2 · speed: 1.5", "Slot 1 · x: 4 · y: Not reported · speed: -0.25 · Invalid"]);
  assert.deepEqual(sensorReadings({ ...event, coordinates: { x: 0, y: 2, speed: 0 } }), ["x: 0 · y: 2 · speed: 0"]);
  assert.deepEqual(sensorReadings(event), []);
});

test("sensor log lines distinguish vest axes and forwarded vest telemetry from radar readings", () => {
  const input = { ax: 0, ay: -1, az: 9.81, gx: 0.1, gy: 0.2, gz: -0.3 };
  const expected = ["ax: 0 · ay: -1 · az: 9.81", "gx: 0.1 · gy: 0.2 · gz: -0.3"];
  assert.deepEqual(sensorReadings({ ...event, source: "vest", input }), expected);
  assert.deepEqual(sensorReadings({ ...event, deviceId: "eline-vest-000000000000", telemetry: input }), expected);
  assert.deepEqual(sensorReadings({ ...event, source: "vest", output: { probability: 0.6 } }), []);
});

test("descriptions distinguish inference, forwarded telemetry, buffering and Kafka acknowledgement", () => {
  assert.match(eventDescription(event), /not an AI decision/i);
  assert.match(eventDescription({ ...event, stage: "kafka_delivered" }), /not mobile delivery/i);
  assert.match(eventDescription({ ...event, source: "vest", stage: "inference", output: { decision: "possible_fall" } }), /AI decision: possible fall/);
  assert.match(eventDescription({ ...event, deviceId: "eline-vest-000000000000", stage: "validated" }), /telemetry forwarded by Radar/i);
});
