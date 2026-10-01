import { useEffect, useState } from "react";
import { normalizeStatus } from "@/lib";
import type { DiagnosticSource, DiagnosticStatus, ReadinessState } from "@/types";

const labels = { ready: "Ready", model: "Model", messagingEnabled: "Messaging enabled", mqtt: "MQTT", kafka: "Kafka", leader: "Leader", worker: "Worker" } as const;
const rangeLabels = { x: "X", y: "Y", speed: "Speed", accelerationMetersPerSecondSquared: "Acceleration (m/s²)", gyroscopeRadiansPerSecond: "Gyroscope (rad/s)" };
const timestamp = (value: string | null) => value ? <time dateTime={value}>{new Date(value).toISOString()}</time> : "Never observed";
const readiness = (value: ReadinessState, failed: boolean) => failed ? "Stale" : typeof value === "boolean" ? value ? "True" : "False" : value === "stale" ? "Stale" : "Unknown";

function Source({ name, source, failed }: { name: string; source: DiagnosticSource; failed: boolean }) {
  const observation = source.status;
  const snapshot = observation.snapshot;
  const freshness = failed ? "stale" : observation.freshness;
  return <section className="source-status" aria-label={`${name} source status`}>
    <h2>{name}</h2>
    <dl className="fields">
      <div><dt>Event feed</dt><dd>{failed ? "Stale" : source.state.replaceAll("_", " ")}</dd></div>
      <div><dt>Last event-feed success</dt><dd>{timestamp(source.lastSuccessAt)}</dd></div>
      <div><dt>Status request</dt><dd>{failed ? "Unavailable" : observation.state.replaceAll("_", " ")}</dd></div>
      <div><dt>Observation</dt><dd>{freshness}</dd></div>
      <div><dt>Last status success</dt><dd>{timestamp(observation.lastSuccessAt)}</dd></div>
      <div><dt>Last status attempt</dt><dd>{timestamp(observation.lastAttemptAt)}</dd></div>
    </dl>
    <dl className="readiness-grid">{Object.entries(labels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{readiness(observation.readiness[key as keyof typeof labels], failed)}</dd></div>)}</dl>
    {snapshot ? <details><summary>Model and capture settings{freshness === "stale" ? " (last known; stale)" : ""}</summary>
      <dl className="fields">
        <div><dt>Model</dt><dd>{snapshot.model.name}</dd></div>
        <div><dt>Model version</dt><dd>{snapshot.model.modelVersion}</dd></div>
        <div><dt>Feature version</dt><dd>{snapshot.model.featureVersion}</dd></div>
        <div><dt>Decision threshold</dt><dd>{snapshot.model.threshold}</dd></div>
        <div><dt>Probability range</dt><dd>{snapshot.model.probabilityRange.join(" to ")}</dd></div>
        <div><dt>Field validated</dt><dd>{String(snapshot.model.fieldValidated)}</dd></div>
        {Object.entries(snapshot.model.sensorRanges).map(([key, range]) => <div key={key}><dt>{rangeLabels[key as keyof typeof rangeLabels]}</dt><dd>{range?.join(" to ")}</dd></div>)}
        <div><dt>Capture devices</dt><dd>{snapshot.allowedDeviceIds.length ? snapshot.allowedDeviceIds.join(", ") : "No matching authorized devices"}</dd></div>
        <div><dt>HTTP inference capture</dt><dd>Disabled</dd></div>
        <div><dt>Source memory retention</dt><dd>{snapshot.buffer.ttlSeconds} s · {snapshot.buffer.events}/{snapshot.buffer.maxEvents} events · {snapshot.buffer.bytes}/{snapshot.buffer.maxBytes} bytes</dd></div>
        <div><dt>Per-device cap</dt><dd>{snapshot.buffer.perDeviceCap} events</dd></div>
        <div><dt>Preview cap</dt><dd>{snapshot.buffer.maxPreviewBytes} bytes</dd></div>
        <div><dt>Evicted / expired</dt><dd>{snapshot.buffer.evicted} / {snapshot.buffer.expired}</dd></div>
      </dl>
      <p className="muted">Only allowlisted MQTT devices are captured. Previews are bounded to 16 Radar frames or 10 Vest samples. Source settings describe this observation, not earlier inference versions.</p>
    </details> : <p className="muted">No validated model or capture settings observed.</p>}
  </section>;
}

export function SourceStatus({ value, failed = false }: { value: DiagnosticStatus; failed?: boolean }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const status = normalizeStatus(value, now);
  if (!status) return <p role="alert">Invalid source status. Readiness is unknown.</p>;
  return <section aria-label="Source readiness">
    <div className="source-status-grid"><Source name="Radar" source={status.sources.radar} failed={failed} /><Source name="Vest" source={status.sources.vest} failed={failed} /></div>
    <p className="view-note">BE memory: {status.retention.events}/{status.retention.maxEvents} events · {status.retention.bytes}/{status.retention.maxBytes} bytes · {status.retention.ttlSeconds} s retention · {status.retention.maxEventBytes} bytes/event. Dropped: {status.sources.radar.dropped + status.sources.vest.dropped}. Source resets: {status.sources.radar.resetCount + status.sources.vest.resetCount}.</p>
    <p className="muted">Status is shared by BE and polled every {status.statusPolicy.pollIntervalMs / 1000} s; timeout {status.statusPolicy.timeoutMs / 1000} s; stale after {status.statusPolicy.staleAfterMs / 1000} s or any failed status request. A connected event feed does not imply source readiness.</p>
  </section>;
}
