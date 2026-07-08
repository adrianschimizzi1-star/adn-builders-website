import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "./_lib/auth.js";

/** Lightweight check the admin page calls on load to see if it's already unlocked. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return res.status(200).json({ authed: isAuthed(req) });
  } catch (err) {
    console.error("session handler error:", err);
    // Treat any verification error as "not logged in" rather than crashing.
    return res.status(200).json({ authed: false });
  }
}
