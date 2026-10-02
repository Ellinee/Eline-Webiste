import assert from "node:assert/strict";
import test from "node:test";
import { appendEvents, eventDescription, filterEvents, sensorReadings } from "../src/lib/events.ts";
import { normalizeEvent, normalizeEvents, stages } from "../../debug/contract.ts";

const event = normalizeEvent({ id: "e1", cursor: "1", source: "radar", stage: "validated", at: "2026-09-30T10:00:00Z", deviceId: "eline-radar-000000000000" })!;

test("validated event memory is bounded and duplicate cursors replace entries", () => {
  const events = Array.from({ length: 2100 }, (_, i) => ({ ...event, id: `e${i}`, cursor: String(i) }));
  const values = appendEvents([], events);
  assert.equal(values.length, 2000);
  assert.equal(values[0].cursor, "100");
  assert.equal(appendEvents(values, [{ ...values[0], summary: "new" }]).length, 2000);
  assert.equal(appendEvents(values, [{ ...values[0], summary: "new" }])[0].summary, "new");
});

test("nonvalidated traffic never fills or evicts the validated sensor history", () => {
  const noise = Array.from({ length: 2100 }, (_, i) => ({ ...event, cursor: `noise:${i}`, stage: stages.filter((stage) => stage !== "validated")[i % 8] }));
  assert.deepEqual(appendEvents([event], noise), [event]);
  assert.deepEqual(appendEvents(noise, [event]), [event]);
  const page = normalizeEvents({ cursor: "checkpoint:2200", events: [event, ...noise.slice(0, 99)] })!;
  assert.equal(page.cursor, "checkpoint:2200");
  assert.deepEqual(appendEvents([], page.events), [event]);
});

test("sensor filters use modality while service filters keep forwarded Vest telemetry selectable", () => {
  const passthrough = { ...event, cursor: "2", deviceId: "eline-vest-000000000000" };
  const vest = { ...passthrough, cursor: "3", source: "vest" as const };
  const unauthorized = { ...event, cursor: "4", deviceId: "eline-radar-000000000001" };
  const events = [event, passthrough, vest, unauthorized, { ...event, cursor: "5", stage: "inference" as const }];
  const devices = [event.deviceId, vest.deviceId];
  assert.deepEqual(filterEvents(events, devices), [vest, passthrough, event]);
  assert.deepEqual(filterEvents(events, devices, "radar"), [event]);
  assert.deepEqual(filterEvents(events, devices, "vest"), [vest, passthrough]);
  assert.deepEqual(filterEvents(events, devices, "vest", vest.deviceId, "radar"), [passthrough]);
  assert.deepEqual(filterEvents(events, devices, "", "", "vest"), [vest]);
  assert.deepEqual(filterEvents(events, []), []);
  assert.deepEqual(filterEvents(events, devices, "", unauthorized.deviceId), []);
  assert.equal(events[0], event);
});

test("latest input follows received time across services, with arrival order breaking ties", () => {
  const newer = { ...event, cursor: "2", at: "2026-09-30T10:01:00Z" };
  const tied = { ...newer, cursor: "3" };
  const delayed = { ...event, cursor: "4", at: "2026-09-30T09:59:00Z" };
  assert.deepEqual(filterEvents([event, newer, tied, delayed], [event.deviceId]), [tied, newer, event, delayed]);
});

test("sensor log lines show the first captured frame, units, validity and unrounded values without inventing Z", () => {
  const capture = normalizeEvent({ ...event, input: { totalCount: 30, frames: [{ t: 1, targets: [{ slot: 0, valid: true, x: 0, y: -2, speed: 1.5123456789 }, { slot: 1, valid: false, x: 4, speed: -0.25 }] }, { t: 2, targets: [{ x: 999, y: 999, speed: 999 }] }] } })!;
  assert.deepEqual(sensorReadings(capture), ["Slot 0 · Valid · X: 0 mm · Y: -2 mm · Speed: 1.5123456789 cm/s", "Slot 1 · Invalid · X: 4 mm · Y: Not reported · Speed: -0.25 cm/s"]);
  assert.deepEqual(sensorReadings({ ...event, coordinates: { x: 0, y: 2, speed: 0 } }), ["Validity not reported · X: 0 mm · Y: 2 mm · Speed: 0 cm/s"]);
  assert.deepEqual(sensorReadings(event), []);
});

test("sensor log lines distinguish acceleration and gyroscope axes from radar position and speed", () => {
  const input = { ax: 0, ay: -1, az: 9.81, gx: 0.1, gy: 0.2, gz: -0.3 };
  const expected = ["Acceleration (m/s²) · ax: 0 · ay: -1 · az: 9.81", "Gyroscope (rad/s) · gx: 0.1 · gy: 0.2 · gz: -0.3"];
  assert.deepEqual(sensorReadings({ ...event, source: "vest", input }), expected);
  assert.deepEqual(sensorReadings({ ...event, deviceId: "eline-vest-000000000000", telemetry: input }), expected);
  assert.deepEqual(sensorReadings({ ...event, source: "vest", samples: [{ t: 1, ...input }, { t: 2, ax: 999 }], input: { ax: 999 } }), expected);
  assert.deepEqual(sensorReadings({ ...event, source: "vest", output: { probability: 0.6 } }), []);
});

test("descriptions distinguish inference, forwarded telemetry, buffering and Kafka acknowledgement", () => {
  assert.match(eventDescription({ ...event, stage: "buffered" }), /not an AI decision/i);
  assert.match(eventDescription({ ...event, stage: "kafka_delivered" }), /not mobile delivery/i);
  assert.match(eventDescription({ ...event, source: "vest", stage: "inference", output: { decision: "possible_fall" } }), /AI decision: possible fall/);
  assert.match(eventDescription({ ...event, deviceId: "eline-vest-000000000000", stage: "validated" }), /telemetry forwarded by Radar/i);
});
