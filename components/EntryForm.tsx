import React, { useState } from 'react';
import { Measurement } from '../types';
import { Button } from './Button';
import { Ruler, Weight, Activity, Calendar, Trash2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface EntryFormProps {
  initialData?: Measurement;
  onSubmit: (data: Omit<Measurement, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// Moved outside component to prevent re-render focus loss
const InputGroup = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  unit 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  icon: any;
  unit: string;
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Replace comma with dot immediately
    const val = e.target.value.replace(',', '.');
    // Allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary transition-colors">
          <Icon size={18} />
        </div>
        <input
          type="text"
          inputMode="decimal"
          required
          value={value}
          onChange={handleInputChange}
          className="block w-full pl-10 pr-12 py-3.5 bg-zinc-800/30 border border-white/10 rounded-2xl text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-zinc-800/50 transition-all backdrop-blur-sm shadow-inner"
          placeholder="0.0"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-500 text-sm font-medium">
          {unit}
        </div>
      </div>
    </div>
  );
};

export const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, onCancel, initialData, onDelete }) => {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(initialData?.weight.toString() || '');
  const [chest, setChest] = useState(initialData?.chest.toString() || '');
  const [waist, setWaist] = useState(initialData?.waist.toString() || '');
  const [arm, setArm] = useState(initialData?.arm.toString() || '');
  const [leg, setLeg] = useState(initialData?.leg.toString() || '');

  // State for the custom confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      weight: parseFloat(weight) || 0,
      chest: parseFloat(chest) || 0,
      waist: parseFloat(waist) || 0,
      arm: parseFloat(arm) || 0,
      leg: parseFloat(leg) || 0,
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl text-primary">
                <Activity size={20} />
              </div>
              {isEditing ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
            </h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider ml-1">Datum</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 py-3.5 bg-zinc-800/30 border border-white/10 rounded-2xl text-zinc-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-zinc-800/50 transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputGroup label="Gewicht" value={weight} onChange={setWeight} icon={Weight} unit="kg" />
            
            <InputGroup label="Brustumfang" value={chest} onChange={setChest} icon={Ruler} unit="cm" />
            <InputGroup label="Bauchumfang" value={waist} onChange={setWaist} icon={Ruler} unit="cm" />
            
            <InputGroup label="Arme (Bicep)" value={arm} onChange={setArm} icon={Ruler} unit="cm" />
            <InputGroup label="Beine (Oberschenkel)" value={leg} onChange={setLeg} icon={Ruler} unit="cm" />
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
            {isEditing && onDelete && (
               <Button
                 type="button"
                 variant="danger"
                 onClick={handleDeleteClick}
                 className="rounded-xl px-4"
                 title="Löschen"
               >
                 <Trash2 size={20} />
               </Button>
            )}

            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 rounded-xl bg-zinc-800/50">
              Abbrechen
            </Button>
            <Button type="submit" fullWidth className="flex-1 rounded-xl shadow-lg shadow-primary/20">
              Speichern
            </Button>
          </div>
        </div>
      </form>
      
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Eintrag löschen"
        message="Möchten Sie diesen Eintrag wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};