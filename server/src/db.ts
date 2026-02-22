import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IS_VERCEL = process.env.VERCEL === "1";
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

console.log(`[DB] Environment: ${IS_VERCEL ? "Vercel" : "Local"}`);
console.log(`[DB] Using file: ${DB_FILE}`);

export interface Appliance {
    id: number;
    name: string;
    power: number; // in kWh or W, but for this app we treat as unitless or kWh
}

export interface User {
    id: string;
    username: string;
    password?: string; // In a real app, hash this!
    city: string; // Keep for weather API
    country: string;
    state: string;
    pincode: string;
    panelCapacity: number;
    batteryCapacity: number;
    avgDailyConsumption: number;
    appliances: Appliance[];
}

export interface Database {
    users: User[];
}

// Lazy Init function
function ensureDb() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            console.log(`[DB] Directory missing, creating: ${DATA_DIR}`);
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(DB_FILE)) {
            console.log(`[DB] File missing, creating: ${DB_FILE}`);
            fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
        } else {
            // Test if we can read it
            const stats = fs.statSync(DB_FILE);
            if (stats.size === 0) {
                console.warn("[DB] File is empty, resetting...");
                fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
            }
        }
    } catch (err) {
        console.error("[DB] Initialization error (CRITICAL):", err);
        // Throwing here might reveal more in Vercel logs than just a generic 500
        throw new Error(`Database Initialization Failed: ${err}`);
    }
}

export function readDb(): Database {
    ensureDb();
    try {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        return { users: [] };
    }
}

export function writeDb(data: Database) {
    ensureDb();
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("[DB] Write error:", err);
    }
}
