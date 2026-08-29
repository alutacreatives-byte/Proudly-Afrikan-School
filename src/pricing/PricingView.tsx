import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Mail, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useAuthCredit } from '../context/AuthCreditContext';
import { PLANS, PlanTier, AI_CREDIT_COSTS } from '../types/authCredit';

interface PricingViewProps {
  onNavigateToTab?: (tab: any) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onNavigateToTab }) => {
  const { 
    currentPlan, 
    selectPlan, 
    availableCredits, 
    openAuthModal, 
    isAuthenticated,
    openAccountModal
  } = useAuthCredit();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string>('');

  const plansList = Object.values(PLANS);

  const handlePlanClick = (planId: PlanTier) => {
    if (!isAuthenticated && planId === 'FREE') {
      openAuthModal('signup');
      return;
    }
    setSelectedPlanForCheckout(planId);
  };

  const handleConfirmPlanSubscription = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);
    try {
      const res = await selectPlan(selectedPlanForCheckout);
      if (res.success) {
        setSuccessNotice(res.message || `Subscribed to ${selectedPlanForCheckout} plan!`);
        setSelectedPlanForCheckout(null);
        setTimeout(() => setSuccessNotice(''), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const creditCostItems: { label: string; cost: number; category: string }[] = [
    { label: 'Quiz / Flashcards', cost: AI_CREDIT_COSTS.QUIZ_FLASHCARDS, category: 'Revision' },
    { label: 'Study Guide', cost: AI_CREDIT_COSTS.STUDY_GUIDE, category: 'Study' },
    { label: 'Worksheet', cost: AI_CREDIT_COSTS.WORKSHEET, category: 'Practice' },
    { label: 'Exam & Rubric', cost: AI_CREDIT_COSTS.EXAM, category: 'Assessment' },
    { label: 'Lesson Plan', cost: AI_CREDIT_COSTS.LESSON_PLAN, category: 'Curriculum' },
    { label: 'PDF Study Pack', cost: AI_CREDIT_COSTS.PDF_STUDY_PACK, category: 'Deep Review' },
    { label: 'Presentation Deck', cost: AI_CREDIT_COSTS.PRESENTATION, category: 'Slides' },
    { label: 'Course Blueprint', cost: AI_CREDIT_COSTS.COURSE, category: 'Mastery' },
    { label: 'Learning Path', cost: AI_CREDIT_COSTS.LEARNING_PATH, category: 'Mastery' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF7F0] text-[#161616] pb-24">
      {/* Top Banner / Hero */}
      <section className="border-b-2 border-[#161616] bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#D92B8A] text-[#D92B8A] font-mono text-xs font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#161616]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>African-Centred AI Learning Credits</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#161616] tracking-tight uppercase leading-tight">
            Simple, Transparent <span className="text-[#D92B8A]">Pricing</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Every new user gets <strong className="text-[#161616]">400 free AI credits</strong> to start. 
            Upgrade to monthly plans as your revision, teaching, and study needs expand.
          </p>

          {/* Current Credit Status Indicator */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={openAccountModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F0] border-2 border-[#161616] font-mono text-xs font-bold text-[#161616] shadow-[2.5px_2.5px_0px_#161616] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4 text-[#D92B8A]" />
              <span>Your Current Balance: <strong>{availableCredits.toLocaleString()} Credits</strong> ({currentPlan} Plan)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Success Alert */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-sans text-sm font-semibold flex items-center gap-3 shadow-[3px_3px_0px_#161616] animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plansList.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-white border-2 border-[#161616] p-6 flex flex-col justify-between transition-all duration-200 ${
                  isPopular 
                    ? 'shadow-[6px_6px_0px_#D92B8A] ring-2 ring-[#D92B8A]/40' 
                    : 'shadow-[4px_4px_0px_#161616] hover:shadow-[6px_6px_0px_#161616]'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#D92B8A] text-white font-display font-black text-[10px] tracking-widest uppercase border border-[#161616] shadow-[1.5px_1.5px_0px_#161616] whitespace-nowrap">
                    ★ MOST POPULAR
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 
                      className="font-display font-black text-xl tracking-tight uppercase"
                      style={{ color: plan.color }}
                    >
                      {plan.name}
                    </h3>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-[#161616] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-xs text-stone-500 font-semibold mb-4 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border-2 border-[#161616] mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-black text-3xl sm:text-4xl text-[#161616]">
                        R{plan.priceZar}
                      </span>
                      <span className="font-mono text-xs text-stone-500 font-bold">
                        {plan.priceZar === 0 ? 'once-off' : '/month'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs font-display font-black uppercase text-[#161616]">
                      <Zap className="w-4 h-4 text-[#D92B8A]" />
                      <span>{plan.monthlyCredits.toLocaleString()} AI Credits {plan.isOnceOff ? 'once-off' : '/ month'}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-6">
                    <p className="font-mono text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                      Included in this plan:
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-sans text-stone-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action Button */}
                <div className="pt-4 border-t border-stone-200">
                  <button
                    onClick={() => handlePlanClick(plan.id)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-4 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#161616] transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-stone-100 text-stone-400 border-stone-300 cursor-default'
                        : isPopular
                        ? 'bg-[#D92B8A] hover:bg-[#c02377] text-white shadow-[3px_3px_0px_#161616] hover:translate-x-[1px] hover:translate-y-[1px]'
                        : 'bg-[#161616] hover:bg-stone-800 text-white shadow-[3px_3px_0px_#D92B8A] hover:translate-x-[1px] hover:translate-y-[1px]'
                    }`}
                  >
                    <span>{isCurrent ? 'Active Plan' : plan.buttonLabel}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Normal Usage Guarantee Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#161616] shadow-[4px_4px_0px_#059669]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ECFDF5] text-[#059669] font-mono text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero-Credit Free Access Guarantee</span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight">
                Normal platform use does NOT consume any credits
              </h3>
              <p className="font-sans text-stone-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
                Credits are strictly required only when you trigger AI models to synthesize new content. You can freely study existing sets, take revision quizzes, review saved collections, and manage study timetables without spending a single credit.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-stone-800 shrink-0">
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-stone-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span>Studying: 0 cr</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-stone-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span>Taking Quizzes: 0 cr</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-stone-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span>My Sets: 0 cr</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-stone-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span>Central Planner: 0 cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Credit Cost Breakdown Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#161616] shadow-[4px_4px_0px_#161616] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#D92B8A]" />
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight">
                AI Generation Credit Cost Schedule
              </h3>
            </div>
            <p className="font-sans text-xs sm:text-sm text-stone-600">
              Every generator is calibrated with fixed, predictable credit pricing:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {creditCostItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FAF7F0] border-2 border-[#161616] shadow-[2px_2px_0px_#161616] flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500">
                    {item.category}
                  </span>
                  <h4 className="font-display font-black text-xs uppercase text-[#161616]">
                    {item.label}
                  </h4>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#161616] text-white font-mono font-bold text-xs flex items-center gap-1 shrink-0">
                  <Zap className="w-3 h-3 text-[#D92B8A]" />
                  <span>{item.cost} cr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Customer Support & Institutional Inquiries Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#161616] shadow-[4px_4px_0px_#161616] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D92B8A] uppercase">
              <Mail className="w-4 h-4" />
              <span>Direct Customer & Institutional Support</span>
            </div>
            <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
              support@proudlyafrikan.org
            </h3>
            <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
              For any questions regarding billing, custom institutional quotas, school purchase orders, or account access, our support team is ready to assist you.
            </p>
          </div>

          <a
            href="mailto:support@proudlyafrikan.org"
            className="px-5 py-3 rounded-2xl bg-[#161616] hover:bg-stone-800 text-white font-display font-black text-xs uppercase tracking-wider border-2 border-[#161616] shadow-[3px_3px_0px_#D92B8A] inline-flex items-center gap-2 cursor-pointer transition-all shrink-0 hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Plan Selection / Subscription Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-lg bg-[#FAF7F0] border-2 border-[#161616] rounded-3xl shadow-[6px_6px_0px_#161616] p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#161616]">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                  Plan Subscription Setup
                </span>
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  {PLANS[selectedPlanForCheckout].name} PLAN
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="p-1.5 rounded-xl border-2 border-[#161616] bg-white text-[#161616] hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#161616] space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-xs font-bold text-stone-500 uppercase">Monthly Price</span>
                <span className="font-display font-black text-2xl text-[#161616]">
                  R{PLANS[selectedPlanForCheckout].priceZar} {PLANS[selectedPlanForCheckout].priceZar === 0 ? 'once-off' : '/ month'}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                <span className="font-mono text-xs font-bold text-stone-500 uppercase">Credit Allocation</span>
                <span className="font-mono font-bold text-sm text-[#D92B8A]">
                  +{PLANS[selectedPlanForCheckout].monthlyCredits.toLocaleString()} AI Credits
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 border-2 border-[#161616] text-[#161616] font-display font-black text-xs uppercase cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlanSubscription}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#161616] hover:bg-stone-800 text-white font-display font-black text-xs uppercase tracking-wider border-2 border-[#161616] shadow-[3px_3px_0px_#D92B8A] cursor-pointer transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Confirm & Activate`}
              </button>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400">
              Need assistance? Email <a href="mailto:support@proudlyafrikan.org" className="underline hover:text-stone-600">support@proudlyafrikan.org</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
