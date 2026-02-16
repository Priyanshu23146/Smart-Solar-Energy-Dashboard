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
    loading: boolean;
    theme: "light" | "dark";
    toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for user and theme
        const storedUser = localStorage.getItem("solar_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem("solar_user");
            }
        }

        const storedTheme = localStorage.getItem("solar_theme") as "light" | "dark";
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute("data-theme", storedTheme);
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
        }

        setLoading(false);
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
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading, theme, toggleTheme }}>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    background: 'var(--background)',
                    color: 'var(--text-main)'
                }}>
                    Loading...
                </div>
            ) : children}
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
