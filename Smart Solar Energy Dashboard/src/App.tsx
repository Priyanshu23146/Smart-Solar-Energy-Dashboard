import "./index.css";

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>🌞 Smart Solar Energy Dashboard</h1>
        <p>Weather-based solar power prediction & planning</p>
      </header>

      <div className="grid">
        <div className="card">
          <h3>Today's Generation</h3>
          <p className="value">18 kWh</p>
        </div>

        <div className="card">
          <h3>Tomorrow Prediction</h3>
          <p className="value warning">11 kWh</p>
        </div>

        <div className="card">
          <h3>Risk Level</h3>
          <p className="value danger">High</p>
        </div>
      </div>

      <div className="card full">
        <h3>🌦️ Tomorrow's Weather</h3>
        <ul>
          <li>Cloud Cover: 70%</li>
          <li>Rain Probability: 60%</li>
          <li>Temperature: 34°C</li>
        </ul>
      </div>

      <div className="card full alert">
        <h3>⚠️ Smart Recommendation</h3>
        <p>
          Low solar generation expected tomorrow due to cloudy and rainy
          weather.
        </p>
        <ul>
          <li>🔋 Charge batteries today</li>
          <li>⚡ Run heavy appliances in advance</li>
          <li>❄️ Reduce non-essential usage tomorrow</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
