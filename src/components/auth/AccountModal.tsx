import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Sparkles, 
  CreditCard, 
  CheckCircle, 
  RotateCw, 
  LogOut, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Clock
} from 'lucide-react';
import { useAuthCredit } from '../../context/AuthCreditContext';
import { PLANS, PlanTier } from '../../types/authCredit';

interface AccountModalProps {
  onNavigateToPricing: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ onNavigateToPricing }) => {
  const { 
    isAccountModalOpen, 
    closeAccountModal, 
    user, 
    availableCredits, 
    subscription, 
    transactions,
    signOut,
    refreshMonthlyCredits,
    cancelSubscription
  } = useAuthCredit();

  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'subscription'>('overview');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  if (!isAccountModalOpen) return null;

  const currentPlanDetails = PLANS[subscription.planId] || PLANS.FREE;

  const handleRefresh = () => {
    refreshMonthlyCredits();
    setFeedbackMsg(`Monthly credits refreshed for ${currentPlanDetails.name} plan!`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleCancelSub = async () => {
    const res = await cancelSubscription();
    setFeedbackMsg(res.message || 'Subscription cancelled.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F0] border-2 border-[#161616] rounded-3xl shadow-[6px_6px_0px_#161616] p-5 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#161616] mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-display font-black text-sm text-white border-2 border-[#161616] shadow-[2px_2px_0px_#161616]"
              style={{ backgroundColor: currentPlanDetails.color }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase tracking-tight">
                  {user?.name || 'Visitor Account'}
                </h3>
                <span 
                  className="px-2 py-0.5 rounded-md font-display font-black text-[10px] text-white border border-[#161616] uppercase tracking-wider"
                  style={{ backgroundColor: currentPlanDetails.color }}
                >
                  {currentPlanDetails.name} PLAN
                </span>
              </div>
              <p className="font-mono text-xs text-stone-500 font-medium">
                {user?.email || 'Guest / Unauthenticated'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAccountModal}
            className="p-2 rounded-xl border-2 border-[#161616] bg-white hover:bg-stone-100 text-[#161616] shadow-[2px_2px_0px_#161616] cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-stone-300 pb-3 mb-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#161616] text-white border-2 border-[#161616] shadow-[2px_2px_0px_#D92B8A]'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            Overview & Balance
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'usage'
                ? 'bg-[#161616] text-white border-2 border-[#161616] shadow-[2px_2px_0px_#D92B8A]'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            Credit Usage Log ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-[#161616] text-white border-2 border-[#161616] shadow-[2px_2px_0px_#D92B8A]'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            Subscription & Billing
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Credit Balance Card */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#161616] shadow-[3.5px_3.5px_0px_#161616]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#D92B8A] text-white flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-display font-black text-xs uppercase tracking-wider text-stone-700">
                      Available Credits
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-500">
                    Plan: {currentPlanDetails.name}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display font-black text-4xl text-[#161616]">
                    {availableCredits.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-stone-500 font-semibold uppercase">
                    Credits Remaining
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-stone-100 border border-stone-300 overflow-hidden mb-4">
                  <div 
                    className="h-full rounded-full bg-linear-to-r from-[#D92B8A] to-[#7C3AED] transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.max(8, (availableCredits / (currentPlanDetails.monthlyCredits || 400)) * 100))}%` 
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                  <button
                    onClick={() => {
                      closeAccountModal();
                      onNavigateToPricing();
                    }}
                    className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-[#161616] hover:bg-stone-800 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#161616] shadow-[2px_2px_0px_#D92B8A] cursor-pointer transition-all"
                  >
                    <span>Upgrade Plan</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D92B8A]" />
                  </button>

                  {subscription.planId !== 'FREE' && (
                    <button
                      onClick={handleRefresh}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-[#161616] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-[#161616] shadow-[2px_2px_0px_#161616] cursor-pointer transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-stone-600" />
                      <span>Simulate Monthly Refresh</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Free vs Credit Rules notice */}
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#059669] space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#059669]" />
                  <h4 className="font-display font-black text-xs uppercase text-[#059669] tracking-wider">
                    Normal Platform Use Is 100% Free
                  </h4>
                </div>
                <p className="text-xs font-sans text-stone-700 leading-relaxed">
                  Studying, viewing flashcards, taking quizzes, saving study sets, and using the Central Planner do <strong>not</strong> consume credits. Credits are solely dedicated to creating and generating new educational and assessment materials.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase px-1">
                <span>Activity & Action</span>
                <span>Credits & Time</span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-stone-300">
                  <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-mono text-stone-500">No credit activity recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div 
                        key={tx.id}
                        className="p-3 rounded-xl bg-white border border-[#161616] shadow-[1.5px_1.5px_0px_#161616] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isPositive ? <Sparkles className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans font-bold text-xs text-[#161616] truncate">
                              {tx.description}
                            </p>
                            <p className="font-mono text-[10px] text-stone-400">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-mono font-bold text-xs ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {isPositive ? `+${tx.amount}` : tx.amount} cr
                          </span>
                          <p className="font-mono text-[10px] text-stone-400">
                            bal: {tx.balanceAfter}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border-2 border-[#161616] shadow-[3px_3px_0px_#161616] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Current Plan Tier
                  </span>
                  <span className="font-display font-black text-sm text-[#161616] uppercase">
                    {currentPlanDetails.name} ({currentPlanDetails.priceZar === 0 ? 'FREE' : `R${currentPlanDetails.priceZar}/mo`})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Monthly Credit Allocation
                  </span>
                  <span className="font-mono font-bold text-xs text-stone-800">
                    {currentPlanDetails.monthlyCredits.toLocaleString()} Credits / month
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Payment Provider
                  </span>
                  <span className="font-mono font-bold text-xs text-[#161616]">
                    {subscription.planId === 'FREE' ? 'None (Free Tier)' : 'Active Plan Subscription'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Status
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    subscription.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : subscription.status === 'cancelled'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-stone-100 text-stone-800 border border-stone-300'
                  }`}>
                    {subscription.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {subscription.planId !== 'FREE' && subscription.status === 'active' && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCancelSub}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-mono font-bold cursor-pointer transition-all"
                  >
                    Cancel Auto-Renewal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t-2 border-[#161616] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={signOut}
            className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-mono text-xs font-bold flex items-center gap-1.5 border border-stone-300 cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Help: <a href="mailto:support@proudlyafrikan.org" className="underline font-bold text-[#161616] hover:text-[#D92B8A]">support@proudlyafrikan.org</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};
