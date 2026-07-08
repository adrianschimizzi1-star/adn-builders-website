import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearSessionCookie } from "./_lib/auth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    clearSessionCookie(req, res);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("logout handler error:", err);
    return res.status(500).json({ error: "Logout failed on the server." });
  }
}
