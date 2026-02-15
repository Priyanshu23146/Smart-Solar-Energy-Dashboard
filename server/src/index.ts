import express from "express";
import cors from "cors";
import authRoutes from "./authRoutes";
import { setupRoutes } from "./routes";

import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/auth", authRoutes);

// Protected Routes (User-specific)
setupRoutes(app);

// Serve Frontend (Deployment)
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

// Catch-all route to serve index.html for SPA client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
