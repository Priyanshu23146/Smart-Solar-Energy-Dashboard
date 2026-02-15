import styles from "./SmartAlerts.module.css";

interface SmartAlertsProps {
    predictedPower: number;
    avgConsumption: number;
}

export default function SmartAlerts({ predictedPower, avgConsumption }: SmartAlertsProps) {
    const surplus = predictedPower - avgConsumption;
    const isSurplus = surplus > 0;
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour <= 18;

    // Smart recommendations based on surplus and time
    const recommendations = [];

    if (isSurplus) {
        recommendations.push("High solar production expected tomorrow!");
        if (isDaytime) {
            recommendations.push("Perfect time to run washing machines or dishwashers.");
            recommendations.push("Charge electric vehicles now to utilize excess power.");
        } else {
            recommendations.push("Plan to run heavy appliances tomorrow afternoon.");
        }
    } else {
        recommendations.push("Low solar production forecast.");
        recommendations.push("Conserve energy where possible.");
        if (currentHour >= 17) {
            recommendations.push("Battery levels may be critical tonight - minimize usage.");
        }
    }

    return (
        <div className={`${styles.container} ${isSurplus ? styles.surplus : styles.deficit}`}>
            <h3 className={styles.title}>
                {isSurplus ? "🌱 high Efficiency Alert" : "⚠️ Low Efficiency Alert"}
            </h3>
            <div className={styles.content}>
                <p className={styles.status}>
                    Predicted {isSurplus ? "Surplus" : "Deficit"}:
                    <strong> {isSurplus ? "+" : ""}{surplus.toFixed(1)} kWh</strong>
                </p>
                <ul className={styles.list}>
                    {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
