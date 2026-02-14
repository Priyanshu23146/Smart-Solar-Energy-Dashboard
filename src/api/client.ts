export const API_URL = "/api";

// Default config to use when backend is unreachable
const DEFAULT_CONFIG = {
    city: "Offline Mode",
    panelCapacity: 5,
    batteryCapacity: 10,
    avgDailyConsumption: 18,
};

// Helper to get headers
function getHeaders() {
    const userStr = localStorage.getItem("solar_user");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (userStr) {
        const user = JSON.parse(userStr);
        headers["x-user-id"] = user.id;
    }
    return headers;
}

export async function loginApi(credentials: unknown) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
    }
    return res.json();
}

export async function signupApi(userData: unknown) {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Signup failed");
    }
    return res.json();
}

export async function fetchConfig() {
    try {
        const res = await fetch(`${API_URL}/config`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.warn("Failed to fetch config, using default:", error);
        return DEFAULT_CONFIG;
    }
}

export async function updateConfig(
    config: Partial<{
        city: string;
        panelCapacity: number;
        batteryCapacity: number;
        avgDailyConsumption: number;
    }>
) {
    try {
        const res = await fetch(`${API_URL}/config`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.error("Failed to update config:", error);
        return config; // Optimistic return
    }
}

export async function fetchAppliances() {
    try {
        const res = await fetch(`${API_URL}/appliances`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.warn("Failed to fetch appliances, returning empty list:", error);
        return [];
    }
}

export async function addAppliance(name: string, power: number) {
    try {
        const res = await fetch(`${API_URL}/appliances`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ name, power }),
        });
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.error("Failed to add appliance:", error);
        // Return a temporary object so UI updates
        return { id: Date.now(), name, power };
    }
}

export async function deleteAppliance(id: number) {
    try {
        await fetch(`${API_URL}/appliances/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
    } catch (error) {
        console.error("Failed to delete appliance:", error);
    }
}

export async function fetchWeather() {
    try {
        const res = await fetch(`${API_URL}/weather`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.warn("Failed to fetch weather, returning default:", error);
        return {
            temperature: 25,
            cloudCover: 10,
            rainProbability: 0,
            sunHours: 8
        };
    }
}




