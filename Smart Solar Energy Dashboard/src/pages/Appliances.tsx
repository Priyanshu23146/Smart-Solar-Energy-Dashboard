import { useEffect, useState } from "react";
import "./Appliances.css";
interface Appliance {
  _id?: string;
  name: string;
  power: number;
}

export default function Appliances() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [name, setName] = useState("");
  const [power, setPower] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // future backend endpoint
  // const API_URL = "http://localhost:5000/appliances";

  // ================= FETCH APPLIANCES =================
  useEffect(() => {
    fetchAppliances();
  }, []);

  async function fetchAppliances() {
    try {
      setLoading(true);

      // For now simulate empty response
      // Replace this when backend ready:
      // const res = await fetch(API_URL);
      // const data = await res.json();

      const data: Appliance[] = [];

      setAppliances(data);
      setError("");
    } catch (err) {
      setError("Failed to load appliances.");
    } finally {
      setLoading(false);
    }
  }

  // ================= ADD APPLIANCE =================
  async function handleAdd() {
    if (!name || power <= 0) return;

    try {
      setLoading(true);

      const newAppliance: Appliance = { name, power };

      // Backend-ready structure:
      // await fetch(API_URL, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(newAppliance),
      // });

      setAppliances([...appliances, newAppliance]);

      setName("");
      setPower(0);
      setError("");
    } catch (err) {
      setError("Failed to add appliance.");
    } finally {
      setLoading(false);
    }
  }

  // ================= DELETE =================
  async function handleDelete(index: number) {
    try {
      setLoading(true);

      // Backend-ready structure:
      // await fetch(`${API_URL}/${appliances[index]._id}`, {
      //   method: "DELETE",
      // });

      const updated = appliances.filter((_, i) => i !== index);
      setAppliances(updated);
    } catch (err) {
      setError("Failed to delete appliance.");
    } finally {
      setLoading(false);
    }
  }

  const totalConsumption = appliances.reduce(
    (sum, item) => sum + item.power,
    0,
  );

  return (
    <section className="appliances-page">
      <h2>Manage Appliances</h2>

      {/* ADD FORM */}
      <div className="appliance-form">
        <input
          type="text"
          placeholder="Appliance Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Power (kWh)"
          value={power}
          onChange={(e) => setPower(Number(e.target.value))}
        />

        <button onClick={handleAdd} disabled={loading}>
          Add
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* LIST */}
      <div className="appliance-list">
        {appliances.length === 0 && !loading && <p>No appliances added yet.</p>}

        {appliances.map((item, index) => (
          <div key={index} className="appliance-card">
            <div>
              <strong>{item.name}</strong>
              <p>{item.power} kWh</p>
            </div>
            <button onClick={() => handleDelete(index)}>Remove</button>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="total-consumption">
        Total Daily Consumption: <strong>{totalConsumption} kWh</strong>
      </div>
    </section>
  );
}
