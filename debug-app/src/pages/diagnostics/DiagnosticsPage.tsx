import { useState } from "react";
import { useQueryGetStatus } from "@/api";
import { stageLabels } from "@/constants";
import { useAuth } from "@/context";
import { useDiagnostics } from "@/hooks";
import { eventDescription } from "@/lib";
import { EventDetail, SensorValues, SourceStatus } from "./components";

export default function DiagnosticsPage() {
  const auth = useAuth();
  const devices = auth.session?.devices ?? [];
  const feed = useDiagnostics(devices);
  const status = useQueryGetStatus();
  const [source, setSource] = useState("");
  const [device, setDevice] = useState("");
  const [selectedCursor, setSelectedCursor] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const filtered = feed.events.filter((event) => devices.includes(event.deviceId) && (!source || event.source === source) && (!device || event.deviceId === device)).reverse();
  const selected = filtered.find((event) => event.cursor === selectedCursor);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 50));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(currentPage * 50, currentPage * 50 + 50);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const handleReset = () => { setSelectedCursor(null); setPage(0); feed.reset(); };
  return <main className="diagnostics">
    <header className="page-header"><h1>Device diagnostics</h1><div className="actions"><span className={`connection ${feed.isPaused ? "paused" : feed.connection}`} role="status">{feed.isPaused ? "Paused locally" : feed.connection}</span><button onClick={() => void auth.logout()}>Logout</button></div></header>
    {status.isPending && <p role="status">Loading source status…</p>}
    {status.isError && <p role="alert" className="notice warning">Source status unavailable; readiness is stale. <button onClick={() => void status.refetch()}>Retry</button></p>}
    {status.data && <SourceStatus value={status.data} failed={status.isError} />}
    <section className="toolbar" aria-label="Event filters">
      <div className="filter"><label htmlFor="source">Source</label><select id="source" value={source} onChange={(event) => { setSource(event.target.value); setSelectedCursor(null); setPage(0); }}><option value="">All sources</option><option value="radar">Radar</option><option value="vest">Vest</option></select></div>
      <div className="filter device-filter"><label htmlFor="device">Device</label><select id="device" value={device} onChange={(event) => { setDevice(event.target.value); setSelectedCursor(null); setPage(0); }}><option value="">All authorized devices</option>{devices.map((id) => <option value={id} key={id}>{id}</option>)}</select></div>
      <div className="toolbar-actions"><button disabled={feed.hasGap} onClick={feed.togglePause}>{feed.isPaused ? "Resume" : "Pause"}</button><button onClick={handleReset}>Reset view</button></div>
    </section>
    <div className="view-note"><span>{filtered.length.toLocaleString()} events · latest 2,000 retained in memory</span><span>Local time · {timeZone} · updates about every second</span></div>
    {feed.isPaused && <p className="notice">This viewer is paused. Production processing continues; resume may reveal a retention gap.</p>}
    {feed.hasGap && <p role="alert" className="notice warning">The event cursor is no longer available. Some events may be missing. <button onClick={handleReset}>Reset event history</button></p>}
    {feed.isTruncated && <p className="notice warning">The backend returned a truncated event history.</p>}
    {(feed.hasError || (feed.connection === "offline" && !feed.hasGap)) && <p role="alert" className="notice warning">Live events are unavailable. Displayed events may be stale. <button onClick={feed.retry}>Reconnect</button></p>}
    <div className={`event-workspace ${selected ? "has-detail" : ""}`}>
      <section className="event-list" aria-label="Event timeline">
        <div className="list-heading"><h2>Event timeline</h2><span>Newest first</span></div>
        {feed.isLoading ? <div className="empty" role="status">Loading events…</div> : !visible.length ? <div className="empty"><h3>{devices.length ? "No events to display" : "No devices authorized"}</h3><p>{devices.length ? "Events will appear here when the backend reports activity matching your filters." : "Device access is configured on the backend. Ask an administrator to update the allowlist."}</p></div> : <div className="table-scroll"><table><thead><tr><th scope="col">Time</th><th scope="col">Source / device</th><th scope="col">Stage</th><th scope="col">Sensor readings</th><th scope="col">Latency</th><th scope="col"><span className="sr-only">Details</span></th></tr></thead><tbody>{visible.map((event) => <tr key={event.cursor} className={selectedCursor === event.cursor ? "selected" : ""}><td><time dateTime={event.at} title={`UTC: ${new Date(event.at).toISOString()}`}>{new Date(event.at).toLocaleTimeString([], { hour12: false })}<small>{new Date(event.at).toLocaleDateString()}</small></time></td><td><span className="source-label">{event.source}</span><small className="device-id">{event.deviceId}</small></td><td><span className={`stage stage-${event.stage}`}>{stageLabels[event.stage]}</span>{event.truncated && <small>Truncated</small>}</td><td className="summary-cell sensor-cell"><SensorValues event={event} /><small>{eventDescription(event)}</small></td><td className="latency">{event.latencyMs === undefined ? "—" : `${event.latencyMs.toLocaleString()} ms`}</td><td><button aria-label={`Inspect ${stageLabels[event.stage]} event ${event.id}`} aria-expanded={selectedCursor === event.cursor} onClick={() => setSelectedCursor(event.cursor)}>Inspect</button></td></tr>)}</tbody></table></div>}
        <div className="pagination"><span>Page {currentPage + 1} of {totalPages}</span><div><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><button disabled={currentPage + 1 >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
      </section>
      {selected && <EventDetail key={selected.cursor} event={selected} onClose={() => setSelectedCursor(null)} />}
    </div>
    <p className="footnote">Buffered does not mean normal. Radar and Vest report AI inference; Radar also forwards Vest telemetry. Kafka acknowledgement is broker-only; this viewer covers IoT-to-AI diagnostics.</p>
  </main>;
}
