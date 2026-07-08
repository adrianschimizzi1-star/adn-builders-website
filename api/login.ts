import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isPasswordValid, signSession, setSessionCookie } from "./_lib/auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(500).json({
      error:
        "Admin isn't configured yet. Set ADMIN_PASSWORD and SESSION_SECRET in your Vercel project.",
    });
  }

  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!isPasswordValid(password)) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  setSessionCookie(req, res, signSession());
  return res.status(200).json({ ok: true });
}
