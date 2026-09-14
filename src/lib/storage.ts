import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

// ローカルはファイルシステム。クラウド配置時は同じ3関数を Vercel Blob / S3 実装に差し替える。
const DATA_DIR = path.resolve(process.cwd(), process.env.DATA_DIR ?? "./data");
const UPLOADS = path.join(DATA_DIR, "uploads");

function safeJoin(rel: string) {
  const p = path.resolve(UPLOADS, rel);
  if (!p.startsWith(UPLOADS + path.sep)) throw new Error("invalid path");
  return p;
}

export async function saveFile(rel: string, data: Buffer) {
  const p = safeJoin(rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, data);
  return rel;
}

export async function readFile(rel: string) {
  return fs.readFile(safeJoin(rel));
}

export function fileUrl(rel: string) {
  return `/api/files/${rel.split("/").map(encodeURIComponent).join("/")}`;
}
