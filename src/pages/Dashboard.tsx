import { useEffect, useState } from "react";
import { useSolar } from "../context/SolarContext";
import styles from "./Dashboard.module.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import type { WeatherData } from "../logic/types";

export default function Dashboard() {
  const {
    weather,
    city,
    panelCapacity,
    batteryCapacity,
    appliances,
    avgDailyConsumption
  } = useSolar();
  const [time, setTime] = useState(new Date());
  // Initialize realistic battery level based on time of day
  const [batteryLevel, setBatteryLevel] = useState(() => {
    const h = new Date().getHours();
    if (h >= 6 && h < 18) return Math.min(100, 20 + (h - 6) * 6); // Charging during day
    return Math.max(0, 100 - (h >= 18 ? h - 18 : h + 6) * 5); // Draining at night
  });

  const [isCharging, setIsCharging] = useState(false);

  // Safe access to weather data (moved up for use in effect)
  const weatherData: WeatherData = {
    temperature: weather?.current?.temperature ?? 25,
    cloudCover: weather?.current?.cloudCover ?? 20,
    rainProbability: weather?.current?.rainProbability ?? 0,
    sunHours: weather?.current?.sunHours ?? 6,
    humidity: weather?.current?.humidity ?? 50,
    windSpeed: weather?.current?.windSpeed ?? 10,
    predictedProduction: weather?.current?.predictedProduction ?? 0
  };

  // Financial & Environmental Constants
  const ELECTRICITY_RATE = 8; // ₹ per kWh
  const CO2_FACTOR = 0.82; // kg CO2 per kWh

  // Calculate Savings
  // Calculate Savings
  const production = weatherData.predictedProduction ?? 0;
  const moneySaved = (production * ELECTRICITY_RATE).toFixed(1);
  const co2Saved = (production * CO2_FACTOR).toFixed(1);

  // Smart Battery Simulation
  useEffect(() => {
    const hours = time.getHours();
    const isDay = hours >= 6 && hours < 18; // Simple day/night check for solar

    // 1. Calculate Solar Production (kW)
    // If night, 0. If day, capacity * (1 - cloudCover)
    const production = isDay ? panelCapacity * (1 - (weatherData.cloudCover / 100)) : 0;

    // 2. Calculate Consumption (kW)
    // Sum of all appliances (assuming 50% duty cycle for realistic varying load, or full load)
    // appliances.power is likely in Watts, convert to kW
    const consumptionWatts = appliances.reduce((sum, app) => sum + app.power, 0);
    const consumption = consumptionWatts / 1000;

    // 3. Net Power Flow (kW)
    const netPower = production - consumption;
    setIsCharging(netPower > 0);

    // 4. Update Battery Level
    // Simulation step: 1 second = 5 real minutes of activity (speed up factor)
    // Battery Capacity in kWh.
    // Change (kWh) = Net Power (kW) * (5/60) hours
    // Change (%) = (Change kWh / Total Capacity kWh) * 100

    setBatteryLevel(prev => {
      const timeFactor = 5 / 60; // 5 minutes step
      const energyChange = netPower * timeFactor;
      const percentChange = (energyChange / (batteryCapacity || 10)) * 100;

      const newValue = prev + percentChange;
      return Math.min(100, Math.max(0, newValue));
    });

  }, [time, panelCapacity, batteryCapacity, appliances, weatherData.cloudCover]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  // Calculate Usage Risk
  const prediction = weatherData.predictedProduction ?? 0;
  const riskLevel = prediction < avgDailyConsumption * 0.5 ? "High" :
    prediction < avgDailyConsumption ? "Medium" : "Low";

  const riskColor = riskLevel === "High" ? styles.error :
    riskLevel === "Medium" ? styles.warning : styles.success;



  // Use data from context if available, else mock
  const chartData = weather?.today?.map((dayPoint: any, index: number) => ({
    name: dayPoint.time,
    Today: dayPoint.production,
    Tomorrow: weather.tomorrow?.[index]?.production || 0
  })) || [
      { name: "06:00", Today: 0, Tomorrow: 0 },
      { name: "09:00", Today: 12, Tomorrow: 10 },
      { name: "12:00", Today: 25, Tomorrow: 22 },
      { name: "15:00", Today: 18, Tomorrow: 20 },
      { name: "18:00", Today: 5, Tomorrow: 6 },
    ];

  // Prepare Data for Pie Chart
  const applianceData = appliances.length > 0
    ? appliances.map(app => ({ name: app.name, value: app.power }))
    : [
      { name: "AC", value: 1500 },
      { name: "Fridge", value: 200 },
      { name: "Lights", value: 100 },
      { name: "Fans", value: 150 },
      { name: "TV", value: 120 }
    ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];





  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Hello, {city || "Solar User"}</h1>
        <p>Here's your energy overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div className={styles.timeDisplay}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.icon}>⚡</div>
          <div>
            <div className={styles.label}>Predicted Generation</div>
            <div className={`${styles.number} ${styles.success}`}>
              {weather?.current?.predictedProduction || 0} kWh
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.icon}>🔋</div>
          <div>
            <div className={styles.label}>
              Battery Status
              <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                {isCharging ? '⚡' : '🔻'}
              </span>
            </div>
            <div className={styles.number}>
              {Math.round(batteryLevel)}%
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.icon}>⚠️</div>
          <div>
            <div className={styles.label}>Usage Risk</div>
            <div className={`${styles.number} ${riskColor}`}>{riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.icon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>💰</div>
          <div>
            <div className={styles.label}>Money Saved</div>
            <div className={styles.number} style={{ color: '#10b981' }}>
              ₹{moneySaved}
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.icon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🌳</div>
          <div>
            <div className={styles.label}>CO₂ Reduced</div>
            <div className={styles.number} style={{ color: '#3b82f6' }}>
              {co2Saved} <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>kg</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Chart Section */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Solar Production Forecast (Today vs Tomorrow)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTomorrow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Today"
                stroke="var(--primary)"
                fillOpacity={1}
                fill="url(#colorToday)"
              />
              <Area
                type="monotone"
                dataKey="Tomorrow"
                stroke="var(--warning)"
                fillOpacity={1}
                fill="url(#colorTomorrow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weather Card */}
        <div className={styles.weatherCard}>
          <div className={styles.weatherHeader}>
            <h3>Weather ({city})</h3>
            <span className={styles.weatherSub}>Live Updates</span>
          </div>

          <div className={styles.weatherMain}>
            <div className={styles.weatherIcon}>
              {weatherData.rainProbability > 50 ? '🌧️' :
                weatherData.cloudCover > 50 ? '☁️' : '☀️'}
            </div>
            <div>
              <div className={styles.weatherTemp}>{weatherData.temperature}°C</div>
              <div className={styles.weatherCondition}>
                {weatherData.rainProbability > 50 ? 'Rainy' :
                  weatherData.cloudCover > 50 ? 'Cloudy' : 'Sunny'}
              </div>
            </div>
          </div>

          <div className={styles.weatherGrid}>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>☀️ Sun Hours</span>
              <span className={styles.weatherValue}>{weatherData.sunHours} h</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>💧 Humidity</span>
              <span className={styles.weatherValue}>{weatherData.humidity}%</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>☁️ Clouds</span>
              <span className={styles.weatherValue}>{weatherData.cloudCover}%</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>💨 Wind</span>
              <span className={styles.weatherValue}>{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>


        {/* Appliance Breakdown Section */}
        <div className={styles.applianceContainer}>
          <h3 className={styles.chartTitle}>Appliance Energy Breakdown</h3>
          <div className={styles.pieChartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={true}
                  label={({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius * 1.4;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {applianceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className={styles.recommendationSection}>
        <div className={styles.recommendationCard}>
          <h3>💡 Smart Alerts</h3>
          <ul>
            <li>High solar production expected today. Run heavy appliances now.</li>
            <li>
              Battery is {Math.round(batteryLevel)}% {isCharging ? "charging" : "draining"}.
              {batteryLevel < 20 ? " Critical low!" : " Healthy."}
            </li>
          </ul>
        </div>
      </div>
    </div >
  );
}
