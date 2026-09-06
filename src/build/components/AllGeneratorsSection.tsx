import React from 'react';
import { 
  FileText, 
  Layers, 
  GitBranch, 
  BookOpen, 
  Presentation, 
  GraduationCap, 
  ArrowUpRight
} from 'lucide-react';
import { BuildToolType } from '../types';

interface ToolItem {
  id: BuildToolType;
  toolNumber: string;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  btnText: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'course-builder',
    toolNumber: '01',
    tag: 'CURRICULUM & MODULES',
    title: 'COURSE SYLLABUS BUILDER',
    subtitle: 'Design multi-week academic course modules with learning outcomes, pacing, and capstone projects.',
    icon: GraduationCap,
    btnText: 'CREATE COURSE →',
  },
  {
    id: 'exam',
    toolNumber: '02',
    tag: 'ASSESSMENT & TESTING',
    title: 'EXAM & QUIZ GENERATOR',
    subtitle: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.',
    icon: FileText,
    btnText: 'CREATE EXAM →',
  },
  {
    id: 'worksheet',
    toolNumber: '03',
    tag: 'PRACTICE & EXERCISES',
    title: 'WORKSHEET GENERATOR',
    subtitle: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.',
    icon: Layers,
    btnText: 'CREATE WORKSHEET →',
  },
  {
    id: 'mind-map',
    toolNumber: '04',
    tag: 'VISUAL HIERARCHY',
    title: 'MIND MAP GENERATOR',
    subtitle: 'Transform topics, notes, or uploaded documents into interactive, editable visual mind maps with branching concepts.',
    icon: GitBranch,
    btnText: 'CREATE MIND MAP →',
  },
  {
    id: 'lesson-plan',
    toolNumber: '05',
    tag: 'TEACHING & PEDAGOGY',
    title: 'LESSON PLAN GENERATOR',
    subtitle: "Create pedagogical lesson plans with timed phases, Bloom's taxonomy objectives, and assessment checks.",
    icon: BookOpen,
    btnText: 'CREATE LESSON PLAN →',
  },
  {
    id: 'pdf-studypack',
    toolNumber: '06',
    tag: 'DOCUMENT ANALYSIS',
    title: 'PDF TO STUDY PACK',
    subtitle: 'Upload course PDFs or textbook chapters to produce executive summaries, core pillars, and flashpoints.',
    icon: FileText,
    btnText: 'UPLOAD PDF / DOC →',
  },
  {
    id: 'presentation',
    toolNumber: '07',
    tag: 'SLIDES & LECTURE',
    title: 'PRESENTATION GENERATOR',
    subtitle: 'Generate structured slide outlines with presenter notes, discussion prompts, and visual cues.',
    icon: Presentation,
    btnText: 'CREATE SLIDES →',
  },
];

interface AllGeneratorsSectionProps {
  onSelectTool: (toolId: BuildToolType) => void;
}

export const AllGeneratorsSection: React.FC<AllGeneratorsSectionProps> = ({
  onSelectTool,
}) => {
  return (
    <section id="all-generators-section" className="space-y-6 pt-4 border-t border-stone-200/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2">
        <div>
          <span className="text-xs sm:text-sm font-mono font-bold text-[#E63956] uppercase tracking-widest block mb-1.5">
            RESOURCE GENERATOR SUITE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#161616] tracking-tighter uppercase leading-[0.92]">
            ALL 7 GENERATORS.
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-mono font-bold text-stone-500 uppercase tracking-wider">
          ALL TOOLS SUPPORT OPTIONAL DOCUMENT UPLOADS
        </span>
      </div>

      {/* 7 Generator Cards in responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {TOOLS.map((gen) => {
          const Icon = gen.icon;
          return (
            <div
              key={gen.id}
              onClick={() => onSelectTool(gen.id)}
              className="rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_rgba(230,57,86,0.12)] hover:border-[#E63956]/40 transition-all p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-black text-2xl text-stone-400 group-hover:text-[#E63956] transition-colors">
                    {gen.toolNumber}
                  </span>
                  <span className="rounded-full px-3 py-1 bg-pink-50/70 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase tracking-wider">
                    {gen.tag}
                  </span>
                </div>

                <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#E63956] flex items-center justify-center my-3 group-hover:scale-105 group-hover:bg-[#E63956] group-hover:text-white transition-all shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-display font-black text-lg sm:text-xl uppercase text-[#161616] mb-2 leading-tight group-hover:text-[#E63956] transition-colors">
                  {gen.title}
                </h3>

                <p className="text-sm text-stone-600 font-normal leading-relaxed">
                  {gen.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="font-display font-black text-xs uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                  {gen.btnText}
                </span>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#E63956] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
