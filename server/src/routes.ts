import type { Router, Request, Response, NextFunction } from "express";
import { readDb, writeDb, User } from "./db";
import { predictEnergy } from "./logic/energyPredict";
import path from "path";



export function setupRoutes(app: Router) {

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
            country: user.country || "",
            state: user.state || "",
            pincode: user.pincode || "",
            panelCapacity: user.panelCapacity,
            batteryCapacity: user.batteryCapacity,
            avgDailyConsumption: user.avgDailyConsumption,
        });
    });

    // POST Config
    app.post("/config", (req: Request, res: Response) => {
        const user = getUser(req, res);
        if (!user) return;

        const { city, country, state, pincode, panelCapacity, batteryCapacity, avgDailyConsumption } =
            req.body;

        const db = readDb();
        const userIndex = db.users.findIndex((u) => u.id === user.id);
        if (userIndex === -1) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const currentUser = db.users[userIndex];

        if (city !== undefined) currentUser.city = city;
        if (country !== undefined) currentUser.country = country;
        if (state !== undefined) currentUser.state = state;
        if (pincode !== undefined) currentUser.pincode = pincode;
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
            const apiKey = process.env.TOMORROW_IO_API_KEY;

            if (!apiKey) {
                console.warn("TOMORROW_IO_API_KEY not set, using fallback data");
                // Return dummy comparison data
                res.json({
                    current: {
                        temperature: 25,
                        cloudCover: 20,
                        rainProbability: 10,
                        sunHours: 12,
                        humidity: 50,
                        windSpeed: 10,
                        predictedProduction: 15.5
                    },
                    today: Array(24).fill(0).map((_, i) => ({ time: `${i}:00`, production: Math.random() * 5 })),
                    tomorrow: Array(24).fill(0).map((_, i) => ({ time: `${i}:00`, production: Math.random() * 5 }))
                });
                return;
            }

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

            // 2. Tomorrow.io Timeline API (Forecast for 48 hours)
            // startTime = now, endTime = now + 48h, user local time ideally, but UTC for now
            const now = new Date();
            const endTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

            const tomorrowUrl = `https://api.tomorrow.io/v4/timelines?location=${latitude},${longitude}&fields=temperature,cloudCover,precipitationProbability,humidity,windSpeed,sunriseTime,sunsetTime&timesteps=1h&startTime=${now.toISOString()}&endTime=${endTime.toISOString()}&units=metric&apikey=${apiKey}`;

            const weatherRes = await fetch(tomorrowUrl);

            if (!weatherRes.ok) {
                throw new Error(`Tomorrow.io API error: ${weatherRes.status}`);
            }

            const weatherData: any = await weatherRes.json();
            const intervals = weatherData.data?.timelines?.[0]?.intervals;

            if (!intervals || intervals.length === 0) {
                throw new Error("Invalid response from Tomorrow.io API");
            }

            // Current Weather (first interval)
            const currentVals = intervals[0].values;

            // Prepare Batch Data for C++
            // Format: "temp1,cloud1,sun1;temp2,cloud2,sun2;..."
            let csvInput = "";

            const processedIntervals = intervals.slice(0, 48).map((interval: any) => {
                const vals = interval.values;
                const time = new Date(interval.startTime);

                // Determine if sun is up (simplified check against sunrise/sunset strings)
                let isSunUp = 0;
                if (vals.sunriseTime && vals.sunsetTime) {
                    const sunrise = new Date(vals.sunriseTime).getTime();
                    const sunset = new Date(vals.sunsetTime).getTime();
                    const currentTime = time.getTime();
                    if (currentTime >= sunrise && currentTime <= sunset) {
                        isSunUp = 1;
                    }
                }

                // Append to CSV
                csvInput += `${vals.temperature || 25},${vals.cloudCover || 0},${isSunUp};`;

                return {
                    time,
                    values: vals,
                    isSunUp
                };
            });

            // 3. TS Batch Prediction (Replaces C++ Binary)
            let predictions: number[] = [];
            try {
                predictions = predictEnergy(user.panelCapacity, csvInput);
            } catch (err) {
                console.error("Prediction Logic Failed:", err);
                predictions = new Array(processedIntervals.length).fill(0);
            }

            // 4. Structure Data for Triple Output: Current, Today, Tomorrow
            // Assume "Today" = first 24 hours from response (simulated "today" from current moment)
            // "Tomorrow" = next 24 hours

            const todayData = processedIntervals.slice(0, 24).map((item: any, i: number) => ({
                time: item.time.getHours() + ":00",
                production: predictions[i] || 0
            }));

            const tomorrowData = processedIntervals.slice(24, 48).map((item: any, i: number) => ({
                time: item.time.getHours() + ":00", // Will align with today's hours if standard 24h
                production: predictions[i + 24] || 0
            }));

            // Calculate total today predicted
            const totalPredicted = predictions.slice(0, 24).reduce((a, b) => a + b, 0);

            // Calculate Sun Hours for current day summary
            let sunHours = 0;
            if (currentVals.sunriseTime && currentVals.sunsetTime) {
                const sunrise = new Date(currentVals.sunriseTime);
                const sunset = new Date(currentVals.sunsetTime);
                sunHours = Math.max(0, (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60));
            }

            res.json({
                current: {
                    temperature: Math.round(currentVals.temperature || 25),
                    cloudCover: Math.round(currentVals.cloudCover || 20),
                    rainProbability: Math.round(currentVals.precipitationProbability || 0),
                    sunHours: Math.round(sunHours * 10) / 10,
                    humidity: Math.round(currentVals.humidity || 50),
                    windSpeed: Math.round(currentVals.windSpeed || 10),
                    predictedProduction: Math.round(totalPredicted * 10) / 10
                },
                today: todayData,
                tomorrow: tomorrowData
            });

        } catch (error: any) {
            console.error("Weather fetch error details:", error);
            // Return fallback data instead of 500 error to keep app running
            res.json({
                current: {
                    temperature: 25,
                    cloudCover: 20,
                    rainProbability: 10,
                    sunHours: 12, // Default
                    humidity: 50,
                    windSpeed: 10,
                    predictedProduction: 0
                },
                today: [],
                tomorrow: []
            });
        }
    });
}
