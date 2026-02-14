import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Appliances from "./pages/Appliances";
import Settings from "./pages/Settings";
import DarkModeButton from "./components/darkMode";
import "./index.css";

function App() {
  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">🌞 SolarSmart</div>

        <nav className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/insights">Insights</NavLink>
          <NavLink to="/appliances">Appliances</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>

        <DarkModeButton />
      </header>

      {/* PAGE CONTENT */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/appliances" element={<Appliances />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <h4>SolarSmart</h4>
          <p>Smart renewable energy management system.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <p>Dashboard</p>
          <p>Insights</p>
          <p>Contact</p>
        </div>

        <div>
          <h4>Contact</h4>
          <p>Email: support@solarsmart.com</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
