import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { supabaseAdmin } from "../supabaseAdmin.js";

export const imagesRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

imagesRouter.post(
    "/",
    requireAuth,
    upload.single("photo"),
    async (req: AuthedRequest, res) => {
        const userId = req.userId!;
        const severity = Number(req.body.severity);
        const description = (req.body.description ?? "").toString();

        if (!req.file) return res.status(400).json({ error: "Missing file: photo" });
        if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
            return res.status(400).json({ error: "severity must be integer 1..5" });
        }

        const ext =
            req.file.mimetype === "image/png" ? "png" :
                req.file.mimetype === "image/webp" ? "webp" : "jpg";

        const fileName = `${crypto.randomUUID()}.${ext}`;
        const storagePath = `${userId}/${fileName}`;

        const up = await supabaseAdmin.storage
            .from("images")
            .upload(storagePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false,
            });

        if (up.error) return res.status(500).json({ error: up.error.message });
        const ins = await supabaseAdmin
            .from("images")
            .insert({
                owner: userId,
                storage_path: storagePath,
                severity,
                description,
            })
            .select()
            .single();

        if (ins.error) return res.status(500).json({ error: ins.error.message });

        return res.json(ins.data);
    }
);


imagesRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
        const userId = req.userId!;

        const { data, error } = await supabaseAdmin
            .from("images")
            .select("id, storage_path, severity, description, created_at")
            .eq("owner", userId)
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const withUrls = await Promise.all(
            (data ?? []).map(async (row) => {
                    const { data: signed, error: sErr } = await supabaseAdmin.storage
                        .from("images")
                        .createSignedUrl(row.storage_path, 60 * 60); // 1 hodina

                    const publicUrl = supabaseAdmin.storage.from("images").getPublicUrl(row.storage_path).data.publicUrl;

                    return {
                            ...row,
                            imageUrl: signed?.signedUrl ?? publicUrl,
                    };
            })
        );

        res.json(withUrls);
});

imagesRouter.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
        const userId = req.userId!;
        const id = req.params.id;

        const { data, error } = await supabaseAdmin
            .from("images")
            .select("id, storage_path, severity, description, created_at")
            .eq("id", id)
            .eq("owner", userId)
            .single();

        if (error) return res.status(404).json({ error: "Not found" });

        const { data: signed } = await supabaseAdmin.storage
            .from("images")
            .createSignedUrl(data.storage_path, 60 * 60);

        const publicUrl = supabaseAdmin.storage.from("images").getPublicUrl(data.storage_path).data.publicUrl;

        res.json({
                ...data,
                imageUrl: signed?.signedUrl ?? publicUrl,
        });
});

