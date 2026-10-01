export const stages = ["mqtt_received", "validated", "rejected", "buffered", "skipped", "inference", "outbox_queued", "kafka_delivered", "kafka_retry"] as const;
export type Stage = (typeof stages)[number];
export type Source = "radar" | "vest";
export type Summary = Record<string, string | number | boolean | null | number[]>;
export interface DiagnosticEvent {
  id: string;
  cursor: string;
  at: string;
  source: Source;
  sourceId?: string;
  stage: Stage;
  deviceId: string;
  reason?: string;
  latencyMs?: number;
  summary?: string;
  coordinates?: Summary;
  input?: Summary & { preview?: number[] };
  output?: Summary;
  telemetry?: Summary;
  delivery?: Summary;
  truncated: boolean;
}
export interface Session { authenticated: boolean; expiresAt: string | null; devices: string[] }
export interface EventPage { events: DiagnosticEvent[]; cursor: string | null; gap: boolean; truncated: boolean; hasMore: boolean }
export { normalizeStatus } from "./status.ts";
export type { DiagnosticStatus, DiagnosticSource, SourceSnapshot, ReadinessState } from "./status.ts";

export function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
const text = (value: unknown, max = 160): string | undefined => typeof value === "string" && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) ? value : undefined;
const number = (value: unknown, min = -Number.MAX_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): number | undefined => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
export const safeCursor = (value: unknown): string | undefined => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? String(value) : typeof value === "string" && /^[A-Za-z0-9_:.\-]{1,128}$/.test(value) ? value : undefined;
const timestamp = (value: unknown): string | undefined => typeof value === "string" && value.length <= 40 && /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) ? value : undefined;
const device = (value: unknown): string | undefined => typeof value === "string" && /^eline-(?:radar|vest)-[0-9a-f]{12}$/.test(value) ? value : undefined;
const reasons = ["retained", "qos", "payload_size", "schema_invalid", "stale", "duplicate", "rate_limited", "device_capacity", "collecting", "insufficient_data", "invalid_units", "broker_error", "delivery_timeout", "publish_error"];
const outputValidators: Record<string, (value: unknown) => boolean> = {
  status: (v) => typeof v === "string" && ["ok", "insufficient_data", "invalid_units"].includes(v),
  decision: (v) => v === null || v === "normal" || v === "possible_fall",
  modelVersion: (v) => typeof v === "string" && /^(?:[0-9a-f]{64}|[0-9]{14})$/.test(v),
  featureVersion: (v) => typeof v === "string" && /^(?:v2_rate_invariant|sha256:[0-9a-f]{64})$/.test(v),
  sensorStatus: (v) => v === "ok",
  published: (v) => v === false,
};
const axes = ["ax", "ay", "az", "gx", "gy", "gz"];

function summary(value: unknown, strings: string[], numbers: string[], booleans: string[] = []): Summary | undefined {
  const data = record(value);
  if (!data) return undefined;
  const result: Summary = {};
  for (const key of strings) { const v = text(data[key], key === "summary" ? 280 : 160); if (v !== undefined) result[key] = v; }
  for (const key of numbers) { const v = number(data[key]); if (v !== undefined) result[key] = v; else if (data[key] === null) result[key] = null; }
  for (const key of booleans) if (typeof data[key] === "boolean") result[key] = data[key];
  return result;
}

export function normalizeEvent(value: unknown): DiagnosticEvent | null {
  const data = record(value);
  if (!data) return null;
  const id = safeCursor(data.id);
  const cursor = safeCursor(data.cursor);
  const at = timestamp(data.at);
  const deviceId = device(data.deviceId ?? data.publicDeviceId);
  const source = data.source ?? data.service;
  if (!id || !cursor || !at || !deviceId || (source !== "radar" && source !== "vest") || !stages.includes(data.stage as Stage)) return null;
  const rawOutput = record(data.output);
  if (data.reason !== undefined && !reasons.includes(String(data.reason))) return null;
  if (rawOutput && Object.entries(outputValidators).some(([key, validate]) => rawOutput[key] !== undefined && !validate(rawOutput[key]))) return null;
  const input = summary(data.input, [], ["totalCount", "previewCount", "frameCount", "targetCount", "sampleInterval", "windowMs", "sequence", "uptimeSeconds", ...axes]);
  const rawInput = record(data.input);
  const preview = Array.isArray(rawInput?.preview) ? rawInput.preview : [];
  if (input && preview.length) input.preview = preview.slice(0, 12).filter((v): v is number => number(v) !== undefined);
  if (input && rawInput?.values) Object.assign(input, summary(rawInput.values, [], axes));
  const frames = Array.isArray(rawInput?.frames) ? rawInput.frames.slice(0, 16) : [];
  const lastFrame = record(frames.at(-1));
  const targets = Array.isArray(lastFrame?.targets) ? lastFrame.targets.slice(0, 3).map(record).filter((v) => v?.valid === true) : [];
  const coordinates = summary(data.coordinates, [], ["x", "y", "z", "speed", "slot"]) ?? (targets.length === 1 ? summary(targets[0], [], ["x", "y", "speed", "slot"]) : undefined);
  const samples = Array.isArray(rawInput?.samples) ? rawInput.samples.slice(0, 10) : [];
  if (input && samples.length) Object.assign(input, summary(samples.at(-1), [], axes));
  const output = summary(data.output, ["status", "decision", "modelVersion", "featureVersion"], ["probability", "threshold", "frameCount", "sampleCount", "coverage", "sampleInterval", "durationMs", "windowStartT", "windowEndT"], ["published"]);
  for (const key of ["probability", "threshold"]) if (output && output[key] !== null && number(output[key], 0, 1) === undefined) delete output[key];
  if (rawOutput?.decision === null && output) output.decision = null;
  const rawTelemetry = record(data.telemetry ?? data.output);
  if (rawTelemetry?.sensorStatus !== undefined && rawTelemetry.sensorStatus !== "ok") return null;
  const telemetry = summary(rawTelemetry, ["sensorStatus"], [...axes, "uptimeSeconds"]);
  return {
    id, cursor, at, source, stage: data.stage as Stage, deviceId,
    sourceId: typeof data.sourceId === "string" && /^(?:radar|vest):[0-9a-f-]{36}:[1-9]\d{0,15}$/.test(data.sourceId) ? data.sourceId : undefined, reason: text(data.reason),
    latencyMs: number(data.latencyMs ?? data.durationMs, 0, 86_400_000),
    coordinates, input, output: output && Object.keys(output).length ? output : undefined,
    telemetry: telemetry && Object.keys(telemetry).length ? telemetry : undefined,
    truncated: data.truncated === true || preview.length > 12 || rawInput?.truncated === true || frames.length > 0 || samples.length > 0,
  };
}

export function normalizeSession(value: unknown): Session | null {
  const data = record(value);
  if (data?.authenticated === false) return { authenticated: false, expiresAt: null, devices: [] };
  const devices = data?.devices ?? data?.deviceIds;
  if (data?.authenticated !== true || !timestamp(data.expiresAt) || !Array.isArray(devices) || devices.length > 256 || devices.some((v) => !device(v))) return null;
  return { authenticated: true, expiresAt: data.expiresAt as string, devices: [...new Set(devices as string[])] };
}

export function normalizeEvents(value: unknown): EventPage | null {
  const data = record(value);
  if (!data || !Array.isArray(data.events)) return null;
  const instance = typeof data.instanceId === "string" && /^[0-9a-f-]{36}$/.test(data.instanceId) ? data.instanceId : undefined;
  const events = data.events.slice(0, 100).map((value) => {
    const item = record(value);
    return normalizeEvent(item && instance ? { ...item, cursor: `${instance}:${item.id}` } : value);
  });
  if (events.some((event) => !event)) return null;
  return { events: events as DiagnosticEvent[], cursor: safeCursor(data.cursor) ?? events.at(-1)?.cursor ?? null, gap: data.gap === true || data.reset === true, truncated: data.truncated === true || data.events.length > 100, hasMore: data.hasMore === true };
}
