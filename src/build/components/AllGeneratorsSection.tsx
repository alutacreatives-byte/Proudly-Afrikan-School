import React from 'react';
import { GraduationCap, FileQuestion, FileSpreadsheet, GitBranch, BookOpenText, Presentation, ArrowRight } from 'lucide-react';

interface AllGeneratorsSectionProps {
  onSelectGenerator: (type: string) => void;
}

export const AllGeneratorsSection: React.FC<AllGeneratorsSectionProps> = ({ onSelectGenerator }) => {
  const generators = [
    {
      id: 'course',
      num: '01',
      badge: 'CURRICULUM & MODULES',
      title: 'COURSE SYLLABUS BUILDER',
      desc: 'Design multi-week academic course modules with learning outcomes, pacing, and capstone projects.',
      icon: GraduationCap,
      actionText: 'CREATE COURSE',
    },
    {
      id: 'exam',
      num: '02',
      badge: 'ASSESSMENT & TESTING',
      title: 'EXAM & QUIZ GENERATOR',
      desc: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.',
      icon: FileQuestion,
      actionText: 'CREATE EXAM',
    },
    {
      id: 'worksheet',
      num: '03',
      badge: 'PRACTICE & EXERCISES',
      title: 'WORKSHEET GENERATOR',
      desc: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.',
      icon: FileSpreadsheet,
      actionText: 'CREATE WORKSHEET',
    },
    {
      id: 'mindmap',
      num: '04',
      badge: 'VISUAL HIERARCHY',
      title: 'MIND MAP GENERATOR',
      desc: 'Transform topics, notes, or uploaded documents into interactive, editable visual mind maps with branching concepts.',
      icon: GitBranch,
      actionText: 'CREATE MIND MAP',
    },
    {
      id: 'lessonplan',
      num: '05',
      badge: 'TEACHING & PEDAGOGY',
      title: 'LESSON PLAN GENERATOR',
      desc: 'Create pedagogical lesson plans with timed phases, Bloom’s taxonomy objectives, and assessment checks.',
      icon: BookOpenText,
      actionText: 'CREATE LESSON PLAN',
    },
    {
      id: 'presentation',
      num: '06',
      badge: 'SLIDES & LECTURE',
      title: 'PRESENTATION GENERATOR',
      desc: 'Generate structured slide outlines with presenter notes, discussion prompts, and visual cues.',
      icon: Presentation,
      actionText: 'CREATE SLIDES',
    },
  ];

  return (
    <section className="py-12 border-b border-stone-200/80">
      <div className="space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-stone-200/80 gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956] block mb-2">
              RESOURCE GENERATOR SUITE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              ALL 6 GENERATORS.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold text-stone-500 uppercase">
            <span>All Tools</span>
            <span>&bull;</span>
            <span>Support</span>
            <span>&bull;</span>
            <span>Optional Document Uploads</span>
          </div>
        </div>

        {/* 6 Generators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generators.map((gen) => {
            const Icon = gen.icon;
            const isFeatured = gen.id === 'lessonplan';

            return (
              <div
                key={gen.id}
                onClick={() => onSelectGenerator(gen.id)}
                className={`rounded-[2rem] border transition-all p-7 sm:p-8 flex flex-col justify-between cursor-pointer group ${
                  isFeatured
                    ? 'bg-white border-[#E63956] shadow-[0_20px_50px_rgba(230,57,86,0.12)] ring-2 ring-[#E63956]/20'
                    : 'bg-white border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-stone-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display font-black text-3xl text-stone-400 group-hover:text-[#E63956] transition-colors">
                      {gen.num}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isFeatured ? 'bg-[#E63956] text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {gen.badge}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-all shadow-xs ${
                    isFeatured ? 'bg-[#E63956] text-white' : 'bg-[#18181B] text-[#E63956]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className={`font-display font-black text-xl sm:text-2xl uppercase tracking-tight mb-2 ${
                    isFeatured ? 'text-[#E63956]' : 'text-stone-900'
                  }`}>
                    {gen.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {gen.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                    {gen.actionText}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-all shadow-xs ${
                    isFeatured ? 'bg-[#E63956] text-white' : 'bg-[#18181B] text-white'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
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
