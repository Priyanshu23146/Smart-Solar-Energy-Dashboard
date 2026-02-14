import { Router, Request, Response } from "express";
import { readDb, writeDb, User } from "./db";

const router = Router();

// POST /api/auth/signup
router.post("/signup", (req: Request, res: Response) => {
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

    const newUser: User = {
        id: Date.now().toString(), // Simple ID generation
        username,
        password, // In production, hash this!
        city: city || "Mumbai",
        panelCapacity: 5,
        batteryCapacity: 10,
        avgDailyConsumption: 18,
        appliances: [],
    };

    db.users.push(newUser);
    writeDb(db);

    // Return user info excluding password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
    }

    const db = readDb();
    const user = db.users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

export default router;
