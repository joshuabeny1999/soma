import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 border border-rose-500/20">
            <AlertTriangle size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">
            {title}
          </h3>
          
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            <Button 
              variant="secondary" 
              onClick={onCancel} 
              fullWidth
              className="rounded-xl bg-zinc-800"
            >
              Abbrechen
            </Button>
            <Button 
              variant="danger" 
              onClick={onConfirm} 
              fullWidth
              className="rounded-xl shadow-lg shadow-rose-900/20"
            >
              Löschen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};