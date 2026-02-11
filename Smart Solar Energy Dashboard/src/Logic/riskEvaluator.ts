export function evaluateRisk(
  predictedPower: number,
  avgConsumption: number,
): "Low" | "Medium" | "High" {
  if (predictedPower >= avgConsumption) {
    return "Low";
  } else if (predictedPower >= avgConsumption * 0.7) {
    return "Medium";
  } else {
    return "High";
  }
}
