import React, { useState } from 'react';
import {
  FileCheck2,
  FileSpreadsheet,
  CalendarCheck2,
  FileQuestion,
  BookOpenCheck,
  Presentation,
  GraduationCap,
  Route,
  Type,
  ClipboardList,
  FileUp,
  ArrowDown,
  ChevronDown,
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolGridProps {
  onSelectTool: (toolId: ToolType, initialTopic?: string) => void;
}

interface ToolDefinition {
  id: ToolType;
  number: string;
  name: string;
  category: string;
  description: string;
  buttonText: string;
  supportsUpload: boolean;
  icon: React.ElementType;
}

const TOOLS: ToolDefinition[] = [
  {
    id: 'exam',
    number: '01',
    name: 'EXAM GENERATOR',
    category: 'ASSESSMENT & TESTING',
    description: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.',
    buttonText: 'BUILD EXAM',
    supportsUpload: true,
    icon: FileCheck2,
  },
  {
    id: 'worksheet',
    number: '02',
    name: 'WORKSHEET GENERATOR',
    category: 'PRACTICE & EXERCISES',
    description: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.',
    buttonText: 'BUILD WORKSHEET',
    supportsUpload: true,
    icon: FileSpreadsheet,
  },
  {
    id: 'lesson-plan',
    number: '03',
    name: 'LESSON PLAN GENERATOR',
    category: 'TEACHING & PEDAGOGY',
    description: 'Create pedagogical lesson plans with timed phases, Bloom’s taxonomy objectives, and assessment checks.',
    buttonText: 'BUILD LESSON PLAN',
    supportsUpload: true,
    icon: CalendarCheck2,
  },
  {
    id: 'pdf-quiz',
    number: '04',
    name: 'PDF → QUIZ',
    category: 'DOCUMENT ANALYSIS',
    description: 'Upload course PDFs or textbook chapters to generate grounded multiple-choice & analytical quiz questions.',
    buttonText: 'UPLOAD PDF / DOC',
    supportsUpload: true,
    icon: FileQuestion,
  },
  {
    id: 'pdf-studypack',
    number: '05',
    name: 'PDF → STUDY PACK',
    category: 'DOCUMENT ANALYSIS',
    description: 'Synthesize PDFs into structured study packs with executive summaries, glossaries, and review questions.',
    buttonText: 'UPLOAD PDF / DOC',
    supportsUpload: true,
    icon: BookOpenCheck,
  },
  {
    id: 'presentation',
    number: '06',
    name: 'PRESENTATION GENERATOR',
    category: 'SLIDES & LECTURE',
    description: 'Build polished educational presentations with visual prompts, discussion triggers, and complete speaker notes.',
    buttonText: 'BUILD PRESENTATION',
    supportsUpload: true,
    icon: Presentation,
  },
  {
    id: 'course-builder',
    number: '07',
    name: 'COURSE BUILDER',
    category: 'CURRICULUM & MODULES',
    description: 'Organise lessons, competencies, and assessment milestones into a comprehensive course blueprint.',
    buttonText: 'BUILD COURSE',
    supportsUpload: true,
    icon: GraduationCap,
  },
  {
    id: 'learning-path',
    number: '08',
    name: 'LEARNING PATH BUILDER',
    category: 'STUDENT JOURNEY',
    description: 'Design step-by-step learning roadmaps with progressive checkpoints from beginner to mastery.',
    buttonText: 'BUILD PATH',
    supportsUpload: true,
    icon: Route,
  },
];

const INSPIRATION_TOPICS = [
  { emoji: '👑', label: 'Kingdom of Mali', defaultTool: 'exam' as ToolType },
  { emoji: '🌍', label: 'Great Rift Valley', defaultTool: 'lesson-plan' as ToolType },
  { emoji: '📚', label: 'African Literature', defaultTool: 'worksheet' as ToolType },
  { emoji: '⚙', label: 'Solar In Africa', defaultTool: 'presentation' as ToolType },
  { emoji: '🌱', label: 'Sustainable Farming', defaultTool: 'course-builder' as ToolType },
  { emoji: '🔬', label: 'Nubian Pyramids', defaultTool: 'exam' as ToolType },
];

const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'CHOOSE YOUR INPUT',
    description: 'Type a topic, paste lecture notes or syllabus text, or attach any PDF/DOC/DOCX source material.',
  },
  {
    number: '02',
    title: 'CONFIGURE CRITERIA',
    description: 'Customize target grade level, curriculum standards, question counts, marks, and duration.',
  },
  {
    number: '03',
    title: 'GENERATE WITH GEMINI',
    description: 'Gemini 3.7 Flash analyzes pedagogical requirements and synthesizes structured materials instantly.',
  },
  {
    number: '04',
    title: 'INSPECT & REFINE',
    description: 'Review interactive question banks, slide previews, lesson timings, and full teacher marking rubrics.',
  },
  {
    number: '05',
    title: 'SAVE, PRINT & EXPORT',
    description: 'Store in My Builds, export print-ready PDF/Worksheets, or copy clean structured JSON payloads.',
  },
];

const FAQS = [
  {
    q: 'How does Proudly Afrikan Build use Gemini 3.7 Flash?',
    a: 'We leverage Gemini 3.7 Flash server-side to generate grounded, curriculum-aligned educational materials with high reasoning depth, structured JSON schemas, and culturally relevant context across all African regions.',
  },
  {
    q: 'Can I use my own PDF, DOC, or DOCX documents as source material?',
    a: 'Yes! Every single one of our 8 tools includes an optional Source Document Upload field. You can upload textbook chapters, lecture notes, or syllabus docs (PDF/DOC/DOCX) to ground the generated questions and lessons directly in your specific material.',
  },
  {
    q: 'Can I print or export the generated worksheets and exams?',
    a: 'Every generated resource includes a clean, distraction-free Print View optimized for physical classroom handouts, alongside one-click JSON payload exports.',
  },
  {
    q: 'Is my saved work preserved between sessions?',
    a: 'Yes. All created resources are safely stored in your local My Builds library with full search, tag filtering, duplication, and favorite bookmarking capabilities.',
  },
];

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [selectedInputMode, setSelectedInputMode] = useState<'type' | 'paste' | 'upload'>('type');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleModeClick = (mode: 'type' | 'paste' | 'upload') => {
    setSelectedInputMode(mode);
    if (mode === 'type') {
      onSelectTool('exam');
    } else if (mode === 'paste') {
      onSelectTool('worksheet');
    } else if (mode === 'upload') {
      onSelectTool('pdf-quiz');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="pt-2 pb-8 border-b border-stone-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            {/* Edition Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-stone-300/80 rounded-full shadow-sm text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6425E] inline-block animate-pulse"></span>
              <span>PROUDLY AFRIKAN EDUCATION • RESOURCE BUILDER</span>
            </div>

            {/* Giant Oversized Display Headline */}
            <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.25rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
              BUILD<br />
              ANYTHING.<br />
              <span className="text-[#E6425E]">
                ABOUT<br />
                ANYTHING.
              </span>
            </h1>

            {/* Clear, comfortable, easy-to-read subtext */}
            <p className="text-base sm:text-lg lg:text-xl xl:text-[1.3rem] text-stone-700 font-normal leading-[1.65] max-w-2xl">
              Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, and interactive courses in seconds.
            </p>

            {/* Action Buttons - Fully Responsive */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <button
                onClick={() => onSelectTool('exam')}
                className="w-full sm:w-auto px-7 sm:px-8 py-4 bg-[#E6425E] hover:bg-[#cf354f] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_4px_18px_rgba(230,66,94,0.38)] transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <span>BUILD AN EXAM / WORKSHEET</span>
              </button>

              <button
                onClick={() => onSelectTool('pdf-quiz')}
                className="w-full sm:w-auto px-7 py-4 bg-[#18181B] hover:bg-stone-900 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>UPLOAD PDF / DOC</span>
              </button>
            </div>
          </div>

          {/* Right Column: Instant Inspiration Card & Metrics */}
          <div className="lg:col-span-5 space-y-5 lg:pt-4">
            {/* Instant Inspiration Elevated Rounded Card */}
            <div className="bg-[#FAF8F5] border-2 border-stone-200/90 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                  <span className="text-[#E6425E] text-sm">❖</span>
                  <span>INSTANT INSPIRATION</span>
                </div>
                <span className="font-mono text-xs text-stone-400 font-bold uppercase tracking-wider">
                  TAP TO TRY
                </span>
              </div>

              {/* 2-Column Pill Button Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INSPIRATION_TOPICS.map((topic, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => onSelectTool(topic.defaultTool, topic.label)}
                    className="px-3.5 py-2.5 bg-white hover:bg-rose-50/60 border border-stone-200/90 hover:border-rose-300 text-stone-800 hover:text-[#E6425E] font-medium text-xs sm:text-sm rounded-full transition-all shadow-sm flex items-center gap-2 text-left truncate cursor-pointer"
                  >
                    <span className="shrink-0">{topic.emoji}</span>
                    <span className="truncate">{topic.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs font-mono text-stone-500 font-medium">
                  * Click any topic above to launch pre-filled workbench.
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar in Rounded Pill Container */}
            <div className="grid grid-cols-3 gap-2 bg-white border border-stone-200/90 p-3.5 rounded-2xl shadow-sm">
              <div className="text-center border-r border-stone-200 pr-2">
                <div className="font-mono text-lg sm:text-xl font-black text-[#E6425E] flex items-center justify-center gap-1">
                  8
                </div>
                <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Generators
                </div>
              </div>

              <div className="text-center border-r border-stone-200 px-2">
                <div className="font-mono text-lg sm:text-xl font-black text-stone-800">
                  PDF
                </div>
                <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Document AI
                </div>
              </div>

              <div className="text-center pl-2">
                <div className="font-mono text-lg sm:text-xl font-black text-[#E6425E]">
                  CAPS
                </div>
                <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                  IEB Aligned
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE WAYS TO CREATE SECTION (3D CLAY CARDS) */}
      <section id="builder-modes" className="space-y-6 pt-8 border-t border-stone-300/70">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
          <div>
            <span className="font-mono-code text-xs sm:text-sm font-bold text-[#D63651] uppercase tracking-widest block mb-1">
              FLEXIBLE INPUT MODES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#181716] tracking-tight uppercase leading-none">
              THREE WAYS TO CREATE.
            </h2>
          </div>
          <p className="font-mono-code text-sm sm:text-base text-stone-700 font-medium max-w-md">
            Select an input method below to immediately jump into the resource generator workbench.
          </p>
        </div>

        {/* 3 Large 3D Input Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 01: TYPE IT */}
          <div
            onClick={() => handleModeClick('type')}
            className={`clay-card-3d-interactive p-6 sm:p-8 cursor-pointer flex flex-col justify-between group ${
              selectedInputMode === 'type' ? 'ring-2 ring-[#D63651]' : ''
            }`}
          >
            <div className="space-y-4">
              {/* Header: 01 & FASTEST Tag */}
              <div className="flex items-center justify-between">
                <span className="font-mono-code font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#181716] transition-colors">
                  01
                </span>
                <span className="clay-btn-crimson text-xs font-mono-code font-bold uppercase tracking-wider px-3.5 py-1">
                  FASTEST
                </span>
              </div>

              {/* 3D Icon Container */}
              <div className="w-14 h-14 rounded-2xl clay-btn-dark flex items-center justify-center">
                <Type className="w-7 h-7 text-[#E6425E]" />
              </div>

              {/* Title & Category */}
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#181716] uppercase tracking-tight group-hover:text-[#D63651] transition-colors">
                  TYPE IT.
                </h3>
                <p className="font-mono-code text-sm font-bold text-[#D63651] uppercase tracking-wider mt-1">
                  Topic &amp; Idea Mode
                </p>
              </div>

              {/* Description */}
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
                Enter any topic, curriculum subject, or concept and let AI craft a structured resource instantly.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-8 pt-5 border-t border-stone-200/90 flex items-center justify-between">
              <span className="font-mono-code text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                LAUNCH BUILDER
              </span>
              <div className="w-9 h-9 rounded-full clay-btn-dark flex items-center justify-center group-hover:bg-[#D63651] transition-colors">
                <ArrowDown className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Card 02: PASTE IT */}
          <div
            onClick={() => handleModeClick('paste')}
            className={`clay-card-3d-interactive p-6 sm:p-8 cursor-pointer flex flex-col justify-between group ${
              selectedInputMode === 'paste' ? 'ring-2 ring-[#D63651]' : ''
            }`}
          >
            <div className="space-y-4">
              {/* Header: 02 & DEEP CONTEXT Tag */}
              <div className="flex items-center justify-between">
                <span className="font-mono-code font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#181716] transition-colors">
                  02
                </span>
                <span className="clay-pill-3d text-stone-900 text-xs font-mono-code font-bold uppercase tracking-wider px-3.5 py-1">
                  DEEP CONTEXT
                </span>
              </div>

              {/* 3D Icon Container */}
              <div className="w-14 h-14 rounded-2xl clay-btn-dark flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-[#E6425E]" />
              </div>

              {/* Title & Category */}
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#181716] uppercase tracking-tight group-hover:text-[#D63651] transition-colors">
                  PASTE IT.
                </h3>
                <p className="font-mono-code text-sm font-bold text-[#D63651] uppercase tracking-wider mt-1">
                  Notes &amp; Articles
                </p>
              </div>

              {/* Description */}
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
                Paste syllabus paragraphs, lesson transcripts, or curriculum excerpts to ground the generated questions.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-8 pt-5 border-t border-stone-200/90 flex items-center justify-between">
              <span className="font-mono-code text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                LAUNCH BUILDER
              </span>
              <div className="w-9 h-9 rounded-full clay-btn-dark flex items-center justify-center group-hover:bg-[#D63651] transition-colors">
                <ArrowDown className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Card 03: UPLOAD IT */}
          <div
            onClick={() => handleModeClick('upload')}
            className={`clay-card-3d-interactive p-6 sm:p-8 cursor-pointer flex flex-col justify-between group ${
              selectedInputMode === 'upload' ? 'ring-2 ring-[#D63651]' : ''
            }`}
          >
            <div className="space-y-4">
              {/* Header: 03 & PDF / DOC / DOCX Tag */}
              <div className="flex items-center justify-between">
                <span className="font-mono-code font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#181716] transition-colors">
                  03
                </span>
                <span className="clay-btn-dark text-xs font-mono-code font-bold uppercase tracking-wider px-3.5 py-1">
                  PDF • DOC • DOCX
                </span>
              </div>

              {/* 3D Icon Container */}
              <div className="w-14 h-14 rounded-2xl clay-btn-dark flex items-center justify-center">
                <FileUp className="w-7 h-7 text-[#E6425E]" />
              </div>

              {/* Title & Category */}
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#181716] uppercase tracking-tight group-hover:text-[#D63651] transition-colors">
                  UPLOAD IT.
                </h3>
                <p className="font-mono-code text-sm font-bold text-[#D63651] uppercase tracking-wider mt-1">
                  Document &amp; PDF Mode
                </p>
              </div>

              {/* Description */}
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
                Drop in textbook chapters, PDFs, Word docs, or test drafts to extract context and synthesize classroom packs.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-8 pt-5 border-t border-stone-200/90 flex items-center justify-between">
              <span className="font-mono-code text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                LAUNCH BUILDER
              </span>
              <div className="w-9 h-9 rounded-full clay-btn-dark flex items-center justify-center group-hover:bg-[#D63651] transition-colors">
                <ArrowDown className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EIGHT SPECIALIZED BUILD TOOLS (3D TACTILE CARDS WITH LARGER, READABLE FONTS) */}
      <section className="space-y-6 pt-8 border-t border-stone-300/70">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
          <div>
            <span className="font-mono-code text-xs sm:text-sm font-bold text-[#D63651] uppercase tracking-widest block mb-1">
              RESOURCE GENERATOR SUITE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#181716] tracking-tight uppercase leading-none">
              ALL 8 GENERATORS.
            </h2>
          </div>
          <span className="font-mono-code text-xs sm:text-sm font-bold text-stone-700">
            ALL TOOLS SUPPORT OPTIONAL DOCUMENT UPLOADS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="clay-card-3d-interactive p-6 sm:p-7 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Number & Tag */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code font-black text-3xl text-stone-400 group-hover:text-[#181716] transition-colors">
                      {tool.number}
                    </span>
                    <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#D63651] bg-red-50 border border-red-200/90 px-3 py-1 rounded-full shadow-xs">
                      {tool.category}
                    </span>
                  </div>

                  {/* 3D Icon Box */}
                  <div className="w-13 h-13 rounded-2xl clay-btn-dark flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#E6425E]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-xl sm:text-2xl text-[#181716] uppercase tracking-tight group-hover:text-[#D63651] transition-colors leading-tight">
                    {tool.name}
                  </h3>

                  {/* Description - LARGER, HIGH CONTRAST & CLEAR */}
                  <p className="text-stone-800 text-base sm:text-[17px] leading-relaxed font-normal">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-4 border-t border-stone-200/90 flex items-center justify-between">
                  <span className="font-mono-code text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider group-hover:text-[#D63651] transition-colors">
                    {tool.buttonText}
                  </span>
                  <span className="text-base font-black text-stone-500 group-hover:text-[#D63651] group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section id="how-it-works" className="space-y-6 pt-8 border-t border-stone-300/70">
        <div>
          <span className="font-mono-code text-xs sm:text-sm font-bold text-[#D63651] uppercase tracking-widest block mb-1">
            HOW IT WORKS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#181716] tracking-tight uppercase leading-none">
            5-STEP WORKFLOW.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {WORKFLOW_STEPS.map((step, sIdx) => (
            <div
              key={sIdx}
              className="clay-card-3d p-5 sm:p-6 space-y-3"
            >
              <span className="font-mono-code font-black text-3xl text-[#D63651] block drop-shadow-sm">
                {step.number}
              </span>
              <h4 className="font-display font-black text-sm sm:text-base text-[#181716] uppercase tracking-tight">
                {step.title}
              </h4>
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-normal">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq-section" className="space-y-6 pt-8 border-t border-stone-300/70 pb-10">
        <div>
          <span className="font-mono-code text-xs sm:text-sm font-bold text-[#D63651] uppercase tracking-widest block mb-1">
            QUESTIONS &amp; ANSWERS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#181716] tracking-tight uppercase leading-none">
            FREQUENTLY ASKED.
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, fIdx) => {
            const isOpen = openFaqIndex === fIdx;
            return (
              <div
                key={fIdx}
                className="clay-card-3d overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-black text-base sm:text-lg text-[#181716] uppercase tracking-tight">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-500 transition-transform ${
                      isOpen ? 'rotate-180 text-[#D63651]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-base text-stone-700 leading-relaxed font-sans border-t border-stone-200/80 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
