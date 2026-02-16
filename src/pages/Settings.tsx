import { useState, useEffect } from "react";
import { useSolar } from "../context/SolarContext";
import styles from "./Settings.module.css";

export default function Settings() {
  const {
    city,
    country,
    state,
    pincode,
    panelCapacity,
    batteryCapacity,
    avgDailyConsumption,
    setCity,
    setCountry,
    setState,
    setPincode,
    setPanelCapacity,
    setBatteryCapacity,
    setAvgDailyConsumption,
  } = useSolar();

  const [formData, setFormData] = useState({
    city: "",
    country: "",
    state: "",
    pincode: "",
    panelCapacity: 0,
    batteryCapacity: 0,
    avgDailyConsumption: 0,
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state with context on load
  useEffect(() => {
    setFormData({
      city,
      country,
      state,
      pincode,
      panelCapacity,
      batteryCapacity,
      avgDailyConsumption,
    });
  }, [city, country, state, pincode, panelCapacity, batteryCapacity, avgDailyConsumption]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "city" || name === "country" || name === "state" || name === "pincode" ? value : Number(value),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update all settings - wait for all API calls to complete
      await Promise.all([
        setCity(formData.city),
        setCountry(formData.country),
        setState(formData.state),
        setPincode(formData.pincode),
        setPanelCapacity(formData.panelCapacity),
        setBatteryCapacity(formData.batteryCapacity),
        setAvgDailyConsumption(formData.avgDailyConsumption),
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
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
          <label className={styles.label}>Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., India, USA, UK"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., Maharashtra, California"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Pin Code</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., 400001, 90210"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>City (for weather data)</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
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
            placeholder="e.g., 5"
            min="0"
            step="0.1"
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
            placeholder="e.g., 10"
            min="0"
            step="0.1"
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
            placeholder="e.g., 18"
            min="0"
            step="0.1"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
