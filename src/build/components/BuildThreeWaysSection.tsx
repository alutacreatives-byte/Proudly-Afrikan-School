import React from 'react';
import { Type, ClipboardCopy, FileUp, Camera, ArrowDown } from 'lucide-react';

interface BuildThreeWaysSectionProps {
  onSelectMethod: (method: 'topic' | 'text' | 'pdf' | 'capture') => void;
  activeMethod: 'topic' | 'text' | 'pdf' | 'capture';
}

export const BuildThreeWaysSection: React.FC<BuildThreeWaysSectionProps> = ({
  onSelectMethod,
  activeMethod,
}) => {
  const cards = [
    {
      id: 'topic' as const,
      num: '01',
      badgeText: 'FASTEST',
      badgeClass: 'bg-[#E63956] text-white shadow-xs',
      title: 'TYPE IT.',
      subtitle: 'TOPIC & IDEA MODE',
      desc: 'Enter any topic, curriculum subject, or concept and let AI craft a structured resource instantly.',
      icon: Type,
    },
    {
      id: 'text' as const,
      num: '02',
      badgeText: 'DEEP CONTEXT',
      badgeClass: 'bg-[#FAF8F5] border border-stone-200 text-stone-700',
      title: 'PASTE IT.',
      subtitle: 'NOTES & ARTICLES',
      desc: 'Paste syllabus paragraphs, lesson transcripts, or curriculum excerpts to ground the generated questions.',
      icon: ClipboardCopy,
    },
    {
      id: 'pdf' as const,
      num: '03',
      badgeText: 'PDF • DOC • DOCX',
      badgeClass: 'bg-[#18181B] text-white',
      title: 'UPLOAD IT.',
      subtitle: 'DOCUMENT & PDF MODE',
      desc: 'Drop in textbook chapters, PDFs, Word docs, or test drafts to extract context and synthesize classroom packs.',
      icon: FileUp,
    },
    {
      id: 'capture' as const,
      num: '04',
      badgeText: 'CAMERA • OCR',
      badgeClass: 'bg-[#D92B8A] text-white shadow-xs',
      title: 'CAPTURE IT.',
      subtitle: 'CAMERA & PHOTO MODE',
      desc: 'Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets to instantly digitize and build curriculum.',
      icon: Camera,
    },
  ];

  return (
    <section className="py-12 border-b border-stone-200/80">
      <div className="space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-stone-200/80 gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956] block mb-2">
              FLEXIBLE INPUT MODES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              FOUR WAYS TO CREATE.
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Select an input method below to immediately jump into the resource generator workbench.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeMethod === card.id;

            return (
              <div
                key={card.id}
                onClick={() => onSelectMethod(card.id)}
                className={`bg-white rounded-[2rem] border transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-[#E63956] shadow-[0_20px_45px_-10px_rgba(230,57,86,0.18)] ring-2 ring-[#E63956]/20'
                    : 'border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#161616]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#E63956] transition-colors">
                      {card.num}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${card.badgeClass}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#E63956] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#E63956] group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight leading-tight mb-1">
                    {card.title}
                  </h3>
                  <div className="font-mono text-[11px] font-bold text-[#E63956] uppercase tracking-wider mb-2.5">
                    {card.subtitle}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                    LAUNCH BUILDER
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#E63956] group-hover:translate-y-0.5 transition-all shadow-xs">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
