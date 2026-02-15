import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { logout, user, theme, toggleTheme } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path ? "active" : "";

    return (
        <nav className="navbar">
            <div className="logo">
                <span>☀️</span> SolarDash
            </div>

            <div className="nav-links">
                <Link to="/" className={isActive("/")}>Dashboard</Link>
                <Link to="/insights" className={isActive("/insights")}>Insights</Link>
                <Link to="/appliances" className={isActive("/appliances")}>Appliances</Link>
                <Link to="/settings" className={isActive("/settings")}>Settings</Link>
            </div>

            <div className="nav-actions">
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Hello, {user?.username}
                </span>

                <button onClick={toggleTheme} className="btn-icon" title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <button onClick={logout} className="btn-logout">
                    Logout
                </button>
            </div>
        </nav>
    );
}
