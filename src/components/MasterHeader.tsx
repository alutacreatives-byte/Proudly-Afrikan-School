import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Calendar, 
  FolderOpen, 
  GraduationCap, 
  Menu, 
  X, 
  Sparkles, 
  Flame,
  ArrowUpRight,
  User
} from 'lucide-react';

export type MainNavTab = 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER';

interface MasterHeaderProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  savedItemCount?: number;
  onOpenTutor?: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  activeTab,
  onSelectTab,
  savedItemCount = 0,
  onOpenTutor,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems: { id: MainNavTab; label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge?: number }[] = [
    { id: 'STUDY', label: 'STUDY', icon: BookOpen, color: '#D92B8A' },
    { id: 'QUIZ', label: 'QUIZ', icon: GraduationCap, color: '#E05A2B' },
    { id: 'BUILD', label: 'BUILD', icon: Layers, color: '#E6425E' },
    { id: 'MY SETS', label: 'MY SETS', icon: FolderOpen, color: '#7C3AED', badge: savedItemCount > 0 ? savedItemCount : undefined },
    { id: 'PLANNER', label: 'PLANNER', icon: Calendar, color: '#059669' },
  ];

  const getTabActiveStyle = (tabId: MainNavTab) => {
    switch (tabId) {
      case 'STUDY':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#D92B8A]';
      case 'QUIZ':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#E05A2B]';
      case 'BUILD':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#E6425E]';
      case 'MY SETS':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#7C3AED]';
      case 'PLANNER':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#059669]';
      default:
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#D92B8A]';
    }
  };

  return (
    <header className="sticky top-0 z-50 select-none bg-[#FAF7F0] border-b-2 border-[#161616] transition-colors">
      {/* Top Editorial Ticker */}
      <div className="bg-[#161616] text-[#FAF7F0] py-1.5 px-3 sm:px-6 text-[11px] font-mono flex items-center justify-between border-b border-stone-800 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#D92B8A] inline-block animate-pulse shrink-0"></span>
          <span className="font-bold tracking-wider uppercase text-[#D92B8A]">
            PROUDLY AFRIKAN SCHOOL
          </span>
          <span className="text-stone-600 hidden md:inline">|</span>
          <span className="text-stone-300 font-medium hidden md:inline">
            STUDY · QUIZ · BUILD · MY SETS · PLANNER
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-mono font-bold text-stone-300">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-stone-400">
            <span>AFRICAN CENTRED EDUCATION SUITE</span>
          </span>
          <span className="text-[#D92B8A]">⚡ GEMINI AI POWERED</span>
        </div>
      </div>

      {/* Main Unified Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Crest & Title */}
        <div
          onClick={() => onSelectTab('STUDY')}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0"
        >
          {/* Logo Emblem Box */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#161616] rounded-xl sm:rounded-2xl border-2 border-[#161616] p-1 shadow-[2.5px_2.5px_0px_#D92B8A] group-hover:shadow-[3.5px_3.5px_0px_#D92B8A] transition-all flex items-center justify-center shrink-0 overflow-hidden">
            {!logoError ? (
              <img
                src="https://sifisos.com/wp-content/uploads/2026/04/Proudly-Afrikan-Logo.png"
                alt="Proudly Afrikan School"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="font-display font-black text-xs text-[#D92B8A] tracking-tighter">
                PAS
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base sm:text-xl tracking-tight text-[#161616] uppercase leading-none">
                PROUDLY AFRIKAN
              </span>
              <span className="font-display font-black text-[10px] sm:text-xs px-2 py-0.5 rounded bg-[#D92B8A] text-white border border-[#161616] shadow-[1.5px_1.5px_0px_#161616] uppercase">
                SCHOOL
              </span>
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-stone-500 tracking-wide mt-0.5 hidden sm:inline">
              Learn · Test · Create · Plan
            </span>
          </div>
        </div>

        {/* Desktop Main Menu: STUDY · QUIZ · BUILD · MY SETS · PLANNER */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-white/70 border-2 border-[#161616] rounded-2xl shadow-[2px_2px_0px_#161616]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-2 rounded-xl font-display font-black text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? getTabActiveStyle(item.id)
                    : 'text-stone-800 hover:bg-[#FAF7F0] hover:text-[#161616]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-700'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-[#D92B8A] text-white' : 'bg-stone-200 text-stone-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenTutor && (
            <button
              onClick={onOpenTutor}
              className="tactile-btn bg-white hover:bg-[#FDEAF4] text-[#161616] border-2 border-[#161616] px-3 sm:px-4 py-2 rounded-xl text-xs font-display font-black flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-[2px_2px_0px_#161616]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span className="hidden sm:inline">AI TUTOR</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border-2 border-[#161616] bg-white text-[#161616] shadow-[2px_2px_0px_#161616] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-[#161616] p-4 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-display font-black text-sm uppercase flex items-center justify-between border-2 transition-all ${
                  isActive
                    ? getTabActiveStyle(item.id)
                    : 'bg-[#FAF7F0] border-[#161616] text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                    {item.badge} items
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
