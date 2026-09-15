import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { put, get, del } from "@vercel/blob";

// 画像ストレージ。Vercel Blob(private) が使えればそれを、無ければローカルFS。
// Blob の認証は2通り: BLOB_STORE_ID + OIDC(Vercel 上で自動発行。現在の Storage 連携の既定)、
// または従来の BLOB_READ_WRITE_TOKEN。どちらかがあれば Blob を使う。
// DBには相対パス(pathname)だけを保存し、配信は常に /api/files 経由(ログイン必須)で行う。
const useBlob = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATA_DIR ?? "./data");
const UPLOADS = path.join(DATA_DIR, "uploads");

function safeJoin(rel: string) {
  // Vercel のファイルシステムは読み取り専用。トークン未設定のままローカル保存に落ちると ENOENT になるため先に説明する
  if (process.env.VERCEL) {
    throw new Error("Blob の環境変数(BLOB_STORE_ID または BLOB_READ_WRITE_TOKEN)がありません。Vercel の Storage で Blob をプロジェクトに接続し、Redeploy してください");
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
