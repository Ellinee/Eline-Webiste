import { debugAsset } from "../../../../debug/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  return debugAsset((await context.params).file);
}
