import { useEffect, useState } from "react";
import { predictTomorrowPower } from "../Logic/powerPrediction";
import { evaluateRisk } from "../Logic/riskEvaluator";
import EnergyChart from "../components/EnergyChart";
import SmartAlerts from "../components/SmartAlerts"; // Import SmartAlerts
import { useSolar } from "../context/SolarContext";
import styles from "./Dashboard.module.css";
import type { WeatherData, SolarConfig } from "../Logic/types";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get data from context
  const { city, panelCapacity, batteryCapacity, avgDailyConsumption, weather } = useSolar();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use real weather if available, else fallback to average
  const weatherData: WeatherData = weather ? {
    cloudCover: weather.cloudCover,
    rainProbability: weather.rainProbability,
    temperature: weather.temperature,
    sunHours: weather.sunHours
  } : {
    cloudCover: 20,
    rainProbability: 10,
    temperature: 25,
    sunHours: 6,
  };

  const solarConfig: SolarConfig = {
    panelCapacity,
    batteryCapacity,
    avgDailyConsumption,
  };

  const predictedPower = predictTomorrowPower(weatherData, solarConfig);

  const riskLevel = evaluateRisk(
    predictedPower,
    solarConfig.avgDailyConsumption,
  );

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Smart Solar Energy Dashboard</h1>
        <p>Real-time energy monitoring and predictions for <strong>{city}</strong></p>
        <div className={styles.timeDisplay}>
          {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
        </div>
      </section>

      {/* SMART ALERTS */}
      <SmartAlerts
        predictedPower={predictedPower}
        avgConsumption={avgDailyConsumption}
      />

      {/* SUMMARY CARDS */}
      <section className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.icon}>⚡</div>
          <div>
            <div className={styles.label}>Predicted Power</div>
            <div className={styles.number}>{predictedPower.toFixed(2)} kWh</div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.icon}>🔋</div>
          <div>
            <div className={styles.label}>Battery Capacity</div>
            <div className={styles.number}>{solarConfig.batteryCapacity} kWh</div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.icon}>📊</div>
          <div>
            <div className={styles.label}>Usage Risk</div>
            <div
              className={`${styles.number} ${riskLevel === "High"
                ? styles.danger
                : riskLevel === "Medium"
                  ? styles.warning
                  : styles.success
                }`}
            >
              {riskLevel}
            </div>
          </div>
        </div>
      </section>

      {/* CHART */}
      <section className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Energy Distribution (Next 24 Hours)</h3>

        <EnergyChart
          currentConsumption={solarConfig.avgDailyConsumption}
          predictedProduction={predictedPower}
        />
      </section>

      {/* WEATHER */}
      <section className={styles.weatherSection}>
        <div className={styles.weatherCard}>
          <h3>🌦️ Weather Forecast</h3>
          <ul>
            <li>Cloud Cover: {weatherData.cloudCover}%</li>
            <li>Rain Probability: {weatherData.rainProbability}%</li>
            <li>Temperature: {weatherData.temperature}°C</li>
            <li>Sun Hours: {weatherData.sunHours} hrs</li>
          </ul>
        </div>
      </section>
    </>
  );
}
