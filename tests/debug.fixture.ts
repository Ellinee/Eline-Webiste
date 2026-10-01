const instanceId = "12345678-1234-4234-8234-123456789abc";
export const observedAt = "2026-10-01T00:00:00.000Z";
const snapshot = {
  schemaVersion: 1, service: "radar", instanceId, allowedDeviceIds: ["eline-radar-000000000000"], httpInferenceCapture: false,
  readiness: { model: true, messagingEnabled: true, mqtt: true, kafka: true, leader: true, worker: true, ready: true },
  model: { name: "random_forest", modelVersion: "a".repeat(64), featureVersion: "v2_rate_invariant", threshold: 0.24, probabilityRange: [0, 1], fieldValidated: false, sensorRanges: { x: [-32767, 32767], y: [-32767, 32767], speed: [-32767, 32767] } },
  buffer: { events: 0, bytes: 0, evicted: 0, expired: 0, maxEvents: 1000, maxBytes: 4194304, ttlSeconds: 300, maxPreviewBytes: 65536, perDeviceCap: 200 },
};
const source = () => ({ state: "connected", instanceId, cursor: 0, reset: false, resetCount: 0, lastResetAt: null, lastSuccessAt: observedAt, lastAttemptAt: observedAt, dropped: 0, status: { state: "connected", lastAttemptAt: observedAt, lastSuccessAt: observedAt, freshness: "fresh", readiness: snapshot.readiness, snapshot } });
export const statusFixture = () => structuredClone({ schemaVersion: 1, instanceId, cursor: `${instanceId}:0`, collecting: true, sources: { radar: source(), vest: { ...source(), status: { ...source().status, snapshot: { ...snapshot, service: "vest", allowedDeviceIds: ["eline-vest-000000000000"], model: { ...snapshot.model, modelVersion: "20260919085908", featureVersion: `sha256:${"b".repeat(64)}`, sensorRanges: { accelerationMetersPerSecondSquared: [-165, 165], gyroscopeRadiansPerSecond: [-37, 37] } } } } } }, statusPolicy: { pollIntervalMs: 10000, timeoutMs: 3000, staleAfterMs: 20000 }, retention: { ttlSeconds: 300, maxEvents: 2000, maxBytes: 4194304, maxEventBytes: 16384, events: 0, bytes: 0, lostThrough: 0 } });
