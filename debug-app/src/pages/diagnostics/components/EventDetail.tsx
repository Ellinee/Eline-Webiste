import { useEffect, useRef, useState } from "react";
import { stageLabels } from "@/constants";
import { eventDescription } from "@/lib";
import type { DiagnosticEvent, Summary } from "@/types";

function Fields({ value }: { value?: Summary }) {
  if (!value || !Object.keys(value).length) return <p className="muted">Not reported for this event.</p>;
  return <dl className="fields">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd>{item === null ? "Not available" : Array.isArray(item) ? item.join(", ") : String(item)}</dd></div>)}</dl>;
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
    {event.truncated && <p className="notice warning">This event contains a truncated summary, not the full sensor payload.</p>}
    <section><h3>Input</h3><Fields value={event.input} />{event.coordinates && <><h4>Last preview coordinates</h4><Fields value={event.coordinates} /></>}</section>
    <section><h3>AI response</h3><Fields value={event.output} /></section>
    {event.telemetry && <section><h3>Telemetry response</h3><Fields value={event.telemetry} /></section>}
    <details><summary>Formatted JSON</summary><p className="muted">Only validated summary fields are included.</p><button onClick={() => void handleCopy()}>Copy sanitized JSON</button><p role="status">{copyState}</p><pre tabIndex={0} aria-label="Sanitized event JSON">{JSON.stringify(event, null, 2)}</pre></details>
  </aside>;
}
