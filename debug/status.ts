export type Source = "radar" | "vest";
export type SourceState = "idle" | "connecting" | "connected" | "disconnected" | "invalid_response" | "unauthorized" | "not_configured" | "invalid_configuration";
export type ReadinessState = boolean | "unknown" | "stale";
export const readinessKeys = ["model", "messagingEnabled", "leader", "mqtt", "kafka", "worker", "ready"] as const;
export type Readiness = Record<(typeof readinessKeys)[number], ReadinessState>;
export interface SourceSnapshot {
  schemaVersion: 1;
  service: Source;
  instanceId: string;
  allowedDeviceIds: string[];
  httpInferenceCapture: false;
  readiness: Record<(typeof readinessKeys)[number], boolean>;
  buffer: { events: number; bytes: number; evicted: number; expired: number; maxEvents: 1000; maxBytes: 4194304; ttlSeconds: 300; maxPreviewBytes: 65536; perDeviceCap: 200 };
  model: {
    name: "random_forest";
    modelVersion: string;
    featureVersion: string;
    threshold: number;
    probabilityRange: [0, 1];
    fieldValidated: boolean;
    sensorRanges: Partial<Record<"x" | "y" | "speed" | "accelerationMetersPerSecondSquared" | "gyroscopeRadiansPerSecond", [number, number]>>;
  };
}
export interface DiagnosticSource {
  state: SourceState;
  instanceId: string | null;
  cursor: number;
  reset: boolean;
  resetCount: number;
  lastResetAt: string | null;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  dropped: number;
  status: {
    state: SourceState;
    lastAttemptAt: string | null;
    lastSuccessAt: string | null;
    freshness: "fresh" | "unknown" | "stale";
    readiness: Readiness;
    snapshot: SourceSnapshot | null;
  };
}
export interface DiagnosticStatus {
  schemaVersion: 1;
  instanceId: string;
  cursor: string;
  collecting: boolean;
  status: "ok" | "degraded";
  sources: Record<Source, DiagnosticSource>;
  statusPolicy: { pollIntervalMs: 10000; timeoutMs: 3000; staleAfterMs: 20000 };
  retention: { ttlSeconds: 300; maxEvents: 2000; maxBytes: 4194304; maxEventBytes: 16384; events: number; bytes: number; lostThrough: number };
}
const states: SourceState[] = ["idle", "connecting", "connected", "disconnected", "invalid_response", "unauthorized", "not_configured", "invalid_configuration"];
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const exact = (value: unknown, keys: readonly string[]): value is Record<string, unknown> => object(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
const integer = (value: unknown, max = Number.MAX_SAFE_INTEGER): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= max;
const finite = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
const timestamp = (value: unknown): value is string | null => value === null || typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(value) && value.length <= 32 && Number.isFinite(Date.parse(value));
const state = (value: unknown): value is SourceState => states.includes(value as SourceState);
const ready = (value: unknown, booleanOnly = false): boolean => exact(value, readinessKeys) && readinessKeys.every((key) => typeof value[key] === "boolean" || !booleanOnly && (value[key] === "unknown" || value[key] === "stale"));

function validSnapshot(value: unknown, service: Source): value is SourceSnapshot {
  if (!exact(value, ["schemaVersion", "service", "instanceId", "allowedDeviceIds", "httpInferenceCapture", "readiness", "buffer", "model"]) || value.schemaVersion !== 1 || value.service !== service || !uuid(value.instanceId) || value.httpInferenceCapture !== false) return false;
  const pattern = service === "radar" ? /^eline-(?:radar|vest)-[0-9a-f]{12}$/ : /^eline-vest-[0-9a-f]{12}$/;
  if (!Array.isArray(value.allowedDeviceIds) || value.allowedDeviceIds.length > 256 || new Set(value.allowedDeviceIds).size !== value.allowedDeviceIds.length || value.allowedDeviceIds.some((id) => typeof id !== "string" || !pattern.test(id))) return false;
  const r = value.readiness;
  if (!object(r) || !ready(r, true) || r.ready !== (r.model && (!r.messagingEnabled || (r.leader && r.mqtt && r.kafka && r.worker)))) return false;
  const b = value.buffer;
  if (!exact(b, ["events", "bytes", "evicted", "expired", "maxEvents", "maxBytes", "ttlSeconds", "maxPreviewBytes", "perDeviceCap"]) || !integer(b.events, 1000) || !integer(b.bytes, 4194304) || !integer(b.evicted) || !integer(b.expired) || b.maxEvents !== 1000 || b.maxBytes !== 4194304 || b.ttlSeconds !== 300 || b.maxPreviewBytes !== 65536 || b.perDeviceCap !== 200) return false;
  const m = value.model;
  if (!exact(m, ["name", "modelVersion", "featureVersion", "threshold", "probabilityRange", "fieldValidated", "sensorRanges"]) || m.name !== "random_forest" || typeof m.modelVersion !== "string" || typeof m.featureVersion !== "string" || !finite(m.threshold, 0, 1) || typeof m.fieldValidated !== "boolean" || !Array.isArray(m.probabilityRange) || m.probabilityRange.length !== 2 || m.probabilityRange[0] !== 0 || m.probabilityRange[1] !== 1) return false;
  if (service === "radar" ? !/^[0-9a-f]{64}$/.test(m.modelVersion) || m.featureVersion !== "v2_rate_invariant" : !/^[0-9]{14}$/.test(m.modelVersion) || !/^sha256:[0-9a-f]{64}$/.test(m.featureVersion)) return false;
  const keys = service === "radar" ? ["x", "y", "speed"] : ["accelerationMetersPerSecondSquared", "gyroscopeRadiansPerSecond"];
  return exact(m.sensorRanges, keys) && Object.values(m.sensorRanges).every((range) => Array.isArray(range) && range.length === 2 && finite(range[0], -1_000_000, 1_000_000) && finite(range[1], -1_000_000, 1_000_000) && range[0] < range[1]);
}

function validSource(value: unknown, service: Source): value is DiagnosticSource {
  if (!exact(value, ["state", "instanceId", "cursor", "reset", "resetCount", "lastResetAt", "lastSuccessAt", "lastAttemptAt", "dropped", "status"]) || !state(value.state) || value.instanceId !== null && !uuid(value.instanceId) || !integer(value.cursor) || typeof value.reset !== "boolean" || !integer(value.resetCount) || !integer(value.dropped) || !timestamp(value.lastResetAt) || !timestamp(value.lastSuccessAt) || !timestamp(value.lastAttemptAt)) return false;
  const s = value.status;
  if (!exact(s, ["state", "lastAttemptAt", "lastSuccessAt", "freshness", "readiness", "snapshot"]) || !state(s.state) || !timestamp(s.lastAttemptAt) || !timestamp(s.lastSuccessAt) || (typeof s.freshness !== "string" || !["fresh", "unknown", "stale"].includes(s.freshness)) || !ready(s.readiness) || s.snapshot !== null && !validSnapshot(s.snapshot, service)) return false;
  return (s.snapshot === null) === (s.lastSuccessAt === null) && (s.lastSuccessAt === null || s.lastAttemptAt !== null && Date.parse(s.lastSuccessAt as string) <= Date.parse(s.lastAttemptAt as string) + 3000);
}

export function normalizeStatus(value: unknown, now = Date.now()): DiagnosticStatus | null {
  const keys = ["schemaVersion", "instanceId", "cursor", "collecting", "sources", "statusPolicy", "retention"];
  if (object(value) && Object.hasOwn(value, "status")) keys.push("status");
  if (!exact(value, keys) || value.schemaVersion !== 1 || !uuid(value.instanceId) || typeof value.cursor !== "string" || !value.cursor.startsWith(`${value.instanceId}:`) || !/^(?:0|[1-9]\d{0,15})$/.test(value.cursor.slice(37)) || !integer(Number(value.cursor.split(":")[1])) || typeof value.collecting !== "boolean" || "status" in value && value.status !== "ok" && value.status !== "degraded") return null;
  if (!exact(value.sources, ["radar", "vest"]) || !validSource(value.sources.radar, "radar") || !validSource(value.sources.vest, "vest")) return null;
  const p = value.statusPolicy;
  if (!exact(p, ["pollIntervalMs", "timeoutMs", "staleAfterMs"]) || p.pollIntervalMs !== 10000 || p.timeoutMs !== 3000 || p.staleAfterMs !== 20000) return null;
  const r = value.retention;
  if (!exact(r, ["ttlSeconds", "maxEvents", "maxBytes", "maxEventBytes", "events", "bytes", "lostThrough"]) || r.ttlSeconds !== 300 || r.maxEvents !== 2000 || r.maxBytes !== 4194304 || r.maxEventBytes !== 16384 || !integer(r.events, 2000) || !integer(r.bytes, 4194304) || !integer(r.lostThrough)) return null;
  const result = structuredClone(value) as unknown as DiagnosticStatus;
  for (const source of Object.values(result.sources)) {
    const s = source.status;
    const success = s.lastSuccessAt === null ? null : Date.parse(s.lastSuccessAt);
    const fresh = s.freshness === "fresh" && s.state === "connected" && success !== null && now >= success && now - success < 20000 && (!source.instanceId || source.instanceId === s.snapshot?.instanceId);
    s.freshness = fresh ? "fresh" : s.lastAttemptAt === null || s.state === "connecting" && success === null ? "unknown" : "stale";
    s.readiness = Object.fromEntries(readinessKeys.map((key) => [key, fresh ? s.snapshot!.readiness[key] : s.freshness])) as Readiness;
  }
  result.status = Object.values(result.sources).every((source) => source.state === "connected" && source.status.readiness.ready === true) ? "ok" : "degraded";
  return result;
}
