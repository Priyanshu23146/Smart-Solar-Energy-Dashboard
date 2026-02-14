import { useEffect, useState } from "react";
import {
  fetchAppliances,
  addAppliance,
  deleteAppliance,
} from "../api/client";
import styles from "./Appliances.module.css";

interface Appliance {
  id?: number; // Backend returns id, but new ones might not have it yet if type mismatch, but backend DOES return it.
  name: string;
  power: number;
}

export default function Appliances() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [name, setName] = useState("");
  const [power, setPower] = useState<string>(""); // Use string input for better UX
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH APPLIANCES =================
  useEffect(() => {
    loadAppliances();
  }, []);

  async function loadAppliances() {
    try {
      setLoading(true);
      const data = await fetchAppliances();
      setAppliances(data);
      setError("");
    } catch {
      setError("Failed to load appliances.");
    } finally {
      setLoading(false);
    }
  }

  // ================= ADD APPLIANCE =================
  async function handleAdd() {
    const powerVal = Number(power);
    if (!name || powerVal <= 0) return;

    try {
      setLoading(true);
      const newApp = await addAppliance(name, powerVal);
      setAppliances([...appliances, newApp]);
      setName("");
      setPower("");
      setError("");
    } catch {
      setError("Failed to add appliance.");
    } finally {
      setLoading(false);
    }
  }

  // ================= DELETE =================
  async function handleDelete(id: number) {
    try {
      setLoading(true);
      await deleteAppliance(id);
      setAppliances(appliances.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete appliance.");
    } finally {
      setLoading(false);
    }
  }

  const totalConsumption = appliances.reduce(
    (sum, item) => sum + item.power,
    0
  );

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Manage Appliances</h2>

      {/* ADD FORM */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Appliance Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />

        <input
          type="number"
          placeholder="Power (kWh)"
          value={power}
          onChange={(e) => setPower(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleAdd} disabled={loading} className={styles.addButton}>
          {loading ? "Adding..." : "Add Appliance"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* LIST */}
      <div className={styles.list}>
        {appliances.length === 0 && !loading && <p>No appliances added yet.</p>}

        {appliances.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardInfo}>
              <strong>{item.name}</strong>
              <p>{item.power} kWh</p>
            </div>
            <button
              onClick={() => item.id && handleDelete(item.id)}
              className={styles.deleteButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className={styles.total}>
        Total Daily Consumption: <strong className={styles.strong}>{totalConsumption} kWh</strong>
      </div>
    </section>
  );
}
