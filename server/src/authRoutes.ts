import { Router, Request, Response } from "express";
import { readDb, writeDb, User } from "./db";
import bcrypt from "bcryptjs";

const router = Router();

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
    try {
        const { username, password, city } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }

        const db = readDb();
        const existingUser = db.users.find((u) => u.username === username);

        if (existingUser) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: User = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            city: city || "Mumbai",
            country: "India",
            state: "",
            pincode: "",
            panelCapacity: 5,
            batteryCapacity: 10,
            avgDailyConsumption: 18,
            appliances: [],
        };

        db.users.push(newUser);
        writeDb(db);

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }

        const db = readDb();
        const user = db.users.find((u) => u.username === username);

        if (!user || !user.password) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
