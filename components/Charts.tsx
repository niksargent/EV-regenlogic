import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { SimulationResult } from '../types';

interface ChartsProps {
  results: SimulationResult;
  targetDistance: number;
}

export const Charts: React.FC<ChartsProps> = ({ results, targetDistance }) => {
  // Merge data for easier plotting if needed, or just pass arrays.
  // Since X axis (Distance) is not synchronized perfectly step-by-step, 
  // we might need to map them carefully or just plot one main axis.
  // Actually, Scatter or just Line with type="monotone" works if we use distance as X.

  const dataA = results.strategyA.map(p => ({ ...p, type: 'Coast' }));
  const dataB = results.strategyB.map(p => ({ ...p, type: 'Regen' }));

  // To show both on one chart with X axis as Distance, we need a combined dataset?
  // Recharts can handle multiple Lines with different dataKeys if the X axis is shared category.
  // But here X is continuous. 
  // Better approach: Use "Scatter" or just multiple Lines but we need a unified X-axis domain.
  // Simple hack: Create a combined array by sampling or just rely on Recharts to handle two data sources if we use ComposedChart? 
  // No, Recharts wants a single array of objects.
  
  // Let's interpolate or just downsample to common distance points?
  // Or simpler: XAxis type="number".
  
  return (
    <div className="space-y-6">
      {/* Speed Profile */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Speed vs Distance</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="distance" 
                type="number" 
                domain={[0, 'auto']} 
                label={{ value: 'Distance (m)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }}
                stroke="#94a3b8"
              />
              <YAxis 
                label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
                stroke="#94a3b8"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => [value.toFixed(1), 'km/h']}
                labelFormatter={(label: number) => `Dist: ${label.toFixed(0)}m`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              <ReferenceLine x={targetDistance} stroke="#ef4444" strokeDasharray="3 3" label="Target" />
              
              <Line 
                data={dataA} 
                dataKey="speed" 
                name="Strategy A: Coast" 
                stroke="#38bdf8" 
                strokeWidth={2} 
                dot={false} 
                type="monotone"
              />
              <Line 
                data={dataB} 
                dataKey="speed" 
                name="Strategy B: Drive & Regen" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={false} 
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Profile */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Net Energy Consumed vs Distance</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="distance" 
                type="number" 
                domain={[0, 'auto']}
                label={{ value: 'Distance (m)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }}
                stroke="#94a3b8"
              />
              <YAxis 
                label={{ value: 'Energy (J)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
                stroke="#94a3b8"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                formatter={(value: number) => [(value/3600).toFixed(2) + ' Wh', 'Net Energy']}
                labelFormatter={(label: number) => `Dist: ${label.toFixed(0)}m`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              <ReferenceLine x={targetDistance} stroke="#ef4444" strokeDasharray="3 3" />

              <Area 
                data={dataA} 
                dataKey="energyNet" 
                name="Strategy A: Coast" 
                stroke="#38bdf8" 
                fill="#38bdf8" 
                fillOpacity={0.1}
              />
              <Area 
                data={dataB} 
                dataKey="energyNet" 
                name="Strategy B: Drive & Regen" 
                stroke="#a855f7" 
                fill="#a855f7" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          *Strategy A stays at 0 because engine is off. Strategy B consumes energy to maintain speed, then recovers some during braking.
        </p>
      </div>
    </div>
  );
};
