import { useEffect, useRef, useState } from "react";
import { getEvents, subscribeEvents } from "@/api";
import { DiagnosticEventStore } from "@/lib/events";
import type { Connection, DiagnosticEvent } from "@/types";

export function useDiagnostics(devices: string[]) {
  const events = useRef(new DiagnosticEventStore());
  const cursor = useRef<string | undefined>(undefined);
  const needsSnapshot = useRef(false);
  const previousDevices = useRef(devices.join("|"));
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
    if (isPaused) return;
    const allowed = new Set(deviceKey.split("|"));
    if (previousDevices.current !== deviceKey) {
      previousDevices.current = deviceKey;
      events.current.clear();
      cursor.current = undefined;
      needsSnapshot.current = true;
    }
    let stopped = false;
    let controller: AbortController | undefined;
    let close = () => {};
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let flushTimer: ReturnType<typeof setInterval> | undefined;
    let attempts = 0;
    let isDirty = false;
    const flush = () => {
      if (isDirty && !stopped) { setVisibleEvents(events.current.snapshot()); isDirty = false; }
    };
    const disconnect = () => {
      controller?.abort();
      close();
      close = () => {};
      clearInterval(flushTimer);
      flushTimer = undefined;
    };
    const stop = () => {
      stopped = true;
      disconnect();
      clearTimeout(retryTimer);
      retryTimer = undefined;
    };
    const recover = (gap: boolean) => {
      if (stopped) return;
      disconnect();
      clearTimeout(retryTimer);
      if (gap) {
        needsSnapshot.current = true;
        setHasGap(true);
      }
      if (++attempts > 5) {
        setHasError(true);
        setIsLoading(false);
        setConnection("offline");
        return;
      }
      setConnection("reconnecting");
      retryTimer = setTimeout(() => { retryTimer = undefined; void connect(); }, Math.min(1000 * 2 ** (attempts - 1), 16000));
    };
    const connect = async () => {
      if (stopped) return;
      const request = new AbortController();
      controller = request;
      const current = () => !stopped && controller === request && !request.signal.aborted;
      try {
        const fresh = needsSnapshot.current;
        const page = await getEvents(request.signal, fresh ? undefined : cursor.current);
        if (!current()) return;
        if (page.gap) { recover(true); return; }
        if (fresh && !page.cursor) throw new Error("Missing recovery cursor");
        if (fresh) events.current.clear();
        for (const event of page.events) if (allowed.has(event.deviceId)) events.current.append(event);
        cursor.current = page.cursor ?? cursor.current;
        needsSnapshot.current = false;
        setIsTruncated(page.truncated);
        setVisibleEvents(events.current.snapshot());
        isDirty = false;
        setHasError(false);
        setIsLoading(false);
        flushTimer = setInterval(flush, 1000);
        close = subscribeEvents({
          cursor: cursor.current,
          signal: request.signal,
          onConnection: (value) => {
            if (!current()) return;
            setConnection(value);
            if (value === "offline") { flush(); disconnect(); }
          },
          onCursor: (value) => { if (current()) cursor.current = value; },
          onGap: () => { if (current()) recover(true); },
          onEvent: (event) => {
            if (!current()) return;
            cursor.current = event.cursor;
            if (allowed.has(event.deviceId) && event.stage === "validated") { events.current.append(event); isDirty = true; }
          },
        });
      } catch {
        if (current()) recover(false);
      }
    };
    window.addEventListener("debug:stop", stop);
    void connect();
    return () => { stop(); window.removeEventListener("debug:stop", stop); };
  }, [deviceKey, generation, isPaused]);
  const handlePause = () => { setIsPaused((value) => !value); setConnection("reconnecting"); };
  const handleReset = () => {
    events.current.clear();
    setVisibleEvents([]);
    cursor.current = undefined;
    needsSnapshot.current = true;
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
