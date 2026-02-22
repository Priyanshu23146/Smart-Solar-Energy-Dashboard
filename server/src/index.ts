import express from "express";
import cors from "cors";
import authRoutes from "./authRoutes";
import { setupRoutes } from "./routes";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create API Router
const apiRouter = express.Router();

// Auth Routes within API
apiRouter.use("/auth", authRoutes);

// Protected Routes within API
setupRoutes(apiRouter);

// Mount API Router
app.use("/api", apiRouter);
console.log("[SERVER] API routes mounted at /api");

// Serve Frontend (Local for testing, Vercel serves its own dist)
if (!process.env.VERCEL) {
    const distPath = path.join(__dirname, "../../dist");
    app.use(express.static(distPath));

    // Catch-all route to serve index.html for SPA client-side routing
    app.get("*", (req: express.Request, res: express.Response) => {
        if (fs.existsSync(path.join(distPath, "index.html"))) {
            res.sendFile(path.join(distPath, "index.html"));
        } else {
            res.status(404).send("Frontend dist not found. Run npm run build.");
        }
    });
}

// Export app for Vercel (serverless)
export default app;

// Only listen if run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
