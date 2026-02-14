import styles from "./SmartAlerts.module.css";

interface SmartAlertsProps {
    predictedPower: number;
    avgConsumption: number;
}

export default function SmartAlerts({ predictedPower, avgConsumption }: SmartAlertsProps) {
    const surplus = predictedPower - avgConsumption;
    const isSurplus = surplus > 0;

    // Simple logic for recommendations
    const recommendations = isSurplus
        ? [
            "Run high-power appliances (Washing Machine, AC) now.",
            "Charge your EV or backup batteries.",
            "Great day for solar production!",
        ]
        : [
            "Conserve energy: Avoid using Heater or AC.",
            "Shift heavy usage to tomorrow if possible.",
            "Battery levels might drop faster today.",
        ];

    return (
        <div className={`${styles.container} ${isSurplus ? styles.surplus : styles.deficit}`}>
            <h3 className={styles.title}>
                {isSurplus ? "🌱 High Solar Production Alert" : "⚠️ Low Solar Production Alert"}
            </h3>
            <div className={styles.content}>
                <p className={styles.status}>
                    Predicted Surplus: <strong>{isSurplus ? `+${surplus.toFixed(1)}` : surplus.toFixed(1)} kWh</strong>
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
