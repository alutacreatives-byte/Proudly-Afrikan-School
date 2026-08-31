import React from 'react';
import { 
  FileText, 
  Layers, 
  GitBranch, 
  BookOpen, 
  Presentation, 
  GraduationCap, 
  Compass, 
  Sparkles,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { BuildToolType } from '../types';

interface ToolItem {
  id: BuildToolType;
  toolNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  accentColor: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'exam',
    toolNumber: 'TOOL 01',
    title: 'Exam Generator',
    subtitle: 'Comprehensive Examination Paper',
    description: 'Structured exams up to 10 pages with subject categories, multiple choice grids, and official marking schemes at the end.',
    icon: FileText,
    badge: 'Popular',
    accentColor: '#D92B8A',
  },
  {
    id: 'worksheet',
    toolNumber: 'TOOL 02',
    title: 'Worksheet Generator',
    subtitle: 'Classroom & Homework Activities',
    description: 'Custom printable worksheets up to 10 pages featuring matching, fill-in-blanks, short answer prompts, and full teacher solutions.',
    icon: Layers,
    accentColor: '#E05A2B',
  },
  {
    id: 'mind-map',
    toolNumber: 'TOOL 03',
    title: 'Mind Map Generator',
    subtitle: 'Visual Conceptual Hierarchy Engine',
    description: 'Transform topics, notes, or uploaded documents into interactive, editable visual mind maps with branching concepts and export tools.',
    icon: GitBranch,
    badge: 'New Tool',
    accentColor: '#D92B8A',
  },
  {
    id: 'lesson-plan',
    toolNumber: 'TOOL 04',
    title: 'Lesson Plan Generator',
    subtitle: 'Structured Pedagogical Frameworks',
    description: 'Time-sequenced lesson phases, teacher and student activities, differentiation guidelines, and formative assessment strategies.',
    icon: BookOpen,
    accentColor: '#059669',
  },
  {
    id: 'pdf-studypack',
    toolNumber: 'TOOL 05',
    title: 'PDF → Study Pack',
    subtitle: 'Document Synthesis & Revision Guides',
    description: 'Upload textbook chapters or lecture slides to produce executive summaries, core conceptual pillars, flashpoints, and glossaries.',
    icon: FileText,
    badge: 'AI Grounded',
    accentColor: '#2563EB',
  },
  {
    id: 'presentation',
    toolNumber: 'TOOL 06',
    title: 'Presentation Deck',
    subtitle: 'Slide Decks & Speaker Notes',
    description: 'Create multi-slide educational presentations with clear visual talking points, audience discussions, and detailed speaker scripts.',
    icon: Presentation,
    accentColor: '#9333EA',
  },
  {
    id: 'course-builder',
    toolNumber: 'TOOL 07',
    title: 'Course Builder',
    subtitle: 'Multi-Week Curriculum Architect',
    description: 'Design complete courses with weekly modules, granular lesson objectives, outcomes, and comprehensive syllabus documentation.',
    icon: GraduationCap,
    accentColor: '#D97706',
  },
  {
    id: 'learning-path',
    toolNumber: 'TOOL 08',
    title: 'Learning Path Builder',
    subtitle: 'Progressive Mastery Roadmaps',
    description: 'Strategic step-by-step pathways guiding learners from foundational knowledge to advanced mastery through milestone capstones.',
    icon: Compass,
    accentColor: '#0284C7',
  },
];

interface ToolGridProps {
  onSelectTool: (toolId: BuildToolType) => void;
  onOpenMyResources: () => void;
  savedCount: number;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Header Section */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#D92B8A] text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            AI Resource Generation Studio
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
            Proudly Afrikan Build Suite
          </h1>
          <p className="font-sans text-sm sm:text-base text-stone-600 leading-relaxed">
            Synthesize high-yield pedagogical tools, printable examinations with solutions, interactive visual mind maps, worksheets, and study packs grounded in rigorous curricula.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMyResources}
          className="px-5 py-3 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer self-start md:self-center"
        >
          <Bookmark className="w-4 h-4 text-[#D92B8A]" />
          <span>My Saved Builds</span>
          {savedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#D92B8A] text-white text-[11px] font-mono">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      {/* 8-Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group bg-white border border-[#E5E0D8] hover:border-[#161616] rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header with tool tag & badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-black tracking-widest text-stone-600 uppercase">
                    {tool.toolNumber}
                  </span>
                  {tool.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-pink-50 text-[#D92B8A] border border-pink-200">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-display font-black text-lg text-[#161616] uppercase tracking-tight group-hover:text-[#D92B8A] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="font-mono text-xs text-stone-600 font-bold">
                    {tool.subtitle}
                  </p>
                  <p className="font-sans text-xs text-stone-600 leading-relaxed pt-1 line-clamp-3">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Pill */}
              <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-mono font-bold text-[#161616] group-hover:text-[#D92B8A]">
                <span>Launch Tool</span>
                <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#D92B8A] group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
