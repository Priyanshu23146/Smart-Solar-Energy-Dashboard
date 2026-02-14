import express from "express";
import cors from "cors";
import authRoutes from "./authRoutes";
import { setupRoutes } from "./routes";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/auth", authRoutes);

// Protected Routes (User-specific)
setupRoutes(app);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
