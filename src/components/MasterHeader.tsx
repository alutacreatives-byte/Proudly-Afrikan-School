import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Calendar, 
  FolderOpen, 
  GraduationCap, 
  Menu, 
  X, 
  User, 
  Zap, 
  Tag,
  UserPlus,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { useAuthCredit } from '../context/AuthCreditContext';
import { PlanTier, PLANS } from '../types/authCredit';

export type MainNavTab = 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER' | 'PRICING';

interface MasterHeaderProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  savedItemCount?: number;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  activeTab,
  onSelectTab,
  savedItemCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, availableCredits, isAuthenticated, subscription, openAuthModal, openAccountModal } = useAuthCredit();

  // Dynamic Plan Label: FREE, LEARNER, STUDENT, or SCHOLAR
  const currentPlanTier: PlanTier = (isAuthenticated && subscription?.planId && PLANS[subscription.planId]) 
    ? subscription.planId 
    : 'FREE';

  const navItems: { id: MainNavTab; label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge?: number }[] = [
    { id: 'STUDY', label: 'STUDY', icon: BookOpen, color: '#D92B8A' },
    { id: 'QUIZ', label: 'QUIZ', icon: GraduationCap, color: '#E05A2B' },
    { id: 'BUILD', label: 'BUILD', icon: Layers, color: '#E6425E' },
    { id: 'MY SETS', label: 'MY SETS', icon: FolderOpen, color: '#161616', badge: savedItemCount > 0 ? savedItemCount : undefined },
    { id: 'PLANNER', label: 'PLANNER', icon: Calendar, color: '#161616' },
    { id: 'PRICING', label: 'PRICING', icon: Tag, color: '#D92B8A' },
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
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#D92B8A]';
      case 'PLANNER':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#E05A2B]';
      case 'PRICING':
        return 'bg-[#161616] text-white border-[#161616] shadow-[2.5px_2.5px_0px_#D92B8A]';
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
            STUDY · QUIZ · BUILD · MY SETS · PLANNER · PRICING
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-mono font-bold text-stone-300">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-stone-400">
            <span>AFRICAN-CENTRED EDUCATION SUITE</span>
          </span>
          <span className="text-[#D92B8A]">CAPS & IEB ALIGNED</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 xl:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-2 lg:gap-2 xl:gap-3">
        {/* Brand Crest & Title */}
        <div
          onClick={() => onSelectTab('STUDY')}
          className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 cursor-pointer group shrink-0"
        >
          {/* Logo Emblem Box */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 bg-[#161616] rounded-xl border-2 border-[#161616] p-1 shadow-[2px_2px_0px_#D92B8A] group-hover:shadow-[3px_3px_0px_#D92B8A] transition-all flex items-center justify-center shrink-0 overflow-hidden">
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
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-display font-black text-xs sm:text-sm lg:text-sm xl:text-base tracking-tight text-[#161616] uppercase leading-none">
                PROUDLY AFRIKAN
              </span>
              <span className="font-display font-black text-[7px] sm:text-[8px] xl:text-[9px] px-1 py-0.5 rounded bg-[#D92B8A] text-white border border-[#161616] shadow-[1px_1px_0px_#161616] uppercase leading-none">
                SCHOOL
              </span>
            </div>
            <span className="font-mono text-[8px] xl:text-[9px] font-semibold text-stone-500 tracking-tight mt-0.5 hidden 2xl:inline">
              Learn · Test · Create · Plan · Pricing
            </span>
          </div>
        </div>

        {/* Desktop Main Menu (6 items: STUDY · QUIZ · BUILD · MY SETS · PLANNER · PRICING) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 p-0.5 xl:p-1 bg-white/95 border-2 border-[#161616] rounded-2xl shadow-[2px_2px_0px_#161616] shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-1.5 lg:px-2 xl:px-2.5 py-1 xl:py-1.5 rounded-xl font-display font-black text-[10px] xl:text-xs tracking-wider uppercase flex items-center gap-1 xl:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? getTabActiveStyle(item.id)
                    : 'text-stone-800 hover:bg-[#FAF7F0] hover:text-[#161616]'
                }`}
              >
                <Icon className={`w-3 h-3 xl:w-3.5 xl:h-3.5 ${isActive ? 'text-white' : 'text-stone-700'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[8px] xl:text-[9px] px-1 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-[#D92B8A] text-white' : 'bg-stone-200 text-stone-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Dynamic Plan Pill, Credits Badge, Sign In / Sign Up or Account Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-1.5 xl:gap-2 shrink-0">
          {/* Dynamic Plan Label Badge (FREE / LEARNER / STUDENT / SCHOLAR) */}
          <button
            onClick={() => onSelectTab('PRICING')}
            title={`Active Plan: ${currentPlanTier} (Click to manage/upgrade)`}
            className="tactile-btn bg-white hover:bg-stone-50 text-[#161616] border-2 border-[#161616] px-1.5 sm:px-2 xl:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#161616] whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-[#D92B8A] shrink-0"></span>
            <span className="text-[10px] text-stone-500 font-mono hidden xl:inline">PLAN:</span>
            <span className="font-display font-black text-[10px] sm:text-xs text-[#161616] uppercase">{currentPlanTier}</span>
          </button>

          {/* Credits Balance Badge */}
          <button
            onClick={openAccountModal}
            title="View Credits & Balance"
            className="tactile-btn bg-white hover:bg-stone-50 text-[#161616] border-2 border-[#161616] px-1.5 sm:px-2 xl:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#161616] whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold">{availableCredits.toLocaleString()}</span>
            <span className="text-[9px] sm:text-[10px] text-stone-500 font-mono">cr</span>
          </button>

          {/* Unauthenticated Actions (Sign In & Sign Up) */}
          {!isAuthenticated || !user ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => openAuthModal('signin')}
                className="tactile-btn bg-white hover:bg-stone-50 text-[#161616] border-2 border-[#161616] px-1.5 sm:px-2 xl:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-display font-black flex items-center gap-1 cursor-pointer uppercase tracking-wider shadow-[2px_2px_0px_#161616] whitespace-nowrap"
              >
                <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D92B8A] shrink-0" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="tactile-btn bg-[#161616] hover:bg-stone-800 text-white border-2 border-[#161616] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-display font-black hidden xl:flex items-center gap-1 cursor-pointer uppercase tracking-wider shadow-[2px_2px_0px_#D92B8A] whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            /* Authenticated User Account Button with Dynamic Plan Pill */
            <button
              onClick={openAccountModal}
              className="tactile-btn bg-[#161616] hover:bg-stone-800 text-white border-2 border-[#161616] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-display font-black flex items-center gap-1 sm:gap-1.5 cursor-pointer uppercase tracking-wider shadow-[2px_2px_0px_#D92B8A] whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
              <span className="hidden sm:inline truncate max-w-[55px] lg:max-w-[70px] xl:max-w-[90px]">{user.name.split(' ')[0]}</span>
              <span className="sm:hidden text-[10px]">Me</span>
            </button>
          )}

          {/* Mobile/Tablet menu toggle button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl border-2 border-[#161616] bg-white text-[#161616] shadow-[2px_2px_0px_#161616] cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-[#161616] p-4 space-y-2 animate-in slide-in-from-top-2">
          {/* Active Plan in Mobile Drawer */}
          <div className="p-3 bg-[#FAF7F0] border-2 border-[#161616] rounded-xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D92B8A]"></span>
              <span className="font-mono text-xs font-bold text-stone-600">CURRENT PLAN:</span>
              <span className="font-display font-black text-xs text-[#161616]">{currentPlanTier}</span>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onSelectTab('PRICING');
              }}
              className="text-xs font-display font-black text-[#D92B8A] uppercase hover:underline"
            >
              Upgrade →
            </button>
          </div>

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
                className={`w-full text-left px-4 py-3 rounded-xl font-display font-black text-sm uppercase flex items-center justify-between border-2 transition-all cursor-pointer ${
                  isActive
                    ? getTabActiveStyle(item.id)
                    : 'bg-[#FAF7F0] border-[#161616] text-stone-800 hover:bg-stone-50'
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

          {/* Mobile User Auth / Account Actions */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            {!isAuthenticated || !user ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white border-2 border-[#161616] text-[#161616] font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#161616] cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#161616] text-white border-2 border-[#161616] font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#D92B8A] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>Sign Up (400 cr)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAccountModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#161616] text-white border-2 border-[#161616] font-display font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#D92B8A] cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#D92B8A]" />
                <span>Account Profile ({user.name})</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openAccountModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF7F0] border-2 border-[#161616] text-[#161616] font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#161616] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>Available Credits: {availableCredits.toLocaleString()} cr</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
