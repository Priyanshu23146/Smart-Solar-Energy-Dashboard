import { useEffect, useState } from "react";
import type { WeatherData, SolarConfig } from "../Logic/types";
import { predictTomorrowPower } from "../Logic/powerPrediction";
import { evaluateRisk } from "../Logic/riskEvaluator";
import EnergyChart from "../components/EnergyChart";
import "./Dashboard.css";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Temporary weather data
  const tomorrowWeather: WeatherData = {
    cloudCover: 75,
    rainProbability: 60,
    temperature: 35,
    sunHours: 4,
  };

  const solarConfig: SolarConfig = {
    panelCapacity: 5,
    batteryCapacity: 10,
    avgDailyConsumption: 18,
  };

  const predictedPower = predictTomorrowPower(tomorrowWeather, solarConfig);

  const riskLevel = evaluateRisk(
    predictedPower,
    solarConfig.avgDailyConsumption,
  );

  return (
    <>
      {/* HERO */}
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

      {/* SUMMARY CARDS */}
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

      {/* CHART */}
      <section className="chart-container">
        <h3 className="chart-title">Energy Distribution (Next 24 Hours)</h3>

        <EnergyChart
          currentConsumption={solarConfig.avgDailyConsumption}
          predictedProduction={predictedPower}
        />
      </section>

      {/* WEATHER */}
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

      {/* RECOMMENDATION */}
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
    </>
  );
}
