import React, { useState } from 'react';
import { Sparkles, ChevronDown, FileText, Printer, BookmarkCheck } from 'lucide-react';

export const BuildFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'HOW DOES PROUDLY AFRIKAN BUILD USE GEMINI 3.7 FLASH?',
      answer: 'Proudly Afrikan Build leverages Google’s state-of-the-art Gemini models to rapidly analyze topics, extract pedagogical hierarchies, formulate rigorous questions, and synthesize curriculum-aligned worksheets and lesson plans with high factual accuracy.',
      icon: Sparkles,
      highlight: true,
    },
    {
      question: 'CAN I USE MY OWN PDF, DOC, OR DOCX DOCUMENTS AS SOURCE MATERIAL?',
      answer: 'Yes! You can drop in any PDF, Word document, syllabus, or teacher notes up to 25 pages. Our document AI engine extracts and indexes the text to ground every generated exam, quiz, or lesson plan precisely in your source material.',
      icon: FileText,
      highlight: false,
    },
    {
      question: 'CAN I PRINT OR EXPORT THE GENERATED WORKSHEETS AND EXAMS?',
      answer: 'Every generated resource can be instantly exported, printed cleanly in standard PDF layout, or copied to your clipboard with one click. Answer keys and marking rubrics are formatted separately for teacher convenience.',
      icon: Printer,
      highlight: false,
    },
    {
      question: 'IS MY SAVED WORK PRESERVED BETWEEN SESSIONS?',
      answer: 'Yes, all generated exams, worksheets, courses, and lesson plans are automatically saved to your secure local storage and accessible across your My Sets and Build workspaces anytime.',
      icon: BookmarkCheck,
      highlight: false,
    },
  ];

  return (
    <section className="py-12">
      <div className="space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-stone-200/80 gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956] block mb-2">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              FREQUENTLY ASKED.
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Everything you need to know about generating exams, worksheets, lesson plans, and classroom resources.
          </p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const Icon = faq.icon;

            return (
              <div
                key={index}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`rounded-2xl border transition-all cursor-pointer ${
                  faq.highlight
                    ? 'bg-white border-[#E63956] shadow-[0_10px_30px_rgba(230,57,86,0.1)] ring-1 ring-[#E63956]/20'
                    : 'bg-white border-stone-200 shadow-sm hover:border-stone-400'
                }`}
              >
                <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      faq.highlight ? 'bg-[#E63956] text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-display font-black text-base sm:text-lg uppercase tracking-tight ${
                      faq.highlight ? 'text-[#E63956]' : 'text-stone-900'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-stone-100 text-stone-900' : 'bg-stone-50 text-stone-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 border-t border-stone-100 mt-2">
                    <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
