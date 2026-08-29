import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Trash2, 
  Copy, 
  Download, 
  Clock, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { StorageService } from '../study/services/storageService';
import { getRecentQuizzes, saveRecentQuiz } from '../quiz/utils/quizShare';
import { getSavedResources, saveResourceToStorage, deleteResourceFromStorage } from '../build/utils/storage';
import { StudySet } from '../study/types';
import { Quiz } from '../quiz/types';
import { SavedResource } from '../build/types';

export type ContentKind = 'all' | 'study-set' | 'quiz' | 'build';

export interface UnifiedItem {
  id: string;
  kind: ContentKind;
  kindLabel: string;
  title: string;
  description: string;
  categoryOrSubject: string;
  createdAt: string;
  itemCount?: number;
  itemCountLabel?: string;
  durationMinutes?: number;
  originalStudySet?: StudySet;
  originalQuiz?: Quiz;
  originalBuildResource?: SavedResource;
}

interface MySetsWorkspaceProps {
  onOpenStudySet: (set: StudySet, view?: 'study' | 'flashcards' | 'practice') => void;
  onOpenQuiz: (quiz: Quiz) => void;
  onOpenBuildResource?: (resource: SavedResource) => void;
  onNavigateToStudy: () => void;
  onNavigateToQuiz: () => void;
  onNavigateToBuild?: () => void;
  onAddToPlanner?: (item: UnifiedItem) => void;
}

export const MySetsWorkspace: React.FC<MySetsWorkspaceProps> = ({
  onOpenStudySet,
  onOpenQuiz,
  onOpenBuildResource,
  onNavigateToStudy,
  onNavigateToQuiz,
  onNavigateToBuild,
}) => {
  const [selectedKind, setSelectedKind] = useState<ContentKind>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Loaded items
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [buildResources, setBuildResources] = useState<SavedResource[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const loadAllContent = () => {
    try {
      const sets = StorageService.getAllStudySets();
      setStudySets(sets);
    } catch (e) {
      console.warn('Failed loading study sets', e);
    }

    try {
      const qs = getRecentQuizzes();
      setQuizzes(qs);
    } catch (e) {
      console.warn('Failed loading quizzes', e);
    }

    try {
      const bResources = getSavedResources();
      setBuildResources(bResources);
    } catch (e) {
      console.warn('Failed loading build resources', e);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert all distinct data types into Unified Items
  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = [];

    // Study Sets
    studySets.forEach((set) => {
      items.push({
        id: `study-${set.id}`,
        kind: 'study-set',
        kindLabel: 'Study Set',
        title: set.title,
        description: set.description || 'Interactive concept breakdown with active recall flashcards.',
        categoryOrSubject: set.category || 'General Curriculum',
        createdAt: set.createdAt || new Date().toISOString(),
        itemCount: set.concepts?.length || 0,
        itemCountLabel: `${set.concepts?.length || 0} Concepts`,
        durationMinutes: set.estimatedMinutes || (set.concepts?.length || 1) * 3,
        originalStudySet: set,
      });
    });

    // Quizzes
    quizzes.forEach((quiz) => {
      items.push({
        id: `quiz-${quiz.id}`,
        kind: 'quiz',
        kindLabel: 'Quiz Assessment',
        title: quiz.title,
        description: quiz.description || `Assessment on ${quiz.topicOrSource || 'custom topic'}.`,
        categoryOrSubject: quiz.settings?.subject || 'General Knowledge',
        createdAt: quiz.createdAt || new Date().toISOString(),
        itemCount: quiz.questions?.length || 0,
        itemCountLabel: `${quiz.questions?.length || 0} Questions`,
        durationMinutes: (quiz.questions?.length || 5) * 2,
        originalQuiz: quiz,
      });
    });

    // Build Resources (Exams, Worksheets, Lesson Plans, Courses, etc.)
    buildResources.forEach((res) => {
      let kindLabel = 'Build Resource';
      let itemCountLabel = 'Complete Document';
      if (res.toolType === 'exam') kindLabel = 'Exam Paper';
      else if (res.toolType === 'worksheet') kindLabel = 'Worksheet';
      else if (res.toolType === 'lesson-plan') kindLabel = 'Lesson Plan';
      else if (res.toolType === 'pdf-quiz') kindLabel = 'PDF Quiz';
      else if (res.toolType === 'pdf-studypack') kindLabel = 'Study Pack';
      else if (res.toolType === 'presentation') kindLabel = 'Slide Deck';
      else if (res.toolType === 'course-builder') kindLabel = 'Curriculum Course';
      else if (res.toolType === 'learning-path') kindLabel = 'Learning Path';

      items.push({
        id: `build-${res.id}`,
        kind: 'build',
        kindLabel,
        title: res.title,
        description: `${res.gradeLevel ? `${res.gradeLevel} · ` : ''}${res.topic ? `Topic: ${res.topic}` : 'Created with Proudly Afrikan Build.'}`,
        categoryOrSubject: res.subject || 'Curriculum',
        createdAt: res.createdAt || new Date().toISOString(),
        itemCount: 1,
        itemCountLabel,
        durationMinutes: 30,
        originalBuildResource: res,
      });
    });

    return items;
  }, [studySets, quizzes, buildResources]);

  // Unique subjects for filter
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    unifiedItems.forEach((i) => {
      if (i.categoryOrSubject) set.add(i.categoryOrSubject);
    });
    return ['ALL', ...Array.from(set)];
  }, [unifiedItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      // Kind filter
      if (selectedKind !== 'all' && item.kind !== selectedKind) {
        return false;
      }
      // Subject filter
      if (selectedSubject !== 'ALL' && item.categoryOrSubject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryOrSubject.toLowerCase().includes(q) ||
          item.kindLabel.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [unifiedItems, selectedKind, selectedSubject, searchQuery, sortBy]);

  // Delete handler
  const handleDeleteItem = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    if (item.kind === 'study-set' && item.originalStudySet) {
      StorageService.deleteStudySet(item.originalStudySet.id);
      showToast('Study set removed.');
    } else if (item.kind === 'quiz' && item.originalQuiz) {
      const qs = quizzes.filter(q => q.id !== item.originalQuiz?.id);
      localStorage.setItem('proudly_afrikan_recent_quizzes', JSON.stringify(qs));
      showToast('Quiz removed.');
    } else if (item.kind === 'build' && item.originalBuildResource) {
      deleteResourceFromStorage(item.originalBuildResource.id);
      showToast('Build resource removed.');
    }
    loadAllContent();
  };

  // Duplicate handler
  const handleDuplicateItem = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.kind === 'study-set' && item.originalStudySet) {
      const dup: StudySet = {
        ...item.originalStudySet,
        id: `set-${Date.now()}`,
        title: `${item.originalStudySet.title} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveStudySet(dup);
      showToast('Study set duplicated.');
    } else if (item.kind === 'quiz' && item.originalQuiz) {
      const dup: Quiz = {
        ...item.originalQuiz,
        id: `quiz_${Date.now()}`,
        title: `${item.originalQuiz.title} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      saveRecentQuiz(dup);
      showToast('Quiz duplicated.');
    } else if (item.kind === 'build' && item.originalBuildResource) {
      const dup: SavedResource = {
        ...item.originalBuildResource,
        id: `res-${Date.now()}`,
        title: `${item.originalBuildResource.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveResourceToStorage(dup);
      showToast('Build resource duplicated.');
    }
    loadAllContent();
  };

  // Export JSON handler
  const handleExportJson = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const data = item.originalStudySet || item.originalQuiz || item.originalBuildResource;
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON file.');
  };

  // Open item
  const handleOpenItem = (item: UnifiedItem) => {
    if (item.kind === 'study-set' && item.originalStudySet) {
      onOpenStudySet(item.originalStudySet, 'study');
    } else if (item.kind === 'quiz' && item.originalQuiz) {
      onOpenQuiz(item.originalQuiz);
    } else if (item.kind === 'build' && item.originalBuildResource) {
      if (onOpenBuildResource) {
        onOpenBuildResource(item.originalBuildResource);
      } else if (onNavigateToBuild) {
        onNavigateToBuild();
      }
    }
  };

  // Badge Color Style
  const getBadgeStyle = (kind: ContentKind) => {
    switch (kind) {
      case 'study-set':
        return 'bg-[#FDEAF4] text-[#D92B8A] border-[#F7B5D8]';
      case 'quiz':
        return 'bg-[#FFF3EC] text-[#E05A2B] border-[#FFD0B8]';
      case 'build':
        return 'bg-[#FFF0F2] text-[#E6425E] border-[#FFCCD4]';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getPlatformIcon = (kind: ContentKind) => {
    switch (kind) {
      case 'study-set':
        return <BookOpen className="w-4 h-4 text-[#D92B8A]" />;
      case 'quiz':
        return <GraduationCap className="w-4 h-4 text-[#E05A2B]" />;
      case 'build':
        return <Layers className="w-4 h-4 text-[#E6425E]" />;
      default:
        return <Layers className="w-4 h-4 text-[#C92A45]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toast */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 bg-[#161616] text-white px-4 py-2.5 rounded-xl shadow-xl font-mono text-xs flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-[#D92B8A]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#1A1A1A] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D92B8A]">
              <FolderOpen className="w-4 h-4" />
              <span>UNIFIED KNOWLEDGE REPOSITORY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#161616] uppercase">
              MY SETS & SAVED RESOURCES
            </h1>
            <p className="text-stone-600 text-sm sm:text-base max-w-2xl font-body">
              Your central workspace containing all created study sets, active recall flashcards, interactive quizzes, and generated educational materials across Proudly Afrikan School.
            </p>
          </div>

          {/* Quick Create Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToStudy}
              className="tactile-btn bg-[#FAF7F0] hover:bg-[#FDEAF4] text-[#161616] font-display font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>+ STUDY SET</span>
            </button>
            <button
              onClick={onNavigateToQuiz}
              className="tactile-btn bg-[#161616] text-white hover:bg-stone-800 font-display font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 text-[#E05A2B]" />
              <span>+ QUIZ</span>
            </button>
            {onNavigateToBuild && (
              <button
                onClick={onNavigateToBuild}
                className="tactile-btn bg-[#FAF7F0] hover:bg-[#FFF0F2] text-[#161616] font-display font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 text-[#E6425E]" />
                <span>+ BUILD RESOURCE</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-stone-500 uppercase">Total Resources</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{unifiedItems.length}</div>
          </div>
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-[#D92B8A] uppercase">Study Sets</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{studySets.length}</div>
          </div>
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-[#E05A2B] uppercase">Quizzes</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{quizzes.length}</div>
          </div>
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-[#E6425E] uppercase">Builds</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{buildResources.length}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#1A1A1A] space-y-4">
          {/* Search and Sort controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search all sets, quizzes, exams, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm font-mono font-semibold text-[#161616] focus:outline-none focus:bg-white transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Subject Selector */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
              >
                {subjectsList.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === 'ALL' ? 'ALL SUBJECTS' : sub}
                  </option>
                ))}
              </select>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
              >
                <option value="newest">NEWEST FIRST</option>
                <option value="oldest">OLDEST FIRST</option>
                <option value="title">TITLE (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Kind Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono font-bold no-scrollbar">
            {[
              { id: 'all', label: 'All Content' },
              { id: 'study-set', label: 'Study Sets' },
              { id: 'quiz', label: 'Quizzes' },
              { id: 'build', label: 'Build Resources' },
            ].map((tab) => {
              const count = tab.id === 'all' 
                ? unifiedItems.length 
                : unifiedItems.filter(i => i.kind === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedKind(tab.id as ContentKind)}
                  className={`px-3.5 py-1.5 rounded-xl border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedKind === tab.id
                      ? 'bg-[#161616] text-white border-[#161616] shadow-[2px_2px_0px_#D92B8A]'
                      : 'bg-[#FAF7F0] text-stone-700 border-[#1A1A1A] hover:bg-stone-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    selectedKind === tab.id ? 'bg-[#D92B8A] text-white' : 'bg-stone-200 text-stone-800'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-12 text-center shadow-[3px_3px_0px_#1A1A1A] space-y-4">
            <FolderOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-display font-black uppercase text-[#161616]">No Content Found</h3>
            <p className="text-xs sm:text-sm font-mono text-stone-500 max-w-md mx-auto">
              No matching resources found for this filter. Create a new study set, generate an interactive quiz, or create a build resource.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={onNavigateToStudy}
                className="tactile-btn bg-[#D92B8A] text-white px-4 py-2 rounded-xl text-xs font-display font-black uppercase cursor-pointer"
              >
                Open Study Builder
              </button>
              <button
                onClick={onNavigateToQuiz}
                className="tactile-btn bg-[#E05A2B] text-white px-4 py-2 rounded-xl text-xs font-display font-black uppercase cursor-pointer"
              >
                Open Quiz Builder
              </button>
              {onNavigateToBuild && (
                <button
                  onClick={onNavigateToBuild}
                  className="tactile-btn bg-[#E6425E] text-white px-4 py-2 rounded-xl text-xs font-display font-black uppercase cursor-pointer"
                >
                  Open Resource Builder
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-5 shadow-[3.5px_3.5px_0px_#1A1A1A] hover:shadow-[5.5px_5.5px_0px_#1A1A1A] hover:-translate-y-0.5 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Badge & Type */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getBadgeStyle(item.kind)} flex items-center gap-1.5`}>
                        {getPlatformIcon(item.kind)}
                        <span>{item.kindLabel}</span>
                      </span>

                      <span className="text-[11px] font-mono font-bold text-stone-500">
                        {item.itemCountLabel}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-black text-lg text-[#161616] group-hover:text-[#D92B8A] transition-colors line-clamp-2 leading-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="font-body text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Info & Actions */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                      <span className="truncate max-w-[160px] font-bold text-stone-700">
                        {item.categoryOrSubject}
                      </span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateItem(item, e)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Duplicate Item"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportJson(item, e)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Export as JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(item, e)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Primary Open Trigger */}
                      <span className="text-xs font-display font-black text-[#161616] group-hover:text-[#D92B8A] flex items-center gap-1 uppercase tracking-wider">
                        <span>OPEN</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
