import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { imagesRouter } from "./routes/images.js";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json('alive'));
app.use("/auth", authRouter);
app.use("/images", imagesRouter);


// 10.0.1.45
app.listen(Number(process.env.PORT || 3000), "0.0.0.0", () => {
    console.log(`API on http://0.0.0.0:${process.env.PORT || 3000}`);
});
