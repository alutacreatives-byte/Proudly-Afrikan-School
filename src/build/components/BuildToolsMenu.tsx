import React from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  FileCheck, 
  Network, 
  BookOpen, 
  Presentation 
} from 'lucide-react';

export const BUILD_TOOLS_LIST = [
  { id: 'course', num: '01', title: 'Course Syllabus Builder', badge: 'CURRICULUM & MODULES', icon: GraduationCap, desc: 'Design multi-week academic course modules with learning outcomes, pacing, and capstone projects.' },
  { id: 'classroompack', num: '02', title: 'Exam & Quiz Generator', badge: 'ASSESSMENT & TESTING', icon: HelpCircle, desc: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.' },
  { id: 'worksheet', num: '03', title: 'Worksheet Generator', badge: 'PRACTICE & EXERCISES', icon: FileCheck, desc: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.' },
  { id: 'mindmap', num: '04', title: 'Mind Map Generator', badge: 'VISUAL HIERARCHY', icon: Network, desc: 'Transform topics, notes, or uploaded documents into interactive, editable visual mind maps with branching concepts.' },
  { id: 'lessonplan', num: '05', title: 'Lesson Plan Generator', badge: 'TEACHING & PEDAGOGY', icon: BookOpen, desc: 'Create pedagogical lesson plans with timed phases, Bloom’s taxonomy objectives, and assessment checks.' },
  { id: 'presentation', num: '06', title: 'Presentation Generator', badge: 'SLIDES & LECTURE', icon: Presentation, desc: 'Generate structured slide outlines with presenter notes, discussion prompts, and visual cues.' },
];

interface BuildToolsMenuProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

export const BuildToolsMenu: React.FC<BuildToolsMenuProps> = ({ activeTool, onSelectTool }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/80">
      {BUILD_TOOLS_LIST.map(tool => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelectTool(tool.id)}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-[#FF7A00] via-[#D09500] to-[#A67A00] text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tool.title}</span>
          </button>
        );
      })}
    </div>
  );
};

