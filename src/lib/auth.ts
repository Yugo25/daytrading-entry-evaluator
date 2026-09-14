import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "dte_session";

export function authEnabled() {
  return Boolean(process.env.APP_PASSWORD);
}

export function sessionToken() {
  return createHmac("sha256", process.env.APP_PASSWORD ?? "").update("session-v1").digest("hex");
}

export function isValidSession(token: string | undefined) {
  if (!authEnabled()) return true;
  if (!token) return false;
  const expected = Buffer.from(sessionToken());
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
