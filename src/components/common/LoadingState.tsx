import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading StockỌja workspace...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
      <p className="text-xs font-medium text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};
