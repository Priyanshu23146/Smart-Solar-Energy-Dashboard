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

// Helper to safely parse JSON or return original text on error
async function safeJson(res: Response) {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        // If not JSON, return the raw text as an error
        console.error("Failed to parse JSON response:", text);
        return { error: text || "Invalid response from server" };
    }
}

export async function loginApi(credentials: unknown) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    const data = await safeJson(res);
    if (!res.ok) {
        throw new Error(data.error || "Login failed");
    }
    return data;
}

export async function signupApi(userData: unknown) {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    const data = await safeJson(res);
    if (!res.ok) {
        throw new Error(data.error || "Signup failed");
    }
    return data;
}

export async function fetchConfig() {
    try {
        const res = await fetch(`${API_URL}/config`, { headers: getHeaders() });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || "Network response was not ok");
        return data;
    } catch (error) {
        console.warn("Failed to fetch config, using default:", error);
        return DEFAULT_CONFIG;
    }
}

export async function updateConfig(
    config: Partial<{
        city: string;
        country: string;
        state: string;
        pincode: string;
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
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || "Network response was not ok");
        return data;
    } catch (error) {
        console.error("Failed to update config:", error);
        return config; // Optimistic return
    }
}

export async function fetchAppliances() {
    try {
        const res = await fetch(`${API_URL}/appliances`, { headers: getHeaders() });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || "Network response was not ok");
        return data;
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
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || "Network response was not ok");
        return data;
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
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || "Network response was not ok");
        return data;
    } catch (error) {
        console.warn("Failed to fetch weather, returning default:", error);
        return {
            temperature: 25,
            cloudCover: 10,
            rainProbability: 0,
            sunHours: 8,
            humidity: 50,
            windSpeed: 10,
            predictedProduction: 12.5
        };
    }
}




