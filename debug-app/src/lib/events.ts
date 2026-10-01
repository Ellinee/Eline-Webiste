import { maxEvents } from "@/constants";
import type { DiagnosticEvent } from "@/types";

export function appendEvents(current: DiagnosticEvent[], incoming: DiagnosticEvent[]): DiagnosticEvent[] {
  const map = new Map(current.map((event) => [event.cursor, event]));
  for (const event of incoming) map.set(event.cursor, event);
  return [...map.values()].slice(-maxEvents);
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
