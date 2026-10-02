import { maxEvents } from "@/constants";
import type { DiagnosticEvent, Source, Summary } from "@/types";

export function appendEvents(current: DiagnosticEvent[], incoming: DiagnosticEvent[]): DiagnosticEvent[] {
  const map = new Map(current.filter((event) => event.stage === "validated").map((event) => [event.cursor, event]));
  for (const event of incoming) if (event.stage === "validated") map.set(event.cursor, event);
  return [...map.values()].slice(-maxEvents);
}

export function sensorSource(event: DiagnosticEvent): Source {
  return event.deviceId.startsWith("eline-vest-") || event.source === "vest" ? "vest" : "radar";
}

export function sensorLabel(event: DiagnosticEvent): string {
  return sensorSource(event) === "vest" ? event.source === "radar" ? "Vest passthrough via Radar" : "Vest" : "Radar";
}

export function filterEvents(events: DiagnosticEvent[], devices: string[], source = "", device = "", service = ""): DiagnosticEvent[] {
  return events.filter((event) => event.stage === "validated" && devices.includes(event.deviceId) && (!source || sensorSource(event) === source) && (!device || event.deviceId === device) && (!service || event.source === service)).reverse().sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export function vestReading(event: DiagnosticEvent): Summary | undefined {
  return [event.samples?.[0], event.input, event.telemetry].find((reading) => reading && ["ax", "ay", "az", "gx", "gy", "gz"].some((key) => Object.hasOwn(reading, key)));
}

export function previewSummary(event: DiagnosticEvent): string | null {
  const count = sensorSource(event) === "vest" ? event.samples?.length : event.frames?.length;
  if (!count) return null;
  const unit = sensorSource(event) === "vest" ? "samples" : "frames";
  const total = event.input?.totalCount;
  return typeof total === "number" && Number.isSafeInteger(total) && total >= count ? `Captured first ${count} of ${total} ${unit}` : `Captured ${count} ${unit} · total count not reported`;
}

export function sensorReadings(event: DiagnosticEvent): string[] {
  const value = (item: Summary[string] | undefined, unit = "") => typeof item === "number" && Number.isFinite(item) ? `${item}${unit}` : "Not reported";
  if (sensorSource(event) === "vest") {
    const reading = vestReading(event);
    if (!reading) return [];
    return [["ax", "ay", "az"], ["gx", "gy", "gz"]].filter((keys) => keys.some((key) => Object.hasOwn(reading, key))).map((keys) => `${keys[0] === "ax" ? "Acceleration (m/s²)" : "Gyroscope (rad/s)"} · ${keys.map((key) => `${key}: ${value(reading[key])}`).join(" · ")}`);
  }
  const targets = event.frames?.[0]?.targets ?? (event.coordinates ? [event.coordinates] : []);
  return targets.map((target) => `${typeof target.slot === "number" ? `Slot ${target.slot} · ` : ""}${target.valid === true ? "Valid" : target.valid === false ? "Invalid" : "Validity not reported"} · X: ${value(target.x, " mm")} · Y: ${value(target.y, " mm")} · Speed: ${value(target.speed, " cm/s")}`);
}

export function eventDescription(event: DiagnosticEvent): string {
  if (event.stage === "kafka_delivered") return "Kafka acknowledged the event; not mobile delivery confirmation.";
  if (event.stage === "buffered") return "Waiting for more samples; not an AI decision.";
  if (event.stage === "kafka_retry") return "Delivery failed; the backend will retry.";
  if (event.stage === "outbox_queued") return "Saved to the outbox; awaiting Kafka acknowledgement.";
  if (event.source === "radar" && event.deviceId.startsWith("eline-vest-")) return "Vest telemetry forwarded by Radar; not AI inference.";
  if (event.summary) return event.summary;
  if (event.stage === "inference") return typeof event.output?.decision === "string" ? `AI decision: ${event.output.decision.replaceAll("_", " ")}` : "AI response received; decision not available.";
  return { mqtt_received: "Message received from MQTT.", validated: "Input passed validation.", rejected: "Input rejected; see reported details.", skipped: "Processing skipped; see reported details." }[event.stage];
}
