import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "./_lib/auth";

/** Lightweight check the admin page calls on load to see if it's already unlocked. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ authed: isAuthed(req) });
}
