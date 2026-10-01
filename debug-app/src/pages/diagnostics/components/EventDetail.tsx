import { useEffect, useRef, useState } from "react";
import { stageLabels } from "@/constants";
import { eventDescription, sensorReadings } from "@/lib";
import type { DiagnosticEvent, Summary } from "@/types";

function Fields({ value }: { value?: Summary }) {
  if (!value || !Object.keys(value).length) return <p className="muted">Not reported for this event.</p>;
  return <dl className="fields">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd>{item === null ? "Not available" : Array.isArray(item) ? item.join(", ") : String(item)}</dd></div>)}</dl>;
}
export function SensorValues({ event }: { event: DiagnosticEvent }) {
  const readings = sensorReadings(event);
  if (!readings.length) return event.frames?.length ? <div className="sensor-values"><span className="muted">No targets in last preview frame.</span><small>{event.frames.length} preview frames</small></div> : <span className="muted">Sensor values were not included in this event.</span>;
  return <div className="sensor-values">{readings.map((reading, index) => <code key={index}>{reading}</code>)}{event.frames?.length ? <small>Last frame in preview · {event.frames.length} preview frames</small> : event.samples?.length ? <small>Last sample in preview · {event.samples.length} preview samples</small> : null}</div>;
}

function SensorPreview({ event }: { event: DiagnosticEvent }) {
  const value = (item: Summary[string] | undefined) => typeof item === "number" && Number.isFinite(item) ? String(item) : "Not available";
  if (event.frames?.length) return <div className="sensor-scroll" role="region" aria-label="Radar frame preview" tabIndex={0}><table className="sensor-table">
    <caption>Radar frame preview</caption>
    <thead><tr>{["Frame", "t", "Slot", "x", "y", "speed", "Valid"].map((key) => <th scope="col" key={key}>{key}</th>)}</tr></thead>
    <tbody>{event.frames.flatMap((frame, frameIndex) => frame.targets.length ? frame.targets.map((target, targetIndex) => <tr key={`${frameIndex}:${targetIndex}`}><td>{frameIndex + 1}</td><td>{value(frame.t)}</td><td>{value(target.slot)}</td><td>{value(target.x)}</td><td>{value(target.y)}</td><td>{value(target.speed)}</td><td>{target.valid === true ? "Valid" : target.valid === false ? "Invalid" : "Not reported"}</td></tr>) : [<tr key={frameIndex}><td>{frameIndex + 1}</td><td>{value(frame.t)}</td><td colSpan={5}>No targets reported</td></tr>])}</tbody>
  </table></div>;
  if (event.samples?.length) return <div className="sensor-scroll" role="region" aria-label="Vest sample preview" tabIndex={0}><table className="sensor-table">
    <caption>Vest sample preview</caption>
    <thead><tr>{["Sample", "t", "ax", "ay", "az", "gx", "gy", "gz"].map((key) => <th scope="col" key={key}>{key}</th>)}</tr></thead>
    <tbody>{event.samples.map((sample, index) => <tr key={index}><td>{index + 1}</td>{["t", "ax", "ay", "az", "gx", "gy", "gz"].map((key) => <td key={key}>{value(sample[key])}</td>)}</tr>)}</tbody>
  </table></div>;
  return null;
}

export function EventDetail({ event, onClose }: { event: DiagnosticEvent; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copyState, setCopyState] = useState("");
  useEffect(() => {
    const previous = document.activeElement;
    heading.current?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(event, null, 2)); setCopyState("Copied sanitized JSON."); }
    catch { setCopyState("Copy unavailable. Select the JSON to copy manually."); }
  };
  return <aside className="detail" aria-labelledby="detail-title" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
    <div className="detail-heading"><h2 ref={heading} tabIndex={-1} id="detail-title">Event detail</h2><button onClick={onClose}>Close</button></div>
    <span className={`stage stage-${event.stage}`}>{stageLabels[event.stage]}</span>
    <p>{eventDescription(event)}</p>
    {event.reason && <p><strong>Reason:</strong> {event.reason.replaceAll("_", " ")}</p>}
    <dl className="fields"><div><dt>Device</dt><dd>{event.deviceId}</dd></div><div><dt>Event ID</dt><dd>{event.id}</dd></div><div><dt>UTC</dt><dd>{new Date(event.at).toISOString()}</dd></div><div><dt>Latency</dt><dd>{event.latencyMs === undefined ? "Not reported" : `${event.latencyMs.toLocaleString()} ms`}</dd></div></dl>
    {event.truncated && <p className="notice warning">This event contains a bounded preview, not the full sensor payload or AI request.</p>}
    <section><h3>Sensor readings</h3><SensorValues event={event} /><SensorPreview event={event} /></section>
    <section><h3>Input metadata</h3><Fields value={event.input} /></section>
    <section><h3>AI response</h3><Fields value={event.output} /></section>
    {event.telemetry && <section><h3>Telemetry response</h3><Fields value={event.telemetry} /></section>}
    <details><summary>Formatted JSON</summary><p className="muted">Only validated summary fields are included.</p><button onClick={() => void handleCopy()}>Copy sanitized JSON</button><p role="status">{copyState}</p><pre tabIndex={0} aria-label="Sanitized event JSON">{JSON.stringify(event, null, 2)}</pre></details>
  </aside>;
}
