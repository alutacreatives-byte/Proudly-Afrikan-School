import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Search,
  Plus,
  Trash2,
  Copy,
  Star,
  FileCheck2,
  FileSpreadsheet,
  CalendarCheck2,
  FileQuestion,
  BookOpenCheck,
  Presentation,
  GraduationCap,
  Compass,
  ArrowRight,
  Clock,
  Download,
} from 'lucide-react';
import { SavedResource, ToolType } from '../types';

interface MyResourcesProps {
  resources: SavedResource[];
  onOpenResource: (resource: SavedResource) => void;
  onDeleteResource: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicateResource: (resource: SavedResource) => void;
  onStartNewBuild: () => void;
}

const TOOL_ICONS: Record<ToolType, React.ElementType> = {
  exam: FileCheck2,
  worksheet: FileSpreadsheet,
  'lesson-plan': CalendarCheck2,
  'pdf-quiz': FileQuestion,
  'pdf-studypack': BookOpenCheck,
  presentation: Presentation,
  'course-builder': GraduationCap,
  'learning-path': Compass,
};

const TOOL_LABELS: Record<ToolType, string> = {
  exam: 'Exam',
  worksheet: 'Worksheet',
  'lesson-plan': 'Lesson Plan',
  'pdf-quiz': 'PDF Quiz',
  'pdf-studypack': 'Study Pack',
  presentation: 'Presentation',
  'course-builder': 'Course',
  'learning-path': 'Learning Path',
};

export const MyResources: React.FC<MyResourcesProps> = ({
  resources,
  onOpenResource,
  onDeleteResource,
  onToggleFavorite,
  onDuplicateResource,
  onStartNewBuild,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.topic?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTool =
        selectedToolFilter === 'all' || res.toolType === selectedToolFilter;

      const matchesFav = !favoritesOnly || res.isFavorite;

      return matchesSearch && matchesTool && matchesFav;
    });
  }, [resources, searchQuery, selectedToolFilter, favoritesOnly]);

  const handleExportJson = (resource: SavedResource) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resource, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D63651]"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D63651]">
              SAVED BUILDS & MATERIALS
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase text-stone-900 tracking-tight">
            MY RESOURCE VAULT
          </h1>
          <p className="text-sm font-mono text-stone-600 mt-1">
            {resources.length} {resources.length === 1 ? 'educational resource' : 'educational resources'} built & stored locally
          </p>
        </div>

        <button
          onClick={onStartNewBuild}
          className="clay-btn-crimson px-5 py-3 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>NEW BUILD</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved resources by title, subject, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 font-mono text-xs sm:text-sm focus:outline-none focus:border-[#D63651] focus:ring-1 focus:ring-[#D63651]"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={selectedToolFilter}
              onChange={(e) => setSelectedToolFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono text-xs font-bold focus:outline-none focus:border-[#D63651]"
            >
              <option value="all">All Tool Types</option>
              <option value="exam">Exams</option>
              <option value="worksheet">Worksheets</option>
              <option value="lesson-plan">Lesson Plans</option>
              <option value="pdf-quiz">PDF Quizzes</option>
              <option value="pdf-studypack">Study Packs</option>
              <option value="presentation">Presentations</option>
              <option value="course-builder">Courses</option>
              <option value="learning-path">Learning Paths</option>
            </select>

            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer ${
                favoritesOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
              title="Show Favorites Only"
            >
              <Star className={`w-4 h-4 ${favoritesOnly ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const Icon = TOOL_ICONS[res.toolType] || FolderOpen;
            const toolLabel = TOOL_LABELS[res.toolType] || res.toolType;

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-stone-300 transition group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#181716] text-[#FAF7F0] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#D63651]" />
                      </div>
                      <span className="px-2.5 py-0.5 bg-stone-100 border border-stone-200 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider text-stone-700">
                        {toolLabel}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(res.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 transition cursor-pointer"
                      title={res.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          res.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Topic */}
                  <h3
                    onClick={() => onOpenResource(res)}
                    className="font-display font-bold text-lg text-stone-900 group-hover:text-[#D63651] transition cursor-pointer line-clamp-2 mb-1.5"
                  >
                    {res.title}
                  </h3>

                  <p className="font-mono text-xs text-stone-500 mb-3 flex items-center gap-2">
                    <span className="text-stone-700 font-bold">{res.subject}</span>
                    {res.gradeLevel && <span>• {res.gradeLevel}</span>}
                  </p>
                </div>

                {/* Bottom Footer Actions */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicateResource(res)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                      title="Duplicate Resource"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportJson(res)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteResource(res.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenResource(res)}
                      className="ml-1 px-3 py-1.5 rounded-lg bg-[#181716] text-white font-mono text-xs font-bold hover:bg-[#D63651] transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>OPEN</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-10 sm:p-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-stone-900 uppercase">
              {searchQuery || selectedToolFilter !== 'all' || favoritesOnly
                ? 'No matching resources found'
                : 'No saved resources yet'}
            </h3>
            <p className="font-mono text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {searchQuery || selectedToolFilter !== 'all' || favoritesOnly
                ? 'Try adjusting your search terms or filter selection.'
                : 'Generate exams, worksheets, lesson plans, study packs, or courses to store them in your vault.'}
            </p>
          </div>
          <button
            onClick={onStartNewBuild}
            className="clay-btn-crimson px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            CREATE FIRST RESOURCE
          </button>
        </div>
      )}
    </div>
  );
};
