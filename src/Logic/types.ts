export interface WeatherData {
  cloudCover: number; // %
  rainProbability: number; // %
  temperature: number; // °C
  sunHours: number; // hours
}

export interface SolarConfig {
  panelCapacity: number; // kW
  batteryCapacity: number; // kWh
  avgDailyConsumption: number; // kWh
}
