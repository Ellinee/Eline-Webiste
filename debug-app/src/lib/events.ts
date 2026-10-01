import { maxEvents } from "@/constants";
import type { DiagnosticEvent, Summary } from "@/types";

export function appendEvents(current: DiagnosticEvent[], incoming: DiagnosticEvent[]): DiagnosticEvent[] {
  const map = new Map(current.map((event) => [event.cursor, event]));
  for (const event of incoming) map.set(event.cursor, event);
  return [...map.values()].slice(-maxEvents);
}
export function sensorReadings(event: DiagnosticEvent): string[] {
  const value = (item: Summary[string] | undefined) => typeof item === "number" && Number.isFinite(item) ? String(item) : "Not reported";
  const fields = (reading: Summary, keys: string[]) => keys.map((key) => `${key}: ${value(reading[key])}`).join(" · ");
  if (event.source === "vest" || event.deviceId.startsWith("eline-vest-")) {
    const groups = [["ax", "ay", "az"], ["gx", "gy", "gz"]];
    const reading = [event.samples?.at(-1), event.input, event.telemetry].find((reading) => reading && groups.flat().some((key) => Object.hasOwn(reading, key)));
    return reading ? groups.filter((keys) => keys.some((key) => Object.hasOwn(reading, key))).map((keys) => fields(reading, keys)) : [];
  }
  const targets = event.frames?.at(-1)?.targets ?? (event.coordinates ? [event.coordinates] : []);
  return targets.map((target) => `${typeof target.slot === "number" ? `Slot ${target.slot} · ` : ""}${fields(target, ["x", "y", "speed"])}${target.valid === false ? " · Invalid" : ""}`);
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
