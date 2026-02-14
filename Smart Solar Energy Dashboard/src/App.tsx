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
    <div className="container">
      <header className="header">
        <h1>🌞 Smart Solar Energy Dashboard</h1>
        <p>Weather-based solar power prediction & planning</p>
        <p>
          {currentTime.toLocaleDateString()} |{" "}
          {currentTime.toLocaleTimeString()}
        </p>
        {/* centralized dark-mode button handles storage and body class */}
        <DarkModeButton />
      </header>

      <div className="grid">
        <div className="card">
          <h3>Tomorrow Prediction</h3>
          <p className="value">{predictedPower} kWh</p>
        </div>

        <div className="card">
          <h3>Risk Level</h3>
          <p
            className={`value ${
              riskLevel === "High"
                ? "danger"
                : riskLevel === "Medium"
                  ? "warning"
                  : ""
            }`}
          >
            {riskLevel}
          </p>
        </div>
      </div>
      <EnergyChart
        currentConsumption={solarConfig.avgDailyConsumption}
        predictedProduction={predictedPower}
      />

      <div className="card full">
        <h3>🌦️ Tomorrow's Weather</h3>
        <ul>
          <li>Cloud Cover: {tomorrowWeather.cloudCover}%</li>
          <li>Rain Probability: {tomorrowWeather.rainProbability}%</li>
          <li>Temperature: {tomorrowWeather.temperature}°C</li>
          <li>Sun Hours: {tomorrowWeather.sunHours} hrs</li>
        </ul>
      </div>

      {riskLevel === "High" && (
        <div className="card full alert">
          <h3>⚠️ Smart Recommendation</h3>
          <ul>
            <li>🔋 Charge batteries today</li>
            <li>⚡ Run heavy appliances in advance</li>
            <li>❄️ Reduce usage tomorrow</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
