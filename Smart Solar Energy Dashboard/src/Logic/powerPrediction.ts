import type { WeatherData, SolarConfig } from "./types";
import { calculateWeatherImpact } from "./weatherImpact";

export function predictTomorrowPower(
  weather: WeatherData,
  config: SolarConfig,
): number {
  const impactFactor = calculateWeatherImpact(weather);

  const predictedPower = config.panelCapacity * weather.sunHours * impactFactor;

  return Number(predictedPower.toFixed(2));
}
