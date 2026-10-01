import { readFile } from "node:fs/promises";
import path from "node:path";

export const privateHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
export function safeAssetName(name: string): boolean {
  return /^[A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,}\.(?:js|css)$/.test(name) && name.length <= 160;
}
export async function debugAsset(name: string): Promise<Response> {
  if (!safeAssetName(name)) return new Response(null, { status: 404, headers: privateHeaders });
  try {
    const body = await readFile(path.join(process.cwd(), ".debug-dist", "assets", name));
    return new Response(body, { headers: { ...privateHeaders, "Content-Type": name.endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8" } });
  } catch { return new Response(null, { status: 404, headers: privateHeaders }); }
}
export async function debugShell(): Promise<Response> {
  try {
    const body = await readFile(path.join(process.cwd(), ".debug-dist", "index.html"), "utf8");
    return new Response(body, { headers: { ...privateHeaders, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", "X-Frame-Options": "DENY" } });
  } catch { return new Response("Diagnostics is unavailable. Build the debug app first.", { status: 503, headers: privateHeaders }); }
}
