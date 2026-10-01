import assert from "node:assert/strict";
import test from "node:test";
import { appendEvents, eventDescription } from "../src/lib/events.ts";
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

test("descriptions distinguish inference, forwarded telemetry, buffering and Kafka acknowledgement", () => {
  assert.match(eventDescription(event), /not an AI decision/i);
  assert.match(eventDescription({ ...event, stage: "kafka_delivered" }), /not mobile delivery/i);
  assert.match(eventDescription({ ...event, source: "vest", stage: "inference", output: { decision: "possible_fall" } }), /AI decision: possible fall/);
  assert.match(eventDescription({ ...event, deviceId: "eline-vest-000000000000", stage: "validated" }), /telemetry forwarded by Radar/i);
});
