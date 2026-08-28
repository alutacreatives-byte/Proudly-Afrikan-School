import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export interface GlobalNavigationButtonsProps {
  onBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  backLabel?: string;
  homeLabel?: string;
}

export const GlobalNavigationButtons: React.FC<GlobalNavigationButtonsProps> = ({
  onBack,
  onGoHome,
  className = '',
  backLabel = 'BACK',
  homeLabel = 'HOME',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        id="global-nav-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-stone-700 hover:text-[#D92B8A] uppercase tracking-wider transition-all px-3.5 py-1.5 bg-white border border-stone-200 hover:border-pink-300 hover:bg-pink-50/50 rounded-full shadow-xs cursor-pointer active:scale-95 shrink-0"
        title="Return to previous page"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </button>

      <button
        type="button"
        id="global-nav-home-btn"
        onClick={onGoHome}
        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-stone-700 hover:text-[#D92B8A] uppercase tracking-wider transition-all px-3.5 py-1.5 bg-white border border-stone-200 hover:border-pink-300 hover:bg-pink-50/50 rounded-full shadow-xs cursor-pointer active:scale-95 shrink-0"
        title="Return to main Study homepage"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{homeLabel}</span>
      </button>
    </div>
  );
};
