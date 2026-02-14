import type { WeatherData } from "./types.ts";

export function calculateWeatherImpact(weather: WeatherData): number {
  let efficiency = 1;

  // Cloud effect
  if (weather.cloudCover > 70) {
    efficiency -= 0.4;
  } else if (weather.cloudCover > 40) {
    efficiency -= 0.2;
  }

  // Rain effect
  if (weather.rainProbability > 60) {
    efficiency -= 0.2;
  }

  // Heat effect (approx -0.4% per degree above 25C)
  if (weather.temperature > 25) {
    const heatLoss = (weather.temperature - 25) * 0.004;
    efficiency -= heatLoss;
  }

  return Math.max(efficiency, 0.3); // minimum efficiency cap
}
