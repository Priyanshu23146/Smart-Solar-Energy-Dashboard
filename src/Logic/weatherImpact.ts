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

  // Heat effect
  if (weather.temperature > 40) {
    efficiency -= 0.1;
  }

  return Math.max(efficiency, 0.3); // minimum efficiency cap
}
