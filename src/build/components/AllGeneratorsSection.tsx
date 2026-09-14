import React from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  FileCheck, 
  Network, 
  BookOpen, 
  Presentation, 
  ArrowUpRight 
} from 'lucide-react';

interface BuildToolItem {
  id: string;
  toolNumber: string;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  btnText: string;
  isFeatured?: boolean;
}

const BUILD_TOOLS: BuildToolItem[] = [
  {
    id: 'course',
    toolNumber: '01',
    tag: 'CURRICULUM & MODULES',
    title: 'COURSE SYLLABUS BUILDER',
    subtitle: 'Design multi-week academic course modules with learning outcomes, pacing, and capstone projects.',
    icon: GraduationCap,
    btnText: 'CREATE COURSE →',
  },
  {
    id: 'classroompack',
    toolNumber: '02',
    tag: 'ASSESSMENT & TESTING',
    title: 'EXAM & QUIZ GENERATOR',
    subtitle: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.',
    icon: HelpCircle,
    btnText: 'CREATE EXAM →',
  },
  {
    id: 'worksheet',
    toolNumber: '03',
    tag: 'PRACTICE & EXERCISES',
    title: 'WORKSHEET GENERATOR',
    subtitle: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.',
    icon: FileCheck,
    btnText: 'CREATE WORKSHEET →',
  },
  {
    id: 'mindmap',
    toolNumber: '04',
    tag: 'VISUAL HIERARCHY',
    title: 'MIND MAP GENERATOR',
    subtitle: 'Transform topics, notes, or uploaded documents into interactive, editable visual mind maps with branching concepts.',
    icon: Network,
    btnText: 'CREATE MIND MAP →',
  },
  {
    id: 'lessonplan',
    toolNumber: '05',
    tag: 'TEACHING & PEDAGOGY',
    title: 'LESSON PLAN GENERATOR',
    subtitle: 'Create pedagogical lesson plans with timed phases, Bloom’s taxonomy objectives, and assessment checks.',
    icon: BookOpen,
    btnText: 'CREATE LESSON PLAN →',
    isFeatured: true,
  },
  {
    id: 'presentation',
    toolNumber: '06',
    tag: 'SLIDES & LECTURE',
    title: 'PRESENTATION GENERATOR',
    subtitle: 'Generate structured slide outlines with presenter notes, discussion prompts, and visual cues.',
    icon: Presentation,
    btnText: 'CREATE SLIDES →',
  },
];

interface AllGeneratorsSectionProps {
  onSelectTool: (toolId: string) => void;
}

export const AllGeneratorsSection: React.FC<AllGeneratorsSectionProps> = ({ onSelectTool }) => {
  return (
    <section id="build-generators-section" className="space-y-6 pt-4 border-t border-stone-200/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2">
        <div>
          <span className="text-xs sm:text-sm font-mono font-bold text-[#FF7A00] uppercase tracking-widest block mb-1.5">
            TEACHING & BUILD SUITE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#161616] tracking-tighter uppercase leading-[0.92]">
            ALL 6 BUILD TOOLS.
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-mono font-bold text-stone-500 uppercase tracking-wider">
          ALL TOOLS SUPPORT OPTIONAL DOCUMENT UPLOADS
        </span>
      </div>

      {/* 6 Generator Cards in 3-column responsive grid matching screenshot layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {BUILD_TOOLS.map((gen) => {
          const Icon = gen.icon;
          const isFeatured = gen.isFeatured;

          return (
            <div
              key={gen.id}
              onClick={() => onSelectTool(gen.id)}
              className={`rounded-[2rem] bg-white transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer group ${
                isFeatured
                  ? 'border-2 border-[#E11D48] shadow-[0_16px_40px_rgba(225,29,72,0.12)] hover:shadow-[0_24px_50px_rgba(225,29,72,0.2)]'
                  : 'border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_rgba(255,122,0,0.12)] hover:border-[#FF7A00]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-display font-black text-3xl sm:text-4xl transition-colors ${
                    isFeatured ? 'text-[#E11D48]/70 group-hover:text-[#E11D48]' : 'text-stone-400 group-hover:text-[#FF7A00]'
                  }`}>
                    {gen.toolNumber}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isFeatured 
                      ? 'bg-[#E11D48] text-white shadow-xs' 
                      : 'bg-stone-100 text-stone-600 border border-stone-200/80'
                  }`}>
                    {gen.tag}
                  </span>
                </div>

                <div className={`w-11 h-11 rounded-full flex items-center justify-center my-4 group-hover:scale-105 transition-all shadow-xs ${
                  isFeatured
                    ? 'bg-[#E11D48] text-white'
                    : 'bg-[#18181B] text-white group-hover:bg-[#FF7A00]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className={`font-display font-black text-lg sm:text-xl uppercase mb-2 leading-tight transition-colors ${
                  isFeatured
                    ? 'text-[#E11D48]'
                    : 'text-[#161616] group-hover:text-[#FF7A00]'
                }`}>
                  {gen.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                  {gen.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className={`font-display font-black text-xs uppercase tracking-wider transition-colors ${
                  isFeatured ? 'text-[#E11D48]' : 'text-stone-900 group-hover:text-[#FF7A00]'
                }`}>
                  {gen.btnText}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isFeatured 
                    ? 'bg-[#E11D48] text-white' 
                    : 'bg-[#18181B] text-white group-hover:bg-[#FF7A00] group-hover:translate-x-0.5'
                }`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


