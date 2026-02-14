import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface Appliance {
    id: number;
    name: string;
    power: number; // in kWh or W, but for this app we treat as unitless or kWh
}

export interface User {
    id: string;
    username: string;
    password?: string; // In a real app, hash this!
    city: string;
    panelCapacity: number;
    batteryCapacity: number;
    avgDailyConsumption: number;
    appliances: Appliance[];
}

export interface Database {
    users: User[];
}

// Ensure DB exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

export function readDb(): Database {
    try {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        // If file is empty or corrupt, return default
        return { users: [] };
    }
}

export function writeDb(data: Database) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
