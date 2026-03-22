"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

interface Props {
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  bmi: number;
}

export default function HealthCharts({ macros, bmi }: Props) {
  // 🥧 Pie Data
  const macroData = [
    { name: "Protein", value: macros.protein },
    { name: "Carbs", value: macros.carbs },
    { name: "Fats", value: macros.fats },
  ];

  // 📊 Bar Data (for better visualization)
  const barData = [
    { name: "Protein", value: macros.protein },
    { name: "Carbs", value: macros.carbs },
    { name: "Fats", value: macros.fats },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border mt-4 space-y-6">

      {/* 🧠 BMI VISUAL */}
      <div>
        <h3 className="font-semibold mb-2">BMI Status</h3>
        <div className="w-full h-4 bg-gray-200 rounded-full relative">
          <div
            className="h-4 bg-green-500 rounded-full"
            style={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm mt-2">BMI: {bmi.toFixed(2)}</p>
      </div>

      {/* 🥧 PIE CHART */}
      <div>
        <h3 className="font-semibold mb-2">Macro Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={macroData}
              dataKey="value"
              outerRadius={80}
              label
            >
              {macroData.map((_, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 BAR CHART */}
      <div>
        <h3 className="font-semibold mb-2">Macro Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}