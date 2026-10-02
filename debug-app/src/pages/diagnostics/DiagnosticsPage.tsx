import { useState } from "react";
import { useQueryGetStatus } from "@/api";
import { maxEvents } from "@/constants";
import { useAuth } from "@/context";
import { useDiagnostics } from "@/hooks";
import { filterEvents, sensorLabel } from "@/lib";
import { EventDetail, SensorValues, SourceStatus } from "./components";

export default function DiagnosticsPage() {
  const auth = useAuth();
  const devices = auth.session?.devices ?? [];
  const feed = useDiagnostics(devices);
  const status = useQueryGetStatus();
  const [source, setSource] = useState("");
  const [service, setService] = useState("");
  const [device, setDevice] = useState("");
  const [selectedCursor, setSelectedCursor] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const filtered = filterEvents(feed.events, devices, source, device, service);
  const selected = filtered.find((event) => event.cursor === selectedCursor);
  const active = selected ?? filtered[0];
  const totalPages = Math.max(1, Math.ceil(filtered.length / 50));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(currentPage * 50, currentPage * 50 + 50);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const resetSelection = () => { setSelectedCursor(null); setPage(0); };
  const handleReset = () => { resetSelection(); feed.reset(); };
  return <main className="diagnostics">
    <header className="page-header"><h1>Sensor data</h1><div className="actions"><span className={`connection ${feed.isPaused ? "paused" : feed.connection}`} role="status">{feed.isPaused ? "Paused locally" : feed.connection}</span><button onClick={() => void auth.logout()}>Logout</button></div></header>
    {status.isPending && <p role="status">Loading source status…</p>}
    {status.isError && <p role="alert" className="notice warning">Source status unavailable; readiness is stale. <button onClick={() => void status.refetch()}>Retry</button></p>}
    {status.data && <SourceStatus value={status.data} failed={status.isError} />}
    <section className="toolbar" aria-label="Sensor filters">
      <div className="filter"><label htmlFor="source">Sensor</label><select id="source" value={source} onChange={(event) => { setSource(event.target.value); resetSelection(); }}><option value="">All sensors</option><option value="radar">Radar</option><option value="vest">Vest</option></select></div>
      <div className="filter"><label htmlFor="service">Service</label><select id="service" value={service} onChange={(event) => { setService(event.target.value); resetSelection(); }}><option value="">All services</option><option value="radar">Radar gateway</option><option value="vest">Vest service</option></select></div>
      <div className="filter device-filter"><label htmlFor="device">Device</label><select id="device" value={device} onChange={(event) => { setDevice(event.target.value); resetSelection(); }}><option value="">All authorized devices</option>{devices.map((id) => <option value={id} key={id}>{id}</option>)}</select></div>
      <div className="toolbar-actions"><button disabled={feed.hasGap} onClick={feed.togglePause}>{feed.isPaused ? "Resume" : "Pause"}</button><button onClick={handleReset}>Reset view</button></div>
    </section>
    <div className="view-note"><span>{filtered.length.toLocaleString()} validated inputs · up to {maxEvents.toLocaleString()} retained in memory</span><span>Received time · {timeZone} · updates about every second</span></div>
    {feed.isPaused && <p className="notice">This viewer is paused. Production processing continues; resume may reveal a retention gap.</p>}
    {feed.hasGap && <p role="alert" className="notice warning">The event cursor is no longer available. Some events may be missing. <button onClick={handleReset}>Reset event history</button></p>}
    {feed.isTruncated && <p className="notice warning">The backend returned a truncated event history.</p>}
    {(feed.hasError || (feed.connection === "offline" && !feed.hasGap)) && <p role="alert" className="notice warning">Live events are unavailable. Displayed events may be stale. <button onClick={feed.retry}>Reconnect</button></p>}
    {active && <EventDetail key={`${selected ? "selected" : "latest"}:${active.cursor}`} event={active} onClose={selected ? () => setSelectedCursor(null) : undefined} />}
    <section className="event-list" aria-label="Received inputs">
      <div className="list-heading"><h2>Received inputs</h2><span>Newest received first</span></div>
      {feed.isLoading ? <div className="empty" role="status">Loading inputs…</div> : !visible.length ? <div className="empty"><h3>{devices.length ? "No validated inputs to display" : "No devices authorized"}</h3><p>{devices.length ? "Received sensor data will appear when a validated input matches your filters." : "Device access is configured on the backend. Ask an administrator to update the allowlist."}</p></div> : <div className="table-scroll"><table><thead><tr><th scope="col">Received time</th><th scope="col">Sensor / device</th><th scope="col">Captured readings</th><th scope="col"><span className="sr-only">View input</span></th></tr></thead><tbody>{visible.map((event) => <tr key={event.cursor} className={active?.cursor === event.cursor ? "selected" : ""}>
        <td><time dateTime={event.at} title={`Received time (UTC): ${new Date(event.at).toISOString()}`}>{new Date(event.at).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}<small>{new Date(event.at).toLocaleDateString()}</small></time></td>
        <td><span>{sensorLabel(event)}</span><small className="device-id">{event.deviceId}</small></td>
        <td className="summary-cell sensor-cell"><SensorValues event={event} /></td>
        <td><button aria-label={`View received input ${event.id} from ${event.deviceId}`} aria-expanded={active?.cursor === event.cursor} aria-controls="received-input" onClick={() => setSelectedCursor(event.cursor)}>View</button></td>
      </tr>)}</tbody></table></div>}
      <div className="pagination"><span>Page {currentPage + 1} of {totalPages}</span><div><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><button disabled={currentPage + 1 >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
    </section>
  </main>;
}
