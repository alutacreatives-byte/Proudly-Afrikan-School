import React, { useState } from 'react';
import {
  FileQuestion,
  FileSpreadsheet,
  BookOpen,
  Presentation,
  GraduationCap,
  Compass,
  FileText,
  Sparkles,
  Award,
  ArrowRight,
  FolderOpen,
  CheckCircle2,
  Upload,
  Layers,
  Check,
  Search,
  BookMarked
} from 'lucide-react';
import { BuildToolType } from '../types';
import { SourceMaterialUpload } from './SourceMaterialUpload';

interface BuildHomeProps {
  onSelectTool: (toolId: BuildToolType, prefillTopic?: string, prefillSubject?: string, sourceMaterial?: string, sourceFileName?: string) => void;
  onOpenMyResources: () => void;
  savedCount: number;
}

export const BuildHome: React.FC<BuildHomeProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount,
}) => {
  // Quick Starter Input Workbench state
  const [topicInput, setTopicInput] = useState<string>('');
  const [subjectInput, setSubjectInput] = useState<string>('AFRICAN HISTORY');
  const [gradeInput, setGradeInput] = useState<string>('Senior Secondary / High School (Grades 9-12)');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [showUpload, setShowUpload] = useState<boolean>(false);

  const sampleStarters = [
    {
      title: 'Resistance to Colonial Rule & The Battle of Adwa',
      subject: 'AFRICAN HISTORY',
      tool: 'exam' as BuildToolType,
      toolLabel: 'Exam Paper',
    },
    {
      title: "Newton's Laws & Conservation of Momentum",
      subject: 'PHYSICAL SCIENCES',
      tool: 'worksheet' as BuildToolType,
      toolLabel: 'Classroom Worksheet',
    },
    {
      title: 'Great Zimbabwe: Architecture & Indian Ocean Trade',
      subject: 'AFRICAN HISTORY',
      tool: 'lesson-plan' as BuildToolType,
      toolLabel: 'Lesson Plan',
    },
    {
      title: 'Pan-African Economic Integration & The AfCFTA',
      subject: 'PAN-AFRICAN STUDIES',
      tool: 'presentation' as BuildToolType,
      toolLabel: 'Slide Deck',
    },
    {
      title: 'Agroecology & Sahelian Climate Strategies',
      subject: 'ENVIRONMENT & AGROECOLOGY',
      tool: 'course' as BuildToolType,
      toolLabel: 'Course Syllabus',
    },
  ];

  const tools: Array<{
    id: BuildToolType;
    title: string;
    description: string;
    icon: React.ElementType;
    credits: number;
    badge: string;
    tags: string[];
    accentColor: string;
  }> = [
    {
      id: 'exam',
      title: 'Exam Paper & Marking Scheme',
      description:
        'Author complete academic examinations with Section A (Multiple Choice), Section B (Structured & Problem Solving), weighted marks, and a full teacher marking memo.',
      icon: FileQuestion,
      credits: 30,
      badge: 'Assessment Suite',
      tags: ['Section A & B', 'Marking Memo', 'CAPS Aligned', 'Print Ready'],
      accentColor: '#E05A2B',
    },
    {
      id: 'worksheet',
      title: 'Classroom Mastery Worksheet',
      description:
        'Generate printable student activity sheets with concept matching, fill-in-the-blanks, structured analysis, student score headers, and an automated teacher solution key.',
      icon: FileSpreadsheet,
      credits: 25,
      badge: 'Classroom Practice',
      tags: ['Student Header', 'Matching', 'Fill Blanks', 'Teacher Key'],
      accentColor: '#059669',
    },
    {
      id: 'lesson-plan',
      title: 'Pedagogical Lesson Plan',
      description:
        'Formulate structured 4-phase pedagogical lessons (Hook, Direct Instruction, Guided Practice, Exit Ticket), learning objectives, and tiered differentiation.',
      icon: BookOpen,
      credits: 30,
      badge: 'Pedagogy & Curriculum',
      tags: ['4-Phase Timeline', 'Exit Ticket', 'Bloom Taxonomy', 'Differentiation'],
      accentColor: '#2563EB',
    },
    {
      id: 'presentation',
      title: 'Presentation Slide Deck',
      description:
        'Design modular educational slide decks with concise bullet points, speaker guidance notes, visual/diagram suggestions, and presenter mode.',
      icon: Presentation,
      credits: 50,
      badge: 'Slide Architecture',
      tags: ['Speaker Notes', 'Visual Prompts', 'Presenter Mode', 'Printable Handout'],
      accentColor: '#D97706',
    },
    {
      id: 'course',
      title: 'Curriculum Course Builder',
      description:
        'Architect multi-week academic syllabi with terminal competencies, modular breakdown, weekly lesson objectives, applied practical labs, and capstone projects.',
      icon: GraduationCap,
      credits: 75,
      badge: 'Master Blueprint',
      tags: ['Multi-Week Modules', 'Lessons', 'Capstone Project', 'Syllabus'],
      accentColor: '#7C3AED',
    },
    {
      id: 'learning-path',
      title: 'Career & Learning Path Roadmap',
      description:
        'Formulate progressive career roadmaps through 4 developmental stages, portfolio milestone projects, core competencies, and industry exit benchmarks.',
      icon: Compass,
      credits: 75,
      badge: 'Career Strategy',
      tags: ['4 Stages', 'Milestone Labs', 'Competency Map', 'Cert Criteria'],
      accentColor: '#0D9488',
    },
    {
      id: 'pdf-quiz',
      title: 'PDF to Grounded Quiz',
      description:
        'Extract text from any PDF or syllabus document to generate rigorous assessment questions strictly grounded in the document, with cited quotes and explanations.',
      icon: FileText,
      credits: 10,
      badge: 'Document Assessment',
      tags: ['Strict Grounding', 'Cited Quotes', 'Multiple Choice', 'Answer Keys'],
      accentColor: '#9333EA',
    },
    {
      id: 'pdf-studypack',
      title: 'PDF High-Yield Study Pack',
      description:
        'Synthesize long documents into executive overviews, high-yield revision points, essential domain glossaries, and interactive self-check questions.',
      icon: BookMarked,
      credits: 40,
      badge: 'Document Intelligence',
      tags: ['Executive Synopsis', 'Revision Points', 'Glossary', 'Self Checks'],
      accentColor: '#DC2626',
    },
  ];

  const handleLaunch = (toolId: BuildToolType) => {
    onSelectTool(
      toolId,
      topicInput.trim() || undefined,
      subjectInput,
      sourceMaterial.trim() || undefined,
      sourceFileName || undefined
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Build Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-[#18181B] text-white p-8 sm:p-14 shadow-xl border border-stone-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5]/10 border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#E05A2B]" />
            <span>Curriculum & Resource Builder Studio</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-white">
            Author Rigorous Curriculum & Educational Tools
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Equipping educators, scholars, and curriculum architects to generate CAPS and IEB-aligned examination papers, interactive worksheets, 4-phase pedagogical lesson plans, slide decks, and comprehensive course syllabi.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('authoring-suites-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-full bg-[#E05A2B] hover:bg-[#c94d22] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Explore 8 Authoring Suites</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenMyResources}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-display font-black text-xs uppercase tracking-wider transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-[#E05A2B]" />
              <span>My Authored Library ({savedCount})</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="relative z-10 mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '8 AUTHORING SUITES', sub: 'Exams, Lessons, Courses' },
            { label: 'EXAM RUBRICS', sub: 'Section A, B & Moderation' },
            { label: 'INSTANT PRINT & EXPORT', sub: 'Clean Academic PDF Layout' },
            { label: 'STUDY SYNC', sub: 'Exportable to Study Workspace' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="font-mono text-xs font-bold text-[#E05A2B]">
                {item.label}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick-Start Workbench Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E05A2B]" />
              <span>Curriculum Quick-Starter Workbench</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Enter your topic, subject, or upload source syllabus text to prefill your authoring suite.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 rounded-full border border-stone-200 hover:border-stone-400 bg-[#FAF8F5] text-stone-800 text-xs font-display font-bold uppercase transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 text-[#E05A2B]" />
            <span>{showUpload ? 'Hide Document Upload' : 'Upload Source Notes / PDF'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Subject / Academic Domain
            </label>
            <select
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="AFRICAN HISTORY">African History & Heritage</option>
              <option value="PAN-AFRICAN STUDIES">Pan-African Studies & Geopolitics</option>
              <option value="PHYSICAL SCIENCES">Physical Sciences & Chemistry</option>
              <option value="LIFE SCIENCES">Life Sciences & Ecology</option>
              <option value="MATHEMATICS">Mathematics & Geometry</option>
              <option value="GEOGRAPHY & CLIMATE">Geography & Climatology</option>
              <option value="ECONOMICS & COMMERCE">Economics & Trade</option>
              <option value="ENVIRONMENT & AGROECOLOGY">Environmental Systems</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Curriculum Topic / Focus Concept
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Resistance to Colonial Rule & The Battle of Adwa"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>
        </div>

        {/* Optional Upload View */}
        {showUpload && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Upload Source Document / Curriculum Notes
            </label>
            <SourceMaterialUpload
              sourceMaterial={sourceMaterial}
              sourceFileName={sourceFileName}
              onTextExtracted={(text, filename) => {
                setSourceMaterial(text);
                if (filename) setSourceFileName(filename);
              }}
              onClear={() => {
                setSourceMaterial('');
                setSourceFileName('');
              }}
            />
          </div>
        )}

        {/* Quick Sample Starters */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="font-display font-bold text-xs uppercase tracking-wider text-stone-500">
            Or Choose A Sample Curriculum Topic:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sampleStarters.map((starter, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  setTopicInput(starter.title);
                  setSubjectInput(starter.subject);
                  onSelectTool(starter.tool, starter.title, starter.subject);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{starter.title}</span>
                <span className="font-mono text-[10px] font-bold text-[#E05A2B] uppercase">
                  [{starter.toolLabel}]
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8 Authoring Suites Grid */}
      <div id="authoring-suites-grid" className="space-y-6">
        <div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
            Specialized Authoring Suites
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-normal">
            Select an authoring engine below to launch the dedicated studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:border-stone-400 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-900 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-[#E05A2B]" />
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-stone-600 uppercase px-2.5 py-1 bg-stone-100 rounded-full">
                      <Award className="w-3 h-3 text-[#E05A2B]" />
                      <span>{tool.credits} Credits</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[11px] font-bold uppercase text-[#E05A2B]">
                      {tool.badge}
                    </span>
                    <h3 className="font-display font-black text-lg uppercase text-stone-900 leading-tight">
                      {tool.title}
                    </h3>
                  </div>

                  <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tool.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-stone-200 text-[10px] font-mono text-stone-600 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunch(tool.id)}
                  className="w-full py-3 rounded-2xl bg-[#18181B] group-hover:bg-[#E05A2B] text-white font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <span>Launch Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
