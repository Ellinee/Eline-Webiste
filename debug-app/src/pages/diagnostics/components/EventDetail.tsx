import { useEffect, useRef, useState } from "react";
import { stageLabels } from "@/constants";
import { eventDescription, previewSummary, sensorLabel, sensorReadings, sensorSource, vestReading } from "@/lib";
import type { DiagnosticEvent, Summary } from "@/types";

const value = (item: Summary[string] | undefined) => typeof item === "number" && Number.isFinite(item) ? String(item) : "Not reported";

function Fields({ value }: { value?: Summary }) {
  if (!value || !Object.keys(value).length) return <p className="muted">Not reported for this event.</p>;
  return <dl className="fields">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd>{item === null ? "Not available" : Array.isArray(item) ? item.join(", ") : String(item)}</dd></div>)}</dl>;
}

export function SensorValues({ event }: { event: DiagnosticEvent }) {
  const readings = sensorReadings(event);
  const preview = previewSummary(event);
  const isVest = sensorSource(event) === "vest";
  const first = isVest ? event.samples?.[0] : event.frames?.[0];
  return <div className="sensor-values">
    {readings.length ? readings.map((reading, index) => <code key={index}>{reading}</code>) : <span className="muted">{event.frames?.length ? "No targets in first captured frame." : "Sensor values were not included in this event."}</span>}
    {first && <small>First captured {isVest ? "sample" : "frame"} · t: {value(first.t)}{typeof first.t === "number" ? " ms" : ""}</small>}
    {preview && <small>{preview}{event.truncated ? " · Truncated" : ""}</small>}
  </div>;
}

function SensorPreview({ event }: { event: DiagnosticEvent }) {
  const isVest = sensorSource(event) === "vest";
  const direct = vestReading(event);
  const frames = event.frames ?? (event.coordinates ? [{ t: event.input?.t, targets: [event.coordinates] }] : []);
  const samples = event.samples ?? (direct ? [direct] : []);
  const preview = previewSummary(event);
  return <>
    <p className="muted">{isVest ? "Acceleration: ax, ay, az in m/s². Gyroscope: gx, gy, gz in rad/s." : "Radar sends X/Y and speed; no Z. Invalid targets are retained, not treated as no person."} t is device monotonic milliseconds, not received time.</p>
    {preview && <p>{preview}</p>}
    {event.truncated && <p className="notice warning">Truncated capture. {isVest ? "The final captured sample is not the latest sample of the full window." : "The final captured frame is not the latest frame of the full window."}</p>}
    {!isVest && frames.length > 0 ? <div className="sensor-scroll" role="region" aria-label="Radar frames" tabIndex={0}><table className="sensor-table">
      <caption>Radar frames</caption>
      <thead><tr>{["t (ms)", "Target slot", "Valid", "X (mm)", "Y (mm)", "Speed (cm/s)"].map((key) => <th scope="col" key={key}>{key}</th>)}</tr></thead>
      <tbody>{frames.flatMap((frame, frameIndex) => frame.targets.length ? frame.targets.map((target, targetIndex) => <tr key={`${frameIndex}:${targetIndex}`}><td>{value(frame.t)}</td><td>{value(target.slot)}</td><td>{target.valid === true ? "Valid" : target.valid === false ? "Invalid" : "Not reported"}</td><td>{value(target.x)}</td><td>{value(target.y)}</td><td>{value(target.speed)}</td></tr>) : [<tr key={frameIndex}><td>{value(frame.t)}</td><td colSpan={5}>No targets reported</td></tr>])}</tbody>
    </table></div> : isVest && samples.length > 0 ? <div className="sensor-scroll" role="region" aria-label="Vest samples" tabIndex={0}><table className="sensor-table">
      <caption>Vest samples</caption>
      <thead><tr>{["t (ms)", "ax (m/s²)", "ay (m/s²)", "az (m/s²)", "gx (rad/s)", "gy (rad/s)", "gz (rad/s)"].map((key) => <th scope="col" key={key}>{key}</th>)}</tr></thead>
      <tbody>{samples.map((sample, index) => <tr key={index}>{["t", "ax", "ay", "az", "gx", "gy", "gz"].map((key) => <td key={key}>{value(sample[key])}</td>)}</tr>)}</tbody>
    </table></div> : <p className="muted">Sensor values were not included in this event.</p>}
  </>;
}

export function EventDetail({ event, onClose }: { event: DiagnosticEvent; onClose?: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copyState, setCopyState] = useState("");
  const isSelected = Boolean(onClose);
  useEffect(() => {
    if (!isSelected) return;
    const previous = document.activeElement;
    heading.current?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [isSelected]);
  const sensorJson = JSON.stringify({
    receivedAt: event.at, service: event.source, deviceId: event.deviceId,
    totalCount: event.input?.totalCount, truncated: event.truncated,
    ...(event.frames ? { frames: event.frames } : event.samples ? { samples: event.samples } : {
      t: event.input?.t,
      values: sensorSource(event) === "vest" ? vestReading(event) : event.coordinates,
    }),
  }, null, 2);
  const eventJson = JSON.stringify(event, null, 2);
  const handleCopy = async (json: string) => {
    try { await navigator.clipboard.writeText(json); setCopyState("Copied sanitized JSON."); }
    catch { setCopyState("Copy unavailable. Select the JSON to copy manually."); }
  };
  return <section id="received-input" className="detail sensor-detail" aria-labelledby="detail-title" onKeyDown={(event) => { if (event.key === "Escape") onClose?.(); }}>
    <div className="detail-heading"><h2 ref={heading} tabIndex={-1} id="detail-title">{isSelected ? "Selected received input" : "Latest received input"}</h2>{onClose && <button onClick={onClose}>Back to latest</button>}</div>
    <dl className="fields"><div><dt>Sensor</dt><dd>{sensorLabel(event)}</dd></div><div><dt>Service</dt><dd>{event.source === "radar" ? "Radar" : "Vest"}</dd></div><div><dt>Device</dt><dd>{event.deviceId}</dd></div><div><dt>Received time (UTC)</dt><dd><time dateTime={event.at}>{new Date(event.at).toISOString()}</time></dd></div></dl>
    <section><h3>Sensor readings</h3><SensorPreview event={event} /></section>
    <details><summary>Sensor JSON</summary><p className="muted">Sanitized captured values only; previews may omit later readings. Numbers are not rounded.</p><button onClick={() => void handleCopy(sensorJson)}>Copy sensor JSON</button><pre tabIndex={0} aria-label="Sanitized sensor JSON">{sensorJson}</pre></details>
    <details><summary>Technical details</summary>
      <p>{stageLabels[event.stage]} · {eventDescription(event)}</p>
      {event.reason && <p><strong>Reason:</strong> {event.reason.replaceAll("_", " ")}</p>}
      <dl className="fields"><div><dt>Event ID</dt><dd>{event.id}</dd></div><div><dt>Latency</dt><dd>{event.latencyMs === undefined ? "Not reported" : `${event.latencyMs.toLocaleString()} ms`}</dd></div></dl>
      <section><h3>Input metadata</h3><Fields value={event.input} /></section>
      <section><h3>AI response</h3><Fields value={event.output} /></section>
      {event.telemetry && <section><h3>Telemetry response</h3><Fields value={event.telemetry} /></section>}
      <button onClick={() => void handleCopy(eventJson)}>Copy sanitized JSON</button><pre tabIndex={0} aria-label="Sanitized event JSON">{eventJson}</pre>
    </details>
    <p role="status">{copyState}</p>
  </section>;
}
