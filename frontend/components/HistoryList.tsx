import React from 'react';
import { Measurement, IS_HIGHER_BETTER, MetricKey } from '../types';
import { Pencil, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface HistoryListProps {
  entries: Measurement[];
  onEdit: (entry: Measurement) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onEdit }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getDelta = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    return current - previous;
  };

  const DeltaIndicator = ({ val, metricKey }: { val: number | null, metricKey: MetricKey }) => {
    if (val === null) return <Minus size={14} className="text-zinc-600" />;
    
    const isNeutral = Math.abs(val) < 0.05; // Treat very small changes as neutral

    if (isNeutral) return <Minus size={14} className="text-zinc-600" />;

    const isUp = val > 0;
    
    // Logic: 
    // If IS_HIGHER_BETTER (Muscle): Up = Green, Down = Red
    // If !IS_HIGHER_BETTER (Fat/Weight): Down = Green, Up = Red
    const isPositive = IS_HIGHER_BETTER[metricKey] ? isUp : !isUp;

    return (
      <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(val).toFixed(1)}
      </div>
    );
  };

  const MetricItem = ({ label, value, delta, metricKey, unit }: { label: string, value: number, delta: number | null, metricKey: MetricKey, unit: string }) => (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-0.5">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-200">{value.toFixed(1)}<span className="text-[10px] text-zinc-500 font-normal ml-0.5">{unit}</span></span>
        <DeltaIndicator val={delta} metricKey={metricKey} />
      </div>
    </div>
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
        <p className="text-zinc-500">Noch keine Einträge vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <h3 className="text-lg font-bold text-white px-2">Historie</h3>
      {entries.map((entry, index) => {
        const previousEntry = entries[index + 1];

        return (
          <div key={entry.id} className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 transition-all hover:bg-zinc-800/40 shadow-lg">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
              <span className="text-zinc-100 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                {formatDate(entry.date)}
              </span>
              <button 
                onClick={() => onEdit(entry)}
                className="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-primary/20 p-2 rounded-xl transition-all"
                aria-label="Edit entry"
              >
                <Pencil size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
              <MetricItem 
                label="Gewicht" 
                value={entry.weight} 
                unit="kg"
                metricKey="weight"
                delta={getDelta(entry.weight, previousEntry?.weight)} 
              />
              <MetricItem 
                label="Brust" 
                value={entry.chest} 
                unit="cm"
                metricKey="chest"
                delta={getDelta(entry.chest, previousEntry?.chest)} 
              />
              <MetricItem 
                label="Bauch" 
                value={entry.waist} 
                unit="cm"
                metricKey="waist"
                delta={getDelta(entry.waist, previousEntry?.waist)} 
              />
              <MetricItem 
                label="Arme" 
                value={entry.arm} 
                unit="cm"
                metricKey="arm"
                delta={getDelta(entry.arm, previousEntry?.arm)} 
              />
              <MetricItem 
                label="Beine" 
                value={entry.leg} 
                unit="cm"
                metricKey="leg"
                delta={getDelta(entry.leg, previousEntry?.leg)} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};