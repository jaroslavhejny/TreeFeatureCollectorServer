import { Router } from "express";
import { supabaseAuth } from "../supabase.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "Missing email/password" });

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email: email.trim(),
        password,
    });

    if (error) return res.status(401).json({ error: error.message });
    if (!data.session) return res.status(500).json({ error: "No session returned" });

    return res.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.user,
    });
});

authRouter.post("/logout", async (req, res) => {
    const { access_token, refresh_token } = req.body as {
        access_token: string;
        refresh_token: string;
    };

    if (!access_token || !refresh_token) {
        return res.status(400).json({ error: "Missing tokens" });
    }

    const { error: setErr } = await supabaseAuth.auth.setSession({
        access_token,
        refresh_token,
    });

    if (setErr) return res.status(400).json({ error: setErr.message });

    const { error } = await supabaseAuth.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });

    return res.status(204).send();
});

