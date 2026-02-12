import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartData {
  name: string;
  energy: number;
}

interface Props {
  today: number;
  tomorrow: number;
}

export default function EnergyChart({ today, tomorrow }: Props) {
  const data: ChartData[] = [
    { name: "Today", energy: today },
    { name: "Tomorrow", energy: tomorrow },
  ];

  return (
    <div className="card full">
      <h3>⚡ Energy Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 6 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
