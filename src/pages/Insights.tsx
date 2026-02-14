import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import styles from "./Insights.module.css";
import { useSolar } from "../context/SolarContext";
import { fetchWeather } from "../api/client";

export default function Insights() {
  const { avgDailyConsumption } = useSolar();
  const [weather, setWeather] = useState<{
    temperature: number;
    cloudCover: number;
    rainProbability: number;
    sunHours: number;
  } | null>(null);

  useEffect(() => {
    fetchWeather().then(setWeather);
  }, []);

  // Simulated Weekly Data
  const weeklyData = [
    { day: "Mon", consumption: avgDailyConsumption * 0.9, production: avgDailyConsumption * 1.1 },
    { day: "Tue", consumption: avgDailyConsumption * 1.0, production: avgDailyConsumption * 1.2 },
    { day: "Wed", consumption: avgDailyConsumption * 0.8, production: avgDailyConsumption * 0.9 },
    { day: "Thu", consumption: avgDailyConsumption * 1.2, production: avgDailyConsumption * 1.3 },
    { day: "Fri", consumption: avgDailyConsumption * 1.1, production: avgDailyConsumption * 1.1 },
    { day: "Sat", consumption: avgDailyConsumption * 1.3, production: avgDailyConsumption * 1.4 },
    { day: "Sun", consumption: avgDailyConsumption * 1.4, production: avgDailyConsumption * 1.5 },
  ];

  const totalProduction = weeklyData.reduce((acc, curr) => acc + curr.production, 0).toFixed(1);
  const totalConsumption = weeklyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1);

  // Generate Alert
  const getAlert = () => {
    if (!weather) return null;
    if (weather.cloudCover < 30 && weather.sunHours > 6) {
      return {
        type: "goodProduction",
        title: "High Solar Production Expected",
        message: "It's a sunny day! Great time to run heavy appliances like washing machines or charge your EV.",
      };
    } else if (weather.cloudCover > 70 || weather.rainProbability > 50) {
      return {
        type: "lowProduction",
        title: "Low Solar Production",
        message: "Cloudy or rainy conditions detected. Consider conserving energy or delaying heavy usage.",
      };
    }
    return {
      type: "normal",
      title: "Normal Conditions",
      message: "Solar production is average. Standard usage recommended.",
    };
  };

  const alert = getAlert();

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Energy Insights</h2>

      {/* Weather Section */}
      {weather && (
        <div className={styles.weatherSection}>
          <div className={styles.weatherCard}>
            <div>
              <div className={styles.weatherTitle}>Current Weather</div>
              <div className={styles.weatherValue}>{weather.temperature}°C</div>
            </div>
            <div className={styles.weatherSub}>Cloud Cover: {weather.cloudCover}%</div>
          </div>
          <div className={styles.weatherCard} style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 6px -1px rgba(245, 158, 11, 0.5)" }}>
            <div>
              <div className={styles.weatherTitle}>Sun Hours</div>
              <div className={styles.weatherValue}>{weather.sunHours}h</div>
            </div>
            <div className={styles.weatherSub}>Estimated Duration</div>
          </div>
        </div>
      )}

      {/* Smart Alert */}
      {alert && (
        <div className={`${styles.alertSection} ${styles[alert.type] || ""}`}>
          <div className={styles.alertTitle}>{alert.title}</div>
          <div className={styles.alertMessage}>{alert.message}</div>
        </div>
      )}

      <div className={styles.grid}>
        {/* Weekly Comparison */}
        <div className={styles.card}>
          <h3>Weekly Production vs Consumption</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="production" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Production" />
              <Bar dataKey="consumption" fill="#ef4444" radius={[4, 4, 0, 0]} name="Consumption" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Trend */}
        <div className={styles.card}>
          <h3>System Efficiency Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="production"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                name="Efficiency"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.card}>
        <h3>Weekly Summary</h3>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalProduction} kWh</span>
            <span className={styles.statLabel}>Total Production</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalConsumption} kWh</span>
            <span className={styles.statLabel}>Total Consumption</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {((Number(totalProduction) / Number(totalConsumption)) * 100).toFixed(0)}%
            </span>
            <span className={styles.statLabel}>Self-Sufficiency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
