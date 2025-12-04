import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function NPSChart({ promotores, neutros, detratores }) {
  const data = [
    { name: "Promotores", value: promotores, color: "#22c55e" },
    { name: "Neutros", value: neutros, color: "#eab308" },
    { name: "Detratores", value: detratores, color: "#ef4444" }
  ];

  const total = promotores + neutros + detratores;
  const npsScore = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : 0;

  // Custom label for displaying percentages
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="neuro-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Distribuição NPS</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-800">
            {npsScore > 0 ? '+' : ''}{npsScore}
          </span>
          <span className="text-sm text-gray-600">pontos NPS</span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* Gradientes 3D para cada seção */}
              <radialGradient id="promotoresGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
              </radialGradient>
              <radialGradient id="neutrosGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
              </radialGradient>
              <radialGradient id="detratoresGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
              </radialGradient>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              <Cell key="cell-0" fill="url(#promotoresGradient)" stroke="#22c55e" strokeWidth={2} />
              <Cell key="cell-1" fill="url(#neutrosGradient)" stroke="#eab308" strokeWidth={2} />
              <Cell key="cell-2" fill="url(#detratoresGradient)" stroke="#ef4444" strokeWidth={2} />
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '12px'
              }}
              itemStyle={{
                color: '#1f2937',
                fontWeight: 'bold'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingTop: '10px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}