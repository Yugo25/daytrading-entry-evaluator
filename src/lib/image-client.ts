// Shrink and re-encode images in the browser before sending.
// Purpose: (1) keep phone screenshots (1–3MB PNG) from exceeding the Server Action / Vercel body limit
//          (2) normalize formats the server can't handle, such as iPhone HEIC, to JPEG (Safari can decode HEIC in <img>)
const MAX_EDGE = 2000; // the upper bound at which chart details (candles, lines) are still readable
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
  // If shrinking didn't make it smaller (e.g. the original was a small PNG), send the original file
  if (scale === 1 && blob.size >= file.size && file.type !== "image/heic" && file.type !== "image/heif" && file.type !== "") return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* HEIC etc. may not be supported by createImageBitmap, so fall back to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Could not load image: ${file.name}`));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Replace every image in the given FormData field with a shrunk version */
export async function shrinkFormImages(fd: FormData, field: string) {
  const files = fd.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  fd.delete(field);
  for (const f of files) fd.append(field, await shrinkImage(f));
}
