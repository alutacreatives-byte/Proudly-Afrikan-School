import React, { useState } from 'react';
import { 
  FolderOpen, 
  Search, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  FileCheck,
  FileSpreadsheet,
  BookOpen,
  GitBranch,
  Presentation,
  GraduationCap,
  Compass,
  FileText
} from 'lucide-react';
import { SavedResource, BuildToolType } from '../types';
import { getSavedResources, deleteResourceFromStorage } from '../utils/storage';

interface MyResourcesProps {
  onBack: () => void;
  onOpenResource: (resource: SavedResource) => void;
}

export const MyResources: React.FC<MyResourcesProps> = ({
  onBack,
  onOpenResource,
}) => {
  const [resources, setResources] = useState<SavedResource[]>(getSavedResources());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteResourceFromStorage(id);
    setResources(getSavedResources());
  };

  const getToolIcon = (toolType: BuildToolType) => {
    switch (toolType) {
      case 'exam': return <FileCheck className="w-4 h-4 text-[#E63956]" />;
      case 'worksheet': return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'lesson-plan': return <BookOpen className="w-4 h-4 text-sky-600" />;
      case 'mind-map': return <GitBranch className="w-4 h-4 text-purple-600" />;
      case 'presentation': return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'course': return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'learning-path': return <Compass className="w-4 h-4 text-teal-600" />;
      case 'pdf-studypack': return <FileText className="w-4 h-4 text-rose-600" />;
      default: return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  const filtered = resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res as any).subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || res.toolType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              My Saved Builds ({resources.length})
            </h1>
            <p className="font-sans text-xs sm:text-sm text-stone-500">
              Access and manage all saved exams, worksheets, lesson plans, mind maps, and study packs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved builds..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-display font-black text-lg text-[#161616] uppercase">
              No Saved Builds Found
            </h3>
            <p className="font-sans text-xs text-stone-500">
              When you generate exams, lesson plans, mind maps, or worksheets, click "Save Build" to store them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenResource(item)}
              className="bg-white border border-stone-200 hover:border-[#E63956]/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getToolIcon(item.toolType)}
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      {item.toolType.replace('-', ' ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-display font-black text-base text-[#161616] uppercase line-clamp-2 group-hover:text-[#E63956] transition-colors">
                  {item.title}
                </h3>

                {(item as any).subject && (
                  <div className="font-mono text-xs text-stone-600">
                    Subject: {(item as any).subject}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-stone-400 text-xs font-mono">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <span className="text-[#E63956] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
