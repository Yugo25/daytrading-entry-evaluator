import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { put, get, del } from "@vercel/blob";

// Image storage. Uses Vercel Blob (private) when available, otherwise the local filesystem.
// Blob auth works two ways: BLOB_STORE_ID + OIDC (issued automatically on Vercel; the current Storage integration default),
// or the legacy BLOB_READ_WRITE_TOKEN. Blob is used if either is present.
// Only the relative path (pathname) is stored in the DB; files are always served via /api/files (login required).
const useBlob = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATA_DIR ?? "./data");
const UPLOADS = path.join(DATA_DIR, "uploads");

function safeJoin(rel: string) {
  // The Vercel filesystem is read-only. Falling back to local storage without a token would fail with ENOENT, so explain up front
  if (process.env.VERCEL) {
    throw new Error("Blob environment variables (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN) are missing. Connect Blob to the project under Storage in Vercel, then redeploy");
  }
  const p = path.resolve(UPLOADS, rel);
  if (!p.startsWith(UPLOADS + path.sep)) throw new Error("invalid path");
  return p;
}

export async function saveFile(rel: string, data: Buffer, contentType: string) {
  if (useBlob) {
    await put(`uploads/${rel}`, data, { access: "private", addRandomSuffix: false, contentType });
    return rel;
  }
  const p = safeJoin(rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, data);
  return rel;
}

export async function readFile(rel: string): Promise<Buffer> {
  if (useBlob) {
    const res = await get(`uploads/${rel}`, { access: "private" });
    if (!res) throw new Error("not found");
    return Buffer.from(await new Response(res.stream).arrayBuffer());
  }
  return fs.readFile(safeJoin(rel));
}

export async function deleteFile(rel: string) {
  if (useBlob) return del(`uploads/${rel}`);
  await fs.rm(safeJoin(rel), { force: true });
}

export function fileUrl(rel: string) {
  return `/api/files/${rel.split("/").map(encodeURIComponent).join("/")}`;
}
