// ブラウザ側で画像を送信前に縮小・再エンコードする。
// 目的: (1) スマホのスクショ(1〜3MB PNG)が Server Action / Vercel の本文上限を超えるのを防ぐ
//       (2) iPhone の HEIC など server 側で扱えない形式を JPEG に揃える(Safari は img で HEIC をデコードできる)
const MAX_EDGE = 2000; // チャートの細部(ローソク・ライン)が読める上限
const QUALITY = 0.9;

export async function shrinkImage(file: File): Promise<File> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", QUALITY));
  if (!blob) return file;
  // 縮小しても小さくならなかった(元が小さいPNG等)場合は元ファイルのまま送る
  if (scale === 1 && blob.size >= file.size && file.type !== "image/heic" && file.type !== "image/heif" && file.type !== "") return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* HEIC 等は createImageBitmap 非対応のことがあるので <img> にフォールバック */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`画像を読み込めませんでした: ${file.name}`));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** FormData 内の指定フィールドの画像を全て縮小版に置き換える */
export async function shrinkFormImages(fd: FormData, field: string) {
  const files = fd.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  fd.delete(field);
  for (const f of files) fd.append(field, await shrinkImage(f));
}
