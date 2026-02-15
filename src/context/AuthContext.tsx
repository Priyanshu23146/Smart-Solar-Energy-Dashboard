import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
    id: string;
    username: string;
    city: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    theme: "light" | "dark";
    toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        // Check localStorage for user and theme
        const storedUser = localStorage.getItem("solar_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const storedTheme = localStorage.getItem("solar_theme") as "light" | "dark";
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute("data-theme", storedTheme);
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("solar_theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("solar_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("solar_user");
        window.location.href = "/login"; // Force redirect
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
