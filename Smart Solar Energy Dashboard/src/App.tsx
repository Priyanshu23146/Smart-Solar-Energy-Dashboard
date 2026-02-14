import "./index.css";
import type { WeatherData, SolarConfig } from "./Logic/types.ts";
import { predictTomorrowPower } from "./Logic/powerPrediction";
import { evaluateRisk } from "./Logic/riskEvaluator.ts";
import { useEffect, useState } from "react";
import EnergyChart from "./components/EnergyChart.tsx";
import DarkModeButton from "./components/darkMode";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  // dark mode state is managed internally by <DarkModeButton />

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Dummy weather data (Day 2 version)
  const tomorrowWeather: WeatherData = {
    cloudCover: 75,
    rainProbability: 60,
    temperature: 35,
    sunHours: 4,
  };

  const solarConfig: SolarConfig = {
    panelCapacity: 5, // 5 kW system
    batteryCapacity: 10,
    avgDailyConsumption: 18,
  };

  const predictedPower = predictTomorrowPower(tomorrowWeather, solarConfig);

  const riskLevel = evaluateRisk(
    predictedPower,
    solarConfig.avgDailyConsumption,
  );

  return (
    <div className="app">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="logo">🌞 SolarSmart</div>

        <nav className="nav-links">
          <a href="#">Dashboard</a>
          <a href="#">Insights</a>
          <a href="#">Appliances</a>
          <a href="#">Settings</a>
        </nav>

        <DarkModeButton />
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <h1>Smart Solar Energy Planning System</h1>
        <p>
          Predict tomorrow’s solar output and optimize your appliance usage
          intelligently.
        </p>
        <div className="time-display">
          {currentTime.toLocaleDateString()} •{" "}
          {currentTime.toLocaleTimeString()}
        </div>
      </section>

      {/* ================= SUMMARY CARDS ================= */}
      <section className="summary-cards">
        <div className="summary-card">
          <div className="icon">⚡</div>
          <div>
            <div className="label">Predicted Power</div>
            <div className="number">{predictedPower} kWh</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon">🔋</div>
          <div>
            <div className="label">Battery Capacity</div>
            <div className="number">{solarConfig.batteryCapacity} kWh</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon">📊</div>
          <div>
            <div className="label">Usage Risk</div>
            <div
              className={`number ${
                riskLevel === "High"
                  ? "danger"
                  : riskLevel === "Medium"
                    ? "warning"
                    : "success"
              }`}
            >
              {riskLevel}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CHART SECTION ================= */}
      <section className="chart-container">
        <h3 className="chart-title">Energy Distribution (Next 24 Hours)</h3>

        <EnergyChart
          currentConsumption={solarConfig.avgDailyConsumption}
          predictedProduction={predictedPower}
        />
      </section>

      {/* ================= WEATHER SECTION ================= */}
      <section className="weather-section">
        <div className="weather-card">
          <h3>🌦️ Tomorrow's Weather</h3>
          <ul>
            <li>Cloud Cover: {tomorrowWeather.cloudCover}%</li>
            <li>Rain Probability: {tomorrowWeather.rainProbability}%</li>
            <li>Temperature: {tomorrowWeather.temperature}°C</li>
            <li>Sun Hours: {tomorrowWeather.sunHours} hrs</li>
          </ul>
        </div>
      </section>

      {/* ================= RECOMMENDATION ================= */}
      {riskLevel === "High" && (
        <section className="recommendation-section">
          <div className="recommendation-card">
            <h3>⚠ Smart Recommendation</h3>
            <p>Tomorrow’s generation may not cover your full usage.</p>
            <ul>
              <li>🔋 Charge batteries fully today</li>
              <li>⚡ Avoid heavy appliances</li>
              <li>🌧 Weather impact is significant</li>
            </ul>
          </div>
        </section>
      )}

      {/* ================= FOOTER ================= */}
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
