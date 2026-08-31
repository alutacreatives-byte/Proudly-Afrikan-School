import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Download, 
  ArrowLeft, 
  FileText, 
  Layers, 
  GitBranch, 
  BookOpen, 
  Presentation, 
  GraduationCap, 
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { SavedResource, BuildToolType } from '../types';
import { getSavedResources, deleteResourceFromStorage, exportResourceAsJson } from '../utils/storage';

interface MyResourcesProps {
  onBack: () => void;
  onOpenResource: (resource: SavedResource) => void;
}

export const MyResources: React.FC<MyResourcesProps> = ({
  onBack,
  onOpenResource,
}) => {
  const [resources, setResources] = useState<SavedResource[]>(getSavedResources());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this saved build?')) {
      deleteResourceFromStorage(id);
      setResources(getSavedResources());
    }
  };

  const handleExport = (resource: SavedResource, e: React.MouseEvent) => {
    e.stopPropagation();
    exportResourceAsJson(resource);
  };

  const filteredResources = resources.filter((res) => {
    const matchesType = filterType === 'all' || res.toolType === filterType;
    const matchesSearch = !searchQuery.trim() || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (res.subject && res.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getToolIcon = (type: BuildToolType) => {
    switch (type) {
      case 'exam': return FileText;
      case 'worksheet': return Layers;
      case 'mind-map': return GitBranch;
      case 'lesson-plan': return BookOpen;
      case 'pdf-studypack': return FileText;
      case 'presentation': return Presentation;
      case 'course-builder': return GraduationCap;
      case 'learning-path': return Compass;
      default: return FileText;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D8] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#161616] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Build Studio
        </button>

        <div className="px-4 py-1.5 bg-[#161616] text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
          Saved Builds Repository ({resources.length})
        </div>
      </div>

      {/* Header & Controls */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#161616]">
              My Saved Resources
            </h1>
            <p className="font-sans text-xs text-stone-600">
              Access, export, and continue editing your saved examinations, worksheets, mind maps, and study packs.
            </p>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved resources..."
            className="px-4 py-2 bg-stone-50 border border-stone-300 rounded-full text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] w-full sm:w-64"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'exam', label: 'Exams' },
            { id: 'worksheet', label: 'Worksheets' },
            { id: 'mind-map', label: 'Mind Maps' },
            { id: 'pdf-studypack', label: 'Study Packs' },
            { id: 'lesson-plan', label: 'Lesson Plans' },
            { id: 'presentation', label: 'Slide Decks' },
            { id: 'course-builder', label: 'Courses' },
            { id: 'learning-path', label: 'Roadmaps' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#161616] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const Icon = getToolIcon(res.toolType);
            return (
              <div
                key={res.id}
                onClick={() => onOpenResource(res)}
                className="bg-white border border-[#E5E0D8] hover:border-[#161616] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#161616] text-[#D92B8A] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono font-bold uppercase text-stone-500">
                        {res.toolType.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-600">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-black text-base text-[#161616] uppercase group-hover:text-[#D92B8A] transition-colors line-clamp-2">
                      {res.title}
                    </h3>
                    {res.subject && (
                      <p className="font-sans text-xs text-stone-600 mt-1">
                        {res.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleExport(res, e)}
                      className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-black cursor-pointer"
                      title="Export as JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(res.id, e)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-stone-600 hover:text-red-600 cursor-pointer"
                      title="Delete from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-bold text-[#D92B8A] flex items-center gap-1">
                    Open Resource <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm min-h-[300px]">
          <Bookmark className="w-10 h-10 text-stone-300" />
          <h3 className="font-display font-black text-base uppercase text-[#161616]">
            No Saved Builds Found
          </h3>
          <p className="font-sans text-xs text-stone-500 max-w-sm">
            Generate and save exams, worksheets, mind maps, or study packs in the Build suite to access them here anytime.
          </p>
        </div>
      )}
    </div>
  );
};
