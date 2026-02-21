import express from "express";
import cors from "cors";
import authRoutes from "./authRoutes";
import { setupRoutes } from "./routes";

import path from "path";

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

// Serve Frontend (Deployment)
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

// Catch-all route to serve index.html for SPA client-side routing
app.get("*", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// Export app for Vercel (serverless)
export default app;

// Only listen if run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
