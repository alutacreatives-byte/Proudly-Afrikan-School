import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  Trash2,
  ArrowRight,
  FileQuestion,
  FileSpreadsheet,
  BookOpen,
  Presentation,
  GraduationCap,
  Compass,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { getSavedResources, deleteResourceFromStorage } from '../utils/storage';
import { GlobalNavigationButtons } from '../../components/GlobalNavigationButtons';

interface BuildMyResourcesProps {
  onBack: () => void;
  onGoHome?: () => void;
  onOpenResource: (resource: any) => void;
}

export const BuildMyResources: React.FC<BuildMyResourcesProps> = ({
  onBack,
  onGoHome,
  onOpenResource,
}) => {
  const [resources, setResources] = useState<any[]>(getSavedResources());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteResourceFromStorage(id);
    setResources(getSavedResources());
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'exam':
        return <FileQuestion className="w-4 h-4 text-[#E05A2B]" />;
      case 'worksheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'lesson-plan':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'presentation':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'learning-path':
        return <Compass className="w-4 h-4 text-teal-600" />;
      case 'pdf-studypack':
      case 'pdf-quiz':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Layers className="w-4 h-4 text-stone-600" />;
    }
  };

  const getToolBadgeLabel = (toolType: string) => {
    switch (toolType) {
      case 'exam':
        return 'Exam Paper';
      case 'worksheet':
        return 'Worksheet';
      case 'lesson-plan':
        return 'Lesson Plan';
      case 'presentation':
        return 'Slide Deck';
      case 'course':
        return 'Course Syllabus';
      case 'learning-path':
        return 'Learning Path';
      case 'pdf-studypack':
        return 'Study Pack';
      case 'pdf-quiz':
        return 'PDF Quiz';
      default:
        return toolType.toUpperCase();
    }
  };

  const filtered = resources.filter((res) => {
    const matchesSearch =
      (res.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || res.toolType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <span className="font-mono text-xs font-bold text-stone-500 uppercase">
          Build • Saved Library ({resources.length})
        </span>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
            My Authored Build Resources
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Access, review, print, and export your authored examinations, worksheets, lesson plans, slide decks, and syllabi.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search authored resources..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E05A2B]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'exam', label: 'Exam Papers' },
          { id: 'worksheet', label: 'Worksheets' },
          { id: 'lesson-plan', label: 'Lesson Plans' },
          { id: 'presentation', label: 'Slide Decks' },
          { id: 'course', label: 'Courses' },
          { id: 'learning-path', label: 'Learning Paths' },
          { id: 'pdf-studypack', label: 'Study Packs' },
          { id: 'pdf-quiz', label: 'PDF Quizzes' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
          <FolderOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-display font-black text-lg uppercase text-stone-700">
            {searchQuery || filterType !== 'all' ? 'No Matching Resources' : 'No Authored Resources Yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchQuery || filterType !== 'all'
              ? 'Try changing your search query or selected filter category.'
              : 'Use the authoring suite tools in the Build workspace to generate your first examination paper, worksheet, lesson plan, or course syllabus.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-full bg-[#E05A2B] hover:bg-[#c94d22] text-white font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>Launch Authoring Suite</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenResource(item)}
              className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-stone-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-mono text-[11px] font-bold uppercase">
                    {getToolIcon(item.toolType)}
                    <span>{getToolBadgeLabel(item.toolType)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete resource"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-black text-base uppercase text-stone-900 group-hover:text-[#E05A2B] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="font-mono text-xs text-stone-500 uppercase">
                    {item.subject}
                    {item.topic && ` • ${item.topic}`}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                </span>
                <span className="font-display font-bold text-xs uppercase text-[#E05A2B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
