import { useEffect, useRef, useState } from "react";
import { getEvents, subscribeEvents } from "@/api";
import { appendEvents } from "@/lib";
import type { Connection, DiagnosticEvent } from "@/types";

export function useDiagnostics(devices: string[]) {
  const events = useRef<DiagnosticEvent[]>([]);
  const cursor = useRef<string | undefined>(undefined);
  const [visibleEvents, setVisibleEvents] = useState<DiagnosticEvent[]>([]);
  const [generation, setGeneration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [connection, setConnection] = useState<Connection>("reconnecting");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasGap, setHasGap] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const deviceKey = devices.join("|");
  useEffect(() => {
    if (isPaused || hasGap) return;
    const allowed = new Set(deviceKey.split("|"));
    const controller = new AbortController();
    let close = () => {};
    let isDirty = false;
    const flush = setInterval(() => { if (isDirty) { setVisibleEvents(events.current); isDirty = false; } }, 1000);
    const stop = () => { controller.abort(); close(); clearInterval(flush); };
    window.addEventListener("debug:stop", stop);
    void getEvents(controller.signal, cursor.current).then((page) => {
      if (controller.signal.aborted) return;
      if (page.gap) { setHasGap(true); setConnection("offline"); return; }
      events.current = appendEvents(events.current, page.events.filter((event) => allowed.has(event.deviceId)));
      cursor.current = page.cursor ?? cursor.current;
      setIsTruncated(page.truncated);
      setVisibleEvents(events.current);
      setHasError(false);
      close = subscribeEvents({
        cursor: cursor.current,
        signal: controller.signal,
        onConnection: setConnection,
        onCursor: (value) => { cursor.current = value; },
        onGap: () => { setHasGap(true); setConnection("offline"); },
        onEvent: (event) => {
          cursor.current = event.cursor;
          if (allowed.has(event.deviceId)) { events.current = appendEvents(events.current, [event]); isDirty = true; }
        },
      });
    }).catch(() => { if (!controller.signal.aborted) { setHasError(true); setConnection("offline"); } }).finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => { stop(); clearInterval(flush); window.removeEventListener("debug:stop", stop); };
  }, [deviceKey, generation, isPaused, hasGap]);
  const handlePause = () => { setIsPaused((value) => !value); setConnection("reconnecting"); };
  const handleReset = () => {
    events.current = [];
    setVisibleEvents([]);
    cursor.current = undefined;
    setHasGap(false);
    setHasError(false);
    setIsPaused(false);
    setIsLoading(true);
    setConnection("reconnecting");
    setGeneration((value) => value + 1);
  };
  const handleRetry = () => { setHasError(false); setConnection("reconnecting"); setGeneration((value) => value + 1); };
  return { events: visibleEvents, connection, isLoading, hasError, hasGap, isTruncated, isPaused, togglePause: handlePause, reset: handleReset, retry: handleRetry };
}
