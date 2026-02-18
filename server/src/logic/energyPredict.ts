export interface HourlyInput {
    temperature: number;
    cloudCover: number;
    sunHours: number; // effectively "is sun up?" factor or partial hour
}

const BASE_EFFICIENCY = 0.18;
const TEMP_COEFFICIENT = -0.004;
const REF_TEMP = 25.0;
const SYSTEM_LOSS_FACTOR = 0.14;

export function predictEnergy(panelCapacity: number, csvData: string): number[] {
    const predictions: number[] = [];
    const hourGroups = csvData.split(';');

    for (const hourData of hourGroups) {
        if (!hourData.trim()) continue;

        const values = hourData.split(',');
        if (values.length < 3) {
            predictions.push(0.0);
            continue;
        }

        const temperature = parseFloat(values[0]);
        const cloudCover = parseFloat(values[1]);
        const sunHours = parseFloat(values[2]);

        // 1. Temperature Efficiency Loss
        // If sun is up (sunHours > 0), add 25 to ambient temp to get cell temp (simplified model)
        const cellTemp = temperature + (sunHours > 0 ? 25 : 0);
        const tempDifference = cellTemp - REF_TEMP;
        const efficiencyLoss = tempDifference * TEMP_COEFFICIENT;

        // Calculate current efficiency (clamped for realism, though existing C++ logic
        // used clamps 0.05 and 0.25 but didn't use the result for production calc directly,
        // it used efficiencyLoss in the final formula. We will mirror the C++ logic exactly).
        let currentEfficiency = BASE_EFFICIENCY * (1 + efficiencyLoss);
        if (currentEfficiency < 0.05) currentEfficiency = 0.05;
        if (currentEfficiency > 0.25) currentEfficiency = 0.25;

        // Note: The C++ code calculated `currentEfficiency` but then used `efficiencyLoss`
        // in the final production formula:
        // production = panelCapacity * sunHours * cloudFactor * (1.0 + efficiencyLoss) * (1.0 - SYSTEM_LOSS_FACTOR);
        // We will follow that exact logic to ensure output consistency.

        // 2. Cloud Factor
        const cloudFactor = 1.0 - (cloudCover / 100.0 * 0.8);

        // 3. Production
        let production = panelCapacity * sunHours * cloudFactor * (1.0 + efficiencyLoss) * (1.0 - SYSTEM_LOSS_FACTOR);

        if (production < 0) production = 0;
        predictions.push(production);
    }

    return predictions;
}
