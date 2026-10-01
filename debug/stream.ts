import { normalizeEvent, normalizeEvents, normalizeStatus, safeCursor } from "./contract.ts";

export function sanitizeSse(body: ReadableStream<Uint8Array>, abort: AbortController, cleanup: () => void): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let isFinished = false;
  let timer: ReturnType<typeof setTimeout>;
  let streamController: ReadableStreamDefaultController<Uint8Array>;
  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    clearTimeout(timer);
    abort.signal.removeEventListener("abort", onAbort);
    cleanup();
    void reader.cancel().catch(() => {});
  };
  const onAbort = () => { if (!isFinished) { finish(); streamController.error(new Error("Diagnostics stream unavailable")); } };
  const refresh = () => { clearTimeout(timer); timer = setTimeout(() => abort.abort(), 45_000); };
  const diagnostic = (event: NonNullable<ReturnType<typeof normalizeEvent>>) => `id: ${event.cursor}\nevent: diagnostic\ndata: ${JSON.stringify(event)}\n\n`;
  return new ReadableStream({
    start(controller) {
      streamController = controller;
      abort.signal.addEventListener("abort", onAbort, { once: true });
      if (abort.signal.aborted) onAbort(); else refresh();
    },
    async pull(controller) {
      try {
        while (!isFinished) {
          const delimiter = /\r?\n\r?\n/.exec(buffer);
          if (delimiter) {
            const frame = buffer.slice(0, delimiter.index);
            buffer = buffer.slice(delimiter.index + delimiter[0].length);
            let kind = "message";
            let id: string | undefined;
            const lines: string[] = [];
            let isHeartbeat = false;
            for (const line of frame.split(/\r?\n/)) {
              if (line.startsWith(":")) isHeartbeat = true;
              if (line.startsWith("event:")) kind = line.slice(6).trim();
              if (line.startsWith("id:")) id = safeCursor(line.slice(3).trim());
              if (line.startsWith("data:")) lines.push(line.slice(5).trimStart());
            }
            if (kind === "heartbeat" || (isHeartbeat && !lines.length)) {
              controller.enqueue(encoder.encode("event: heartbeat\ndata: {}\n\n")); return;
            }
            if (kind === "gap" || kind === "reset") {
              controller.enqueue(encoder.encode("event: gap\ndata: {\"gap\":true}\n\n")); return;
            }
            if (!["message", "diagnostic", "event", "events", "status"].includes(kind)) continue;
            if (!lines.length) continue;
            const parsed: unknown = JSON.parse(lines.join("\n"));
            if (kind === "status") {
              const status = normalizeStatus(parsed);
              if (!status) throw new Error("Invalid status");
              controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify(status)}\n\n`)); return;
            }
            if (kind === "events") {
              const page = normalizeEvents(parsed);
              if (!page || (id && id !== page.cursor)) throw new Error("Invalid page");
              if (page.gap) { controller.enqueue(encoder.encode("event: gap\ndata: {\"gap\":true}\n\n")); return; }
              controller.enqueue(encoder.encode(page.events.map(diagnostic).join("") + `event: checkpoint\ndata: ${JSON.stringify({ cursor: page.cursor })}\n\n`)); return;
            }
            const event = normalizeEvent(parsed);
            if (!event || (id && id !== event.cursor)) throw new Error("Invalid stream");
            controller.enqueue(encoder.encode(diagnostic(event))); return;
          }
          const chunk = await reader.read();
          if (isFinished) return;
          if (chunk.done) { finish(); controller.close(); return; }
          refresh();
          buffer += decoder.decode(chunk.value, { stream: true });
          if (buffer.length > 524_288) throw new Error("Frame too large");
        }
      } catch { if (!isFinished) { finish(); abort.abort(); controller.error(new Error("Diagnostics stream unavailable")); } }
    },
    cancel() { finish(); abort.abort(); },
  });
}
