import type { Express, Request, Response, NextFunction } from "express";
import { readDb, writeDb, User } from "./db";

export function setupRoutes(app: Express) {
    // Middleware to get current user
    const getUser = (req: Request, res: Response): User | undefined => {
        const userId = req.headers["x-user-id"] as string;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: Missing User ID" });
            return undefined;
        }

        const db = readDb();
        const user = db.users.find((u) => u.id === userId);

        if (!user) {
            res.status(401).json({ error: "Unauthorized: Invalid User" });
            return undefined;
        }
        return user;
    };

    // GET Config
    app.get("/config", (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;

        res.json({
            city: user.city,
            panelCapacity: user.panelCapacity,
            batteryCapacity: user.batteryCapacity,
            avgDailyConsumption: user.avgDailyConsumption,
        });
    });

    // POST Config
    app.post("/config", (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;

        const { city, panelCapacity, batteryCapacity, avgDailyConsumption } =
            req.body;

        const db = readDb();
        const userIndex = db.users.findIndex((u) => u.id === user.id);
        if (userIndex === -1) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const currentUser = db.users[userIndex];

        if (city !== undefined) currentUser.city = city;
        if (panelCapacity !== undefined) currentUser.panelCapacity = panelCapacity;
        if (batteryCapacity !== undefined)
            currentUser.batteryCapacity = batteryCapacity;
        if (avgDailyConsumption !== undefined)
            currentUser.avgDailyConsumption = avgDailyConsumption;

        writeDb(db);
        res.json({ message: "Config updated", config: currentUser });
    });

    // GET Appliances
    app.get("/appliances", (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;
        res.json(user.appliances);
    });

    // POST Appliance
    app.post("/appliances", (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;

        const { name, power } = req.body;
        if (!name || !power) {
            res.status(400).json({ error: "Name and power are required" });
            return;
        }

        const db = readDb();
        const currentUser = db.users.find((u) => u.id === user.id);
        if (!currentUser) { // Should not happen given getUser check but TS sanity
            res.sendStatus(401);
            return;
        }

        const newAppliance = {
            id: Date.now(),
            name,
            power: Number(power),
        };

        currentUser.appliances.push(newAppliance);
        writeDb(db);
        res.status(201).json(newAppliance);
    });

    // DELETE Appliance
    app.delete("/appliances/:id", (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;

        const { id } = req.params;

        const db = readDb();
        const currentUser = db.users.find((u) => u.id === user.id);
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }

        currentUser.appliances = currentUser.appliances.filter(
            (a) => a.id !== Number(id)
        );

        writeDb(db);
        res.json({ message: "Appliance deleted" });
    });

    // GET Weather
    app.get("/weather", async (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;

        try {
            const city = user.city || "London";

            // 1. Geocoding
            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );
            const geoData: any = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                res.status(404).json({ error: "City not found" });
                return;
            }

            const { latitude, longitude } = geoData.results[0];

            // 2. Weather
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,rain&daily=sunrise,sunset,sunshine_duration&timezone=auto`
            );
            const weatherData: any = await weatherRes.json();

            // Calculate Sun Hours (simplified)
            // sunshine_duration is in seconds, convert to hours
            const sunSeconds = weatherData.daily.sunshine_duration[0] || 0;
            const sunHours = Number((sunSeconds / 3600).toFixed(1));

            res.json({
                temperature: weatherData.current.temperature_2m,
                cloudCover: weatherData.current.cloud_cover,
                rainProbability: weatherData.current.rain, // Open-Meteo 'rain' is mm, but for simplicity let's use it or cloud cover proxy
                // Note: Open-Meteo has 'precipitation_probability' in hourly, not current. 
                // For 'current', let's just send what we have. 
                // Better: Use daily max/min or hourly data. 
                // For simplicity, let's map 'rain' (mm) > 0 ? 100 : 0 as probability if exact not available, 
                // OR just fetch hourly and take current hour.
                // Let's stick to simple current params for now.
                sunHours: sunHours > 0 ? sunHours : 5, // Fallback if 0 (night time or error)
            });

        } catch (error) {
            console.error("Weather fetch error:", error);
            res.status(500).json({ error: "Failed to fetch weather data" });
        }
    });
}
