import React, { useState } from 'react';
import { ChevronDown, Sparkles, FileText, Printer, BookmarkCheck } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'HOW DOES PROUDLY AFRIKAN BUILD USE GEMINI 3.7 FLASH?',
    answer:
      "Proudly Afrikan Build leverages Google's state-of-the-art Gemini models to rapidly analyze topics, extract pedagogical hierarchies, formulate rigorous questions, and synthesize curriculum-aligned worksheets and lesson plans with high factual accuracy.",
    icon: Sparkles,
  },
  {
    id: 'faq-2',
    question: 'CAN I USE MY OWN PDF, DOC, OR DOCX DOCUMENTS AS SOURCE MATERIAL?',
    answer:
      'Yes. You can upload textbook chapters, curriculum outlines, lecture notes, or syllabus docs directly. Our client-side document processing securely parses your document text and injects verified context into the builder.',
    icon: FileText,
  },
  {
    id: 'faq-3',
    question: 'CAN I PRINT OR EXPORT THE GENERATED WORKSHEETS AND EXAMS?',
    answer:
      'Absolutely. Every generated worksheet, exam, lesson plan, and mind map includes instant one-click Print/PDF export formatted specifically for standard paper printing and classroom handouts, as well as clipboard copying.',
    icon: Printer,
  },
  {
    id: 'faq-4',
    question: 'IS MY SAVED WORK PRESERVED BETWEEN SESSIONS?',
    answer:
      "Yes! All created worksheets, exams, mind maps, and curriculum resources are automatically indexed and saved to your local storage, accessible at any time under the 'My Saved Builds' or 'MY SETS' navigation.",
    icon: BookmarkCheck,
  },
];

export const BuildFaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="space-y-8 pt-6 pb-8 border-t border-stone-200/80">
      {/* Section Heading */}
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

      {/* Accordion FAQ List */}
      <div className="space-y-4 max-w-5xl mx-auto">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;

          return (
            <div
              key={faq.id}
              className={`rounded-[2rem] border transition-all overflow-hidden bg-white ${
                isOpen
                  ? 'border-[#E63956] shadow-[0_16px_40px_rgba(230,57,86,0.12)] ring-1 ring-[#E63956]/20'
                  : 'border-stone-200/90 shadow-xs hover:border-stone-400/80 hover:shadow-md'
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#E63956] text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-display font-black text-base sm:text-lg md:text-xl uppercase tracking-tight text-[#161616]">
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-stone-100 text-[#E63956]' : 'text-stone-400 bg-stone-50'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-1 border-t border-stone-100 text-stone-700 text-sm sm:text-base leading-relaxed animate-in fade-in-50 duration-150">
                  <p className="pl-14">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
