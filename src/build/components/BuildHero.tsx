import React from 'react';
import { BuildToolType } from '../types';

interface BuildHeroProps {
  onStartClick: () => void;
  onSelectSample: (sampleTopic: string, category: string, suggestedTool?: BuildToolType) => void;
  onUploadPdfClick?: () => void;
}

export const BuildHero: React.FC<BuildHeroProps> = ({ 
  onStartClick, 
  onSelectSample,
  onUploadPdfClick,
}) => {
  const inspirationTopics: { label: string; topic: string; category: string; tool: BuildToolType }[] = [
    { label: '👑 Kingdom of Mali', topic: 'The Kingdom of Mali & Mansa Musa', category: 'History & Geography', tool: 'course-builder' },
    { label: '🌍 Great Rift Valley', topic: 'The Great Rift Valley Geography & Ecology', category: 'History & Geography', tool: 'worksheet' },
    { label: '📚 African Literature', topic: 'African Literature: Chinua Achebe & Things Fall Apart', category: 'Languages & Literature', tool: 'lesson-plan' },
    { label: '⚙️ Solar In Africa', topic: 'Solar Energy Revolution & Geothermal Power in Africa', category: 'Sciences & STEM', tool: 'presentation' },
    { label: '🌱 Sustainable Farming', topic: 'Sustainable Agriculture & Indigenous Crops in Africa', category: 'Sciences & STEM', tool: 'worksheet' },
    { label: '🔬 Nubian Pyramids', topic: 'The Kingdom of Kush & Nubian Pyramids at Meroë', category: 'History & Geography', tool: 'exam' },
  ];

  return (
    <section className="pt-2 pb-8 border-b border-stone-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Edition Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-stone-300/80 rounded-full shadow-xs text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63956] inline-block animate-pulse"></span>
            <span>PROUDLY AFRIKAN EDUCATION • RESOURCE BUILDER</span>
          </div>

          {/* Giant Oversized Display Headline: Exact matching scale to Study and Quiz */}
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.25rem] xl:text-[6rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
            BUILD<br />
            ANYTHING.<br />
            <span className="text-[#E63956]">ABOUT<br />ANYTHING.</span>
          </h1>

          {/* Clear, comfortable, easy-to-read subtext */}
          <p className="text-base sm:text-lg lg:text-xl text-stone-700 font-normal leading-[1.6] max-w-2xl">
            Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, and interactive courses in seconds.
          </p>

          {/* Action Buttons - Fully Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onStartClick}
              className="px-7 sm:px-8 py-4 bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(230,57,86,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>BUILD AN EXAM / WORKSHEET</span>
            </button>

            <button
              onClick={onUploadPdfClick || onStartClick}
              className="px-7 sm:px-8 py-4 bg-[#161616] hover:bg-stone-800 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>UPLOAD PDF / DOC</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Inspiration Card & Metrics */}
        <div className="lg:col-span-5 space-y-5 lg:pt-2">
          {/* Instant Inspiration Elevated Rounded Card */}
          <div className="bg-white border border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] rounded-[2rem] p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
              <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                <span className="text-[#E63956] text-sm">❖</span>
                <span>INSTANT INSPIRATION</span>
              </div>
              <span className="font-mono text-xs text-stone-400 font-bold uppercase tracking-wider">
                TAP TO TRY
              </span>
            </div>

            {/* 2-Column Pill Button Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {inspirationTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSample(item.topic, item.category, item.tool)}
                  className="px-3.5 py-2.5 bg-white hover:bg-pink-50/50 border border-stone-200/90 hover:border-pink-300 text-stone-800 hover:text-[#E63956] font-medium text-xs sm:text-sm rounded-full transition-all shadow-xs flex items-center gap-2 text-left truncate cursor-pointer"
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-1 text-center">
              <span className="text-[11px] sm:text-xs font-mono text-stone-500 font-medium">
                * Click any topic above to launch pre-filled workbench.
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar in Rounded Pill Container */}
          <div className="grid grid-cols-3 gap-2 bg-white border border-stone-200/90 py-3.5 px-4 rounded-[1.5rem] shadow-xs">
            <div className="text-center border-r border-stone-200 pr-2">
              <div className="font-display text-lg sm:text-2xl font-black text-[#E63956]">
                7
              </div>
              <div className="font-mono text-[10px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
                GENERATORS
              </div>
            </div>

            <div className="text-center border-r border-stone-200 px-2">
              <div className="font-display text-lg sm:text-2xl font-black text-[#161616]">
                PDF
              </div>
              <div className="font-mono text-[10px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
                DOCUMENT AI
              </div>
            </div>

            <div className="text-center pl-2">
              <div className="font-display text-lg sm:text-2xl font-black text-[#E63956]">
                CAPS
              </div>
              <div className="font-mono text-[10px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
                IEB ALIGNED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

