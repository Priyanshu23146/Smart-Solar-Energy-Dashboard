import { useState, useEffect } from "react";
import { useSolar } from "../context/SolarContext";
import styles from "./Settings.module.css";

export default function Settings() {
  const {
    city,
    panelCapacity,
    batteryCapacity,
    avgDailyConsumption,
    setCity,
    setPanelCapacity,
    setBatteryCapacity,
    setAvgDailyConsumption,
  } = useSolar();

  const [formData, setFormData] = useState({
    city: "",
    panelCapacity: 0,
    batteryCapacity: 0,
    avgDailyConsumption: 0,
  });

  const [saved, setSaved] = useState(false);

  // Sync state with context on load
  useEffect(() => {
    setFormData({
      city,
      panelCapacity,
      batteryCapacity,
      avgDailyConsumption,
    });
  }, [city, panelCapacity, batteryCapacity, avgDailyConsumption]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "city" ? value : Number(value),
    }));
  }

  function handleSave() {
    setCity(formData.city);
    setPanelCapacity(formData.panelCapacity);
    setBatteryCapacity(formData.batteryCapacity);
    setAvgDailyConsumption(formData.avgDailyConsumption);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>System Settings</h2>

      {saved && (
        <div className={styles.successMessage}>Settings saved successfully!</div>
      )}

      <div className={styles.panel}>
        <h3 className={styles.sectionTitle}>Solar Configuration</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Location (City)</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Solar Panel Capacity (kW)</label>
          <input
            type="number"
            name="panelCapacity"
            value={formData.panelCapacity}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Battery Storage (kWh)</label>
          <input
            type="number"
            name="batteryCapacity"
            value={formData.batteryCapacity}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Average Daily Consumption (kWh)</label>
          <input
            type="number"
            name="avgDailyConsumption"
            value={formData.avgDailyConsumption}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={handleSave} className={styles.saveButton}>
            Save Changes
          </button>
        </div>
      </div>
    </section>
  );
}
