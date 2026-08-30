import React, { useState, useEffect } from 'react';
import { ToolGrid } from './components/ToolGrid';
import { MyResources } from './components/MyResources';

// 8 Core Generators
import { ExamGenerator } from './components/generators/ExamGenerator';
import { WorksheetGenerator } from './components/generators/WorksheetGenerator';
import { LessonPlanGenerator } from './components/generators/LessonPlanGenerator';
import { PdfQuizGenerator } from './components/generators/PdfQuizGenerator';
import { PdfStudyPackGenerator } from './components/generators/PdfStudyPackGenerator';
import { PresentationGenerator } from './components/generators/PresentationGenerator';
import { CourseBuilder } from './components/generators/CourseBuilder';
import { LearningPathBuilder } from './components/generators/LearningPathBuilder';

import {
  ToolType,
  SavedResource,
  ExamResource,
  WorksheetResource,
  LessonPlanResource,
  PdfQuizResource,
  PdfStudyPackResource,
  PresentationResource,
  CourseResource,
  LearningPathResource,
} from './types';
import {
  getSavedResources,
  saveResourceToStorage,
  deleteResourceFromStorage,
  toggleFavoriteResource,
} from './utils/storage';
import { Sparkles } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'studio' | 'resources'>('studio');
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Storage State
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [editingResource, setEditingResource] = useState<SavedResource | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getSavedResources();
    setSavedResources(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSelectTool = (toolId: ToolType, initialTopic?: string) => {
    setEditingResource(null);
    setSelectedTopic(initialTopic || '');
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToSection = (sectionId: string) => {
    setActiveTool(null);
    setActiveTab('studio');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Generic Save Handler for any resource type
  const handleSaveResource = (
    resourceData:
      | ExamResource
      | WorksheetResource
      | LessonPlanResource
      | PdfQuizResource
      | PdfStudyPackResource
      | PresentationResource
      | CourseResource
      | LearningPathResource,
    toolType: ToolType
  ) => {
    const now = new Date().toISOString();
    const newSaved: SavedResource = {
      id: resourceData.id || `res-${Date.now()}`,
      title: resourceData.title,
      toolType,
      subject: (resourceData as any).subject || 'Educational Resource',
      topic: (resourceData as any).topic || (resourceData as any).sourceDocumentName || (resourceData as any).goal || '',
      gradeLevel: (resourceData as any).gradeLevel || (resourceData as any).targetAudience || 'General',
      createdAt: (resourceData as any).createdAt || now,
      updatedAt: now,
      tags: [(resourceData as any).subject || 'Build', toolType],
      data: resourceData,
      isFavorite: editingResource?.isFavorite || false,
    };

    saveResourceToStorage(newSaved);
    setSavedResources(getSavedResources());
    showToast(`Saved "${newSaved.title}" to My Builds!`);
  };

  const handleDeleteResource = (id: string) => {
    const updated = deleteResourceFromStorage(id);
    setSavedResources(updated);
    showToast('Resource deleted from My Builds.');
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteResource(id);
    setSavedResources(updated);
  };

  const handleDuplicateResource = (res: SavedResource) => {
    const duplicated: SavedResource = {
      ...res,
      id: `res-${Date.now()}`,
      title: `${res.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveResourceToStorage(duplicated);
    setSavedResources(getSavedResources());
    showToast(`Duplicated "${res.title}"`);
  };

  const handleOpenSavedResource = (res: SavedResource) => {
    setEditingResource(res);
    setActiveTool(res.toolType);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#181716] flex flex-col font-sans selection:bg-[#D63651] selection:text-white antialiased relative">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-[#FAF7F0] border border-black rounded-xl px-4 py-3 shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#D63651] animate-pulse"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Studio / Generator View */}
        {activeTab === 'studio' && (
          <>
            {activeTool === null ? (
              <ToolGrid onSelectTool={handleSelectTool} />
            ) : (
              <div>
                {activeTool === 'exam' && (
                  <ExamGenerator
                    initialTopic={selectedTopic}
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'exam')}
                    existingResource={editingResource?.data as ExamResource}
                  />
                )}
                {activeTool === 'worksheet' && (
                  <WorksheetGenerator
                    initialTopic={selectedTopic}
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'worksheet')}
                    existingResource={editingResource?.data as WorksheetResource}
                  />
                )}
                {activeTool === 'lesson-plan' && (
                  <LessonPlanGenerator
                    initialTopic={selectedTopic}
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'lesson-plan')}
                    existingResource={editingResource?.data as LessonPlanResource}
                  />
                )}
                {activeTool === 'pdf-quiz' && (
                  <PdfQuizGenerator
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'pdf-quiz')}
                    existingResource={editingResource?.data as PdfQuizResource}
                  />
                )}
                {activeTool === 'pdf-studypack' && (
                  <PdfStudyPackGenerator
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'pdf-studypack')}
                    existingResource={editingResource?.data as PdfStudyPackResource}
                  />
                )}
                {activeTool === 'presentation' && (
                  <PresentationGenerator
                    initialTopic={selectedTopic}
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'presentation')}
                    existingResource={editingResource?.data as PresentationResource}
                  />
                )}
                {activeTool === 'course-builder' && (
                  <CourseBuilder
                    initialTopic={selectedTopic}
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'course-builder')}
                    existingResource={editingResource?.data as CourseResource}
                  />
                )}
                {activeTool === 'learning-path' && (
                  <LearningPathBuilder
                    initialTopic={selectedTopic}
                    onBack={() => setActiveTool(null)}
                    onSave={(data) => handleSaveResource(data, 'learning-path')}
                    existingResource={editingResource?.data as LearningPathResource}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Tab 2: My Builds */}
        {activeTab === 'resources' && (
          <MyResources
            resources={savedResources}
            onOpenResource={handleOpenSavedResource}
            onDeleteResource={handleDeleteResource}
            onToggleFavorite={handleToggleFavorite}
            onDuplicateResource={handleDuplicateResource}
            onStartNewBuild={() => {
              setActiveTab('studio');
              setActiveTool(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
