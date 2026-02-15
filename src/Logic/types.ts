export interface WeatherData {
  cloudCover: number; // %
  rainProbability: number; // mm (renamed in UI, kept key for compatibility)
  temperature: number; // °C
  sunHours: number; // hours
  humidity?: number; // %
  windSpeed?: number; // km/h
}

export interface SolarConfig {
  panelCapacity: number; // kW
  batteryCapacity: number; // kWh
  avgDailyConsumption: number; // kWh
}
