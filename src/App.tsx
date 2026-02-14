import { type ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Appliances from "./pages/Appliances";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SolarProvider } from "./context/SolarContext";
import "./index.css";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <SolarProvider key={user?.id}>
      <div className="app">
        {isAuthenticated && <Navbar />}

        <main className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appliances"
              element={
                <ProtectedRoute>
                  <Appliances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {isAuthenticated && (
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
        )}
      </div>
    </SolarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
