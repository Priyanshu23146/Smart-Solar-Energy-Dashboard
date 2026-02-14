import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  currentConsumption: number;
  predictedProduction: number;
}

export default function EnergyChart({ predictedProduction }: Props) {
  // Simulated hourly distribution based on predicted production
  const data = [
    { hour: "6AM", energy: predictedProduction * 0.05 },
    { hour: "8AM", energy: predictedProduction * 0.15 },
    { hour: "10AM", energy: predictedProduction * 0.25 },
    { hour: "12PM", energy: predictedProduction * 0.3 },
    { hour: "2PM", energy: predictedProduction * 0.2 },
    { hour: "4PM", energy: predictedProduction * 0.1 },
    { hour: "6PM", energy: predictedProduction * 0.05 },
  ];

  return (
    <div className="card">
      <h3>⚡ Tomorrow's Energy Curve</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="hour" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="energy"
            stroke="#38bdf8"
            fillOpacity={1}
            fill="url(#colorEnergy)"
            strokeWidth={3}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
