import React from 'react';
import { Measurement } from '../types';
import { Trophy, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface SummaryStatsProps {
  entries: Measurement[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ entries }) => {
  if (entries.length < 2) return null;

  // entries are sorted DESC (newest at index 0)
  const current = entries[0];
  const start = entries[entries.length - 1];

  const weightDiff = current.weight - start.weight;
  const waistDiff = current.waist - start.waist;

  // Helper for rendering difference
  const StatBox = ({ label, diff, unit, inverse = false }: { label: string, diff: number, unit: string, inverse?: boolean }) => {
    const isLoss = diff < 0;
    const isGain = diff > 0;
    const absDiff = Math.abs(diff);
    
    // Color logic: 
    // Default: Loss = Green (Good), Gain = Red (Bad)
    // Inverse (Muscle): Loss = Red (Bad), Gain = Green (Good) - Not used for weight/waist usually
    
    let colorClass = "text-zinc-400";
    if (isLoss) colorClass = "text-emerald-400"; // Weight loss is generally "Good" in this context
    if (isGain) colorClass = "text-rose-400";
    if (diff === 0) colorClass = "text-zinc-500";

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-zinc-800/30 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</span>
        <div className={`flex items-center gap-1 text-2xl font-black ${colorClass}`}>
          {isLoss && <TrendingDown size={20} />}
          {isGain && <TrendingUp size={20} />}
          {diff === 0 && <Minus size={20} />}
          <span>{absDiff.toFixed(1)}</span>
          <span className="text-sm font-medium opacity-70 mb-1">{unit}</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-medium">Gesamtveränderung</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-in fade-in slide-in-from-top-4 duration-700">
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">Zusammenfassung</h2>
          <p className="text-xs text-zinc-500">Dein Fortschritt seit Beginn ({new Date(start.date).toLocaleDateString('de-DE')})</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatBox label="Gewicht" diff={weightDiff} unit="kg" />
        <StatBox label="Bauch" diff={waistDiff} unit="cm" />
      </div>
    </div>
  );
};