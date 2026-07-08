import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/*
 * Admin auth — a deliberately small, server-checked password gate (NOT a full
 * user system). The real password lives only in the ADMIN_PASSWORD env var and
 * is never sent to the browser. A successful login gets a short-lived, HMAC-
 * signed session token (signed with SESSION_SECRET) stored in an httpOnly
 * cookie, so it can't be read or forged from client-side JS.
 */

const COOKIE_NAME = "adn_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

/** Constant-time check of a candidate password against ADMIN_PASSWORD. */
export function isPasswordValid(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  // Hash both to a fixed length so timingSafeEqual never leaks length and
  // never throws on a mismatched-length comparison.
  const a = new Uint8Array(
    crypto.createHash("sha256").update(candidate).digest(),
  );
  const b = new Uint8Array(
    crypto.createHash("sha256").update(expected).digest(),
  );
  return crypto.timingSafeEqual(a, b);
}

/** Signs a session token: `base64url(payload).base64url(hmac)`. */
export function signSession(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = base64url(JSON.stringify({ exp }));
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest();
  return `${payload}.${base64url(sig)}`;
}

/** Verifies a session token's signature and expiry. */
export function isSessionValid(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = new Uint8Array(
    crypto.createHmac("sha256", getSecret()).update(payload).digest(),
  );
  let provided: Uint8Array;
  try {
    provided = new Uint8Array(Buffer.from(sig, "base64url"));
  } catch {
    return false;
  }
  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return false;
  }

  try {
    const { exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: unknown };
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k) out[k] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function getSessionToken(req: VercelRequest): string | undefined {
  return parseCookies(req.headers.cookie)[COOKIE_NAME];
}

/** True when the request carries a valid, unexpired session cookie. */
export function isAuthed(req: VercelRequest): boolean {
  return isSessionValid(getSessionToken(req));
}

function isLocalhost(req: VercelRequest): boolean {
  const host = req.headers.host ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

function cookie(req: VercelRequest, value: string, maxAge: number): string {
  // Secure is dropped on localhost so the cookie still sets over http during
  // `vercel dev`; production is always https so it's always Secure there.
  const secure = isLocalhost(req) ? "" : " Secure;";
  return `${COOKIE_NAME}=${value}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function setSessionCookie(
  req: VercelRequest,
  res: VercelResponse,
  token: string,
): void {
  res.setHeader(
    "Set-Cookie",
    cookie(req, encodeURIComponent(token), SESSION_TTL_SECONDS),
  );
}

export function clearSessionCookie(
  req: VercelRequest,
  res: VercelResponse,
): void {
  res.setHeader("Set-Cookie", cookie(req, "", 0));
}
