import { handleDebugRequest } from "../../../../debug/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleDebugRequest(request, (await context.params).path, {
    apiUrl: process.env.DEBUG_API_URL,
    allowedOrigin: process.env.DEBUG_ALLOWED_ORIGIN,
    production: process.env.NODE_ENV === "production",
  });
}
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD, handle as OPTIONS };
