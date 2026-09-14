import { readFile } from "@/lib/storage";
import { NextResponse } from "next/server";

const types: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...path]">) {
  const { path } = await ctx.params;
  const rel = path.map(decodeURIComponent).join("/");
  try {
    const data = await readFile(rel);
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(new Uint8Array(data), {
      headers: { "content-type": types[ext] ?? "application/octet-stream", "cache-control": "private, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
