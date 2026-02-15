import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SolarProvider } from "./context/SolarContext";
import Navbar from "./components/Navbar";
import GridSimulation from "./components/GridSimulation";
import Dashboard from "./pages/Dashboard";
import Appliances from "./pages/Appliances";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./index.css";

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SolarProvider>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes with Layout (Navbar + Simulation) */}
            <Route element={
              <ProtectedRoute />
            }>
              <Route element={
                <>
                  <Navbar />
                  <main className="content">
                    <Outlet />
                  </main>
                  <GridSimulation />
                </>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/appliances" element={<Appliances />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </SolarProvider>
    </AuthProvider>
  );
}

export default App;
