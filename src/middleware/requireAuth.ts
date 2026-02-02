import type { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "../supabase.js";

export type AuthedRequest = Request & { userId?: string };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing Bearer token" });

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) return res.status(401).json({ error: "Invalid token" });

    req.userId = data.user.id;
    next();
}
