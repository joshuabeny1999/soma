import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Measurement, MetricKey, METRIC_LABELS, METRIC_COLORS } from '../types';
import { ChevronDown, Layers } from 'lucide-react';

interface ProgressChartProps {
  data: Measurement[];
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('weight');
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    // Data comes in DESC (newest first).
    const now = new Date();
    let cutoff = new Date();

    switch (timeRange) {
      case '1M': cutoff.setMonth(now.getMonth() - 1); break;
      case '3M': cutoff.setMonth(now.getMonth() - 3); break;
      case '6M': cutoff.setMonth(now.getMonth() - 6); break;
      case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
      case 'ALL': cutoff = new Date(0); break; // Epoch
    }

    const filtered = data.filter(d => new Date(d.date) >= cutoff);
    // Reverse for Chart (Oldest -> Newest)
    return [...filtered].reverse();
  }, [data, timeRange]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
        <p className="text-zinc-500 font-light">Keine Daten verfügbar</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
      const entry = payload[0];
      return (
        <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] min-w-[150px] z-50 relative">
          <p className="text-zinc-400 text-xs mb-2 font-medium border-b border-white/10 pb-2">{date}</p>
          <div className="flex justify-between items-center gap-4">
            <span style={{ color: entry.color }} className="text-sm font-semibold">
              {METRIC_LABELS[entry.dataKey as MetricKey]?.split(' (')[0]}:
            </span>
            <span className="text-white font-bold text-lg tabular-nums">
              {entry.value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const ranges: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="flex flex-col gap-5 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              Fortschritt
            </h2>
             {/* Time Range Selector */}
            <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5 self-start sm:self-auto">
                {ranges.map((r) => (
                <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                    timeRange === r
                        ? 'bg-zinc-700 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    {r}
                </button>
                ))}
            </div>
        </div>
        
        {/* Metric Selector Dropdown */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
            <ChevronDown size={16} />
          </div>
          <select
            value={activeMetric}
            onChange={(e) => setActiveMetric(e.target.value as MetricKey)}
            className="appearance-none w-full bg-zinc-800/50 border border-white/10 text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all hover:bg-zinc-800/80 cursor-pointer"
          >
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
              <option key={key} value={key}>
                {METRIC_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[320px] w-full -ml-2 mt-4 relative z-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Inter' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tickFormatter={(str) => {
                const d = new Date(str);
                return `${d.getDate()}.${d.getMonth()+1}`;
              }}
              dy={15}
            />
            <YAxis 
              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Inter' }} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              width={35}
            />
            <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }}
                wrapperStyle={{ outline: 'none', zIndex: 100 }}
                trigger="hover"
            />
            <Line
              type="monotone"
              dataKey={activeMetric}
              stroke={METRIC_COLORS[activeMetric]}
              strokeWidth={3}
              // Increased dot size for mobile tappability
              dot={{ fill: '#18181b', stroke: METRIC_COLORS[activeMetric], strokeWidth: 2, r: 6 }}
              // Increased active dot size for clear feedback
              activeDot={{ r: 8, fill: METRIC_COLORS[activeMetric], stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};