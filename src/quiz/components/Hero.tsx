import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  onSelectSample: (samplePrompt: string, category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick, onSelectSample }) => {
  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#292929]/10 bg-[#F5F0E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Editorial Pill & Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 backdrop-blur-xs rounded-full border border-[#E0D8C5] shadow-xs text-xs font-mono-code font-bold uppercase tracking-wider text-[#292929] mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E05A2B] inline-block animate-pulse"></span>
          <span>PROUDLY AFRIKAN BUILD • EDITION 1.0</span>
        </div>

        {/* Oversized Wide Display Headline */}
        <div className="space-y-2 mb-8">
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter text-[#292929] uppercase break-words">
            BUILD<br />
            ANYTHING.<br />
            <span className="text-[#E05A2B]">
              ABOUT<br />
              ANYTHING.
            </span>
          </h1>
        </div>

        {/* Two-column editorial subheader and action block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-base sm:text-lg md:text-xl font-normal text-[#4A4A4A] leading-relaxed max-w-xl">
              Turn any topic, text notes, or educational PDF into sharp, classroom-ready quizzes and interactive assessments in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              {/* Primary High-Impact CTA */}
              <button
                onClick={onStartClick}
                className="w-full sm:w-auto px-8 py-4 bg-[#292929] hover:bg-[#1A1A1A] text-[#F5F0E6] font-display font-black text-sm sm:text-base md:text-lg tracking-wider uppercase rounded-full shadow-lg hover:shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>CREATE YOUR QUIZ</span>
                <ArrowRight className="w-5 h-5 text-[#E05A2B] group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="font-mono-code text-xs text-[#5E5950] flex flex-col justify-center">
                <span className="font-bold text-[#292929]">Free to use.</span>
                <span>No login or signup required.</span>
              </div>
            </div>
          </div>

          {/* Right column: Elevated Neumorphic/Soft Inspiration Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#FAF7F2] rounded-[2rem] border border-[#E6E0D5] p-6 sm:p-7 shadow-[0_12px_36px_-12px_rgba(41,41,41,0.07)] space-y-5">
              <div className="flex items-center justify-between border-b border-[#292929]/10 pb-3.5">
                <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E05A2B]" />
                  INSTANT INSPIRATION
                </span>
                <span className="font-mono-code text-[11px] font-bold text-[#736E65] uppercase tracking-wider">
                  TAP TO TRY
                </span>
              </div>

              {/* 2-column grid of pill inspiration tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => onSelectSample('The Kingdom of Mali & Mansa Musa', 'History')}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF0EB] hover:border-[#E05A2B] border border-[#E5E0D8] rounded-full shadow-xs text-xs font-bold text-[#292929] transition-all flex items-center gap-2 truncate cursor-pointer text-left"
                >
                  <span className="shrink-0">👑</span>
                  <span className="truncate">Kingdom of Mali</span>
                </button>
                
                <button
                  onClick={() => onSelectSample('The Great Rift Valley Geography & Ecology', 'Geography')}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF0EB] hover:border-[#E05A2B] border border-[#E5E0D8] rounded-full shadow-xs text-xs font-bold text-[#292929] transition-all flex items-center gap-2 truncate cursor-pointer text-left"
                >
                  <span className="shrink-0">🌍</span>
                  <span className="truncate">Great Rift Valley</span>
                </button>

                <button
                  onClick={() => onSelectSample('African Literature: Chinua Achebe & Things Fall Apart', 'Literature')}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF0EB] hover:border-[#E05A2B] border border-[#E5E0D8] rounded-full shadow-xs text-xs font-bold text-[#292929] transition-all flex items-center gap-2 truncate cursor-pointer text-left"
                >
                  <span className="shrink-0">📚</span>
                  <span className="truncate">African Literature</span>
                </button>

                <button
                  onClick={() => onSelectSample('Solar Energy Revolution & Geothermal Power in Africa', 'Science')}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF0EB] hover:border-[#E05A2B] border border-[#E5E0D8] rounded-full shadow-xs text-xs font-bold text-[#292929] transition-all flex items-center gap-2 truncate cursor-pointer text-left"
                >
                  <span className="shrink-0">⚙️</span>
                  <span className="truncate">Solar In Africa</span>
                </button>

                <button
                  onClick={() => onSelectSample('Sustainable Agriculture & Indigenous Crops in Africa', 'Science')}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF0EB] hover:border-[#E05A2B] border border-[#E5E0D8] rounded-full shadow-xs text-xs font-bold text-[#292929] transition-all flex items-center gap-2 truncate cursor-pointer text-left"
                >
                  <span className="shrink-0">🌱</span>
                  <span className="truncate">Sustainable...</span>
                </button>

                <button
                  onClick={() => onSelectSample('The Kingdom of Kush & Nubian Pyramids at Meroë', 'History')}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF0EB] hover:border-[#E05A2B] border border-[#E5E0D8] rounded-full shadow-xs text-xs font-bold text-[#292929] transition-all flex items-center gap-2 truncate cursor-pointer text-left"
                >
                  <span className="shrink-0">🔬</span>
                  <span className="truncate">Nubian Pyramids</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#292929]/10 text-[11px] font-mono-code text-[#736E65]">
                <span>× Click any topic above to launch pre-filled workbench.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
